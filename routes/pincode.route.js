const express = require("express");
const router = express.Router();

const { addPincode, getAllPincodes, updatePincode, deletePincode} = require("../controllers/pincode.controller");

// Admin Add Pincode API
router.post("/add", addPincode);

//Admin get pincode by API
router.get("/all", getAllPincodes);

//Admin put pincode by API
router.put("/update/:id", updatePincode);

// Admin delete pincode API
router.delete("/delete/:id", deletePincode);

module.exports = router;
