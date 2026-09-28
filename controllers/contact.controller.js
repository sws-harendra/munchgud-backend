"use strict";

const { ContactInquiry, User, Sequelize } = require("../models");
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
 * 1. Public / User: Submit Contact Inquiry or Concierge Chat Message
 */
exports.createContactInquiry = async (req, res) => {
  try {
    const loggedUser = await detectUserFromReq(req);

    const {
      name,
      email,
      phone,
      orderId,
      subject,
      message,
      source = "contact_form",
    } = req.body;

    // Resolve name & email if logged-in user omitted them
    const finalName = name || loggedUser?.fullname || "Anonymous User";
    const finalEmail = email || loggedUser?.email;
    const finalPhone = phone ? String(phone) : (loggedUser?.phoneNumber ? String(loggedUser.phoneNumber) : null);
    const finalUserId = loggedUser ? loggedUser.id : null;

    if (!finalEmail) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty.",
      });
    }

    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "";

    const inquiry = await ContactInquiry.create({
      name: finalName.trim(),
      email: finalEmail.trim().toLowerCase(),
      phone: finalPhone ? String(finalPhone).trim() : null,
      orderId: orderId ? String(orderId).trim() : null,
      subject: subject || (source === "live_concierge" ? "Live Concierge Chat" : "General Support"),
      message: message.trim(),
      source,
      status: "new",
      userId: finalUserId,
      ipAddress: String(clientIp).slice(0, 100),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received by Flazo Customer Support.",
      inquiry,
    });
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit inquiry",
    });
  }
};

/**
 * 2. Admin: Get All Inquiries with search, filters & user details
 */
exports.getAllInquiriesAdmin = async (req, res) => {
  try {
    const { status, source, search } = req.query;

    const whereClause = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (source && source !== "all") {
      whereClause.source = source;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: q } },
        { email: { [Op.like]: q } },
        { phone: { [Op.like]: q } },
        { orderId: { [Op.like]: q } },
        { message: { [Op.like]: q } },
        { subject: { [Op.like]: q } },
      ];
    }

    const inquiries = await ContactInquiry.findAll({
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

    // Compute stats
    const allInquiries = await ContactInquiry.findAll({ attributes: ["status", "source"] });
    const stats = {
      total: allInquiries.length,
      newCount: allInquiries.filter((i) => i.status === "new").length,
      inProgressCount: allInquiries.filter((i) => i.status === "in_progress").length,
      resolvedCount: allInquiries.filter((i) => i.status === "resolved").length,
      conciergeCount: allInquiries.filter((i) => i.source === "live_concierge").length,
      contactFormCount: allInquiries.filter((i) => i.source === "contact_form").length,
    };

    return res.status(200).json({
      success: true,
      inquiries,
      stats,
    });
  } catch (error) {
    console.error("Error fetching inquiries for admin:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contact inquiries",
    });
  }
};

/**
 * 3. Admin: Update Inquiry Status or Admin Notes
 */
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const inquiry = await ContactInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found",
      });
    }

    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update inquiry",
    });
  }
};

/**
 * 4. Admin: Delete Inquiry
 */
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await ContactInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found",
      });
    }

    await inquiry.destroy();

    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete inquiry",
    });
  }
};
