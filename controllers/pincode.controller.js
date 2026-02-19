const { Pincode } = require("../models");

exports.addPincode = async (req, res) => {
  try {
    const { code, city, state } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    // check already exists
    const existing = await Pincode.findOne({ where: { code } });

    if (existing) {
      return res.status(400).json({ message: "Pincode already exists" });
    }

    const newPincode = await Pincode.create({
      code,
      city,
      state,
    });

    res.status(201).json({
      message: "Pincode added successfully",
      data: newPincode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET
exports.getAllPincodes = async (req, res) => {
  try {
    const pincodes = await Pincode.findAll({
      where: {
        isDeleted: false, // only active pincodes
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "All pincodes fetched successfully",
      total: pincodes.length,
      data: pincodes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update pincode by Admin (PUT)
exports.updatePincode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, city, state, isActive } = req.body;

    // Find pincode
    const pincode = await Pincode.findOne({
      where: { id, isDeleted: false },
    });

    if (!pincode) {
      return res.status(404).json({
        message: "Pincode not found",
      });
    }

    // Update fields
    pincode.code = code || pincode.code;
    pincode.city = city || pincode.city;
    pincode.state = state || pincode.state;

    if (isActive !== undefined) {
      pincode.isActive = isActive;
    }

    await pincode.save();

    res.status(200).json({
      message: "Pincode updated successfully",
      data: pincode,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


