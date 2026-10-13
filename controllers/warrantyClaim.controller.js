"use strict";

const { WarrantyClaim, User, Sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = Sequelize;

/**
 * Helper to optionally detect logged-in user from token without throwing 401
 */
const detectUserFromReq = async (req) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token || !process.env.JWT_SECRET) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return null;

    return await User.findByPk(decoded.id);
  } catch (err) {
    return null;
  }
};

/**
 * Helper to generate a unique human-friendly Warranty ID or Claim ID
 */
const generateClaimId = (claimType = "registration") => {
  const prefix = claimType === "claim" ? "FLZ-CLM" : "FLZ-WAR";
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
};

/**
 * 1. Public / User: Register Product or Submit Warranty Claim
 */
exports.createWarrantyClaim = async (req, res) => {
  try {
    const loggedUser = await detectUserFromReq(req);

    const {
      fullName,
      phone,
      email,
      serialNumber,
      orderId,
      productModel,
      claimType = "registration",
      issueDescription,
      purchaseDate,
      source = "support_warranty",
    } = req.body;

    const finalName = (fullName || loggedUser?.fullname || "").trim();
    const finalPhone = (phone || (loggedUser?.phoneNumber ? String(loggedUser.phoneNumber) : "")).trim();
    const finalSerial = (serialNumber || "").trim();
    const finalModel = (productModel || "").trim();
    const finalEmail = (email || loggedUser?.email || "").trim();
    const finalUserId = loggedUser ? loggedUser.id : null;

    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: "Customer Full Name is required.",
      });
    }

    if (!finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!finalSerial) {
      return res.status(400).json({
        success: false,
        message: "Serial number or Order ID is required.",
      });
    }

    if (!finalModel) {
      return res.status(400).json({
        success: false,
        message: "Product model is required.",
      });
    }

    // Set 1-Year Warranty Date Range
    const startDate = purchaseDate ? new Date(purchaseDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Initial Status:
    // Registration: 'approved' (Active 1-Year Warranty activated instantly)
    // Claim: 'pending' (Awaiting support technician verification)
    const initialStatus = claimType === "claim" ? "pending" : "approved";

    const claimId = generateClaimId(claimType);

    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "";

    const newClaim = await WarrantyClaim.create({
      claimId,
      fullName: finalName,
      phone: finalPhone,
      email: finalEmail || null,
      serialNumber: finalSerial,
      orderId: (orderId || finalSerial).trim(),
      productModel: finalModel,
      claimType,
      issueDescription: issueDescription ? issueDescription.trim() : null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      warrantyStartDate: startDate,
      warrantyEndDate: endDate,
      status: initialStatus,
      source,
      userId: finalUserId,
      ipAddress: String(clientIp).slice(0, 100),
    });

    return res.status(201).json({
      success: true,
      message:
        claimType === "claim"
          ? `Warranty claim submitted successfully under ticket #${claimId}. Our service concierge will reach out within 24 hours.`
          : `1-Year Warranty & Service activated successfully under ID #${claimId}.`,
      data: newClaim,
    });
  } catch (error) {
    console.error("Error creating warranty claim:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process warranty request",
    });
  }
};

/**
 * 2. Public: Check Warranty Status by Serial Number, Order ID, or Claim ID
 */
exports.checkWarrantyStatus = async (req, res) => {
  try {
    const query = (req.query.q || req.query.serial || req.query.orderId || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Serial Number, Order ID, or Claim ID to check warranty.",
      });
    }

    const claim = await WarrantyClaim.findOne({
      where: {
        [Op.or]: [
          { serialNumber: query },
          { orderId: query },
          { claimId: query },
          { phone: query },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    if (!claim) {
      return res.status(200).json({
        success: true,
        found: false,
        message: "No warranty record found matching this Serial Number or Order ID.",
      });
    }

    // Determine current validity based on endDate
    const now = new Date();
    const isExpired = claim.warrantyEndDate ? new Date(claim.warrantyEndDate) < now : false;

    return res.status(200).json({
      success: true,
      found: true,
      data: {
        claimId: claim.claimId,
        productModel: claim.productModel,
        serialNumber: claim.serialNumber,
        status: isExpired ? "Expired" : claim.status === "approved" ? "Active • 1-Year Warranty and Service" : claim.status,
        isExpired,
        warrantyStartDate: claim.warrantyStartDate,
        warrantyEndDate: claim.warrantyEndDate,
        coverage: "100% Hardware Defects, Driver Issues, Charging Case & Acoustic Integrity",
        createdAt: claim.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking warranty status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify warranty",
    });
  }
};

/**
 * 3. Admin: Get All Warranties & Claims with Filters, Search, and Live Stats
 */
exports.getAllWarrantiesAdmin = async (req, res) => {
  try {
    const { status, claimType, search } = req.query;

    const whereClause = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (claimType && claimType !== "all") {
      whereClause.claimType = claimType;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { fullName: { [Op.like]: q } },
        { phone: { [Op.like]: q } },
        { email: { [Op.like]: q } },
        { serialNumber: { [Op.like]: q } },
        { orderId: { [Op.like]: q } },
        { productModel: { [Op.like]: q } },
        { claimId: { [Op.like]: q } },
      ];
    }

    const warranties = await WarrantyClaim.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "email", "phoneNumber", "role", "avatar"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Compute Live Statistics across all records
    const allRecords = await WarrantyClaim.findAll({
      attributes: ["status", "claimType", "warrantyEndDate"],
    });

    const now = new Date();
    const stats = {
      total: allRecords.length,
      approvedCount: allRecords.filter((r) => r.status === "approved" && (!r.warrantyEndDate || new Date(r.warrantyEndDate) >= now)).length,
      pendingCount: allRecords.filter((r) => r.status === "pending").length,
      inReviewCount: allRecords.filter((r) => r.status === "in_review").length,
      resolvedCount: allRecords.filter((r) => r.status === "resolved").length,
      rejectedCount: allRecords.filter((r) => r.status === "rejected").length,
      expiredCount: allRecords.filter((r) => r.warrantyEndDate && new Date(r.warrantyEndDate) < now).length,
      registrationsCount: allRecords.filter((r) => r.claimType === "registration").length,
      claimsCount: allRecords.filter((r) => r.claimType === "claim" || r.claimType === "replacement").length,
    };

    return res.status(200).json({
      success: true,
      warranties,
      stats,
    });
  } catch (error) {
    console.error("Error fetching warranty claims admin:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load warranty claims",
    });
  }
};

/**
 * 4. Admin: Update Warranty Claim Status or Admin Notes
 */
exports.updateWarrantyStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, warrantyEndDate, claimType } = req.body;

    const claim = await WarrantyClaim.findByPk(id);
    if (!claim) {
      return res.status(400).json({
        success: false,
        message: "Warranty claim not found.",
      });
    }

    if (status) claim.status = status;
    if (adminNotes !== undefined) claim.adminNotes = adminNotes;
    if (claimType) claim.claimType = claimType;
    if (warrantyEndDate) claim.warrantyEndDate = new Date(warrantyEndDate);

    await claim.save();

    return res.status(200).json({
      success: true,
      message: "Warranty record updated successfully.",
      data: claim,
    });
  } catch (error) {
    console.error("Error updating warranty status admin:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update warranty status",
    });
  }
};

/**
 * 5. Admin: Delete Warranty Claim
 */
exports.deleteWarrantyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await WarrantyClaim.findByPk(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Warranty record not found.",
      });
    }

    await claim.destroy();

    return res.status(200).json({
      success: true,
      message: "Warranty record deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting warranty record admin:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete warranty record",
    });
  }
};
