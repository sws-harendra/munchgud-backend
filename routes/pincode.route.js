const express = require("express");
const router = express.Router();

const { addPincode, getAllPincodes, updatePincode} = require("../controllers/pincode.controller");

// Admin Add Pincode API
router.post("/add", addPincode);

//Admin get pincode by API
router.get("/all", getAllPincodes);

//Admin put pincode by API
router.put("/update/:id", updatePincode);
module.exports = router;
