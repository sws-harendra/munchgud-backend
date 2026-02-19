const { ServiceArea } = require("../models");

exports.checkPincodeService = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
      });
    }

    const area = await ServiceArea.findOne({
      where: { pincode, isActive: true },
    });

    if (!area) {
      return res.status(200).json({
        success: false,
        message: "Sorry! Delivery not available in this area ❌",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery available ✅",
      area,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
