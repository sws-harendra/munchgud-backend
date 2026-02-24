const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const RazorpayCredential = require("../controllers/razorPay.controller");

router.post("/credentials", RazorpayCredential.addCredential);
router.get("/credentials/active", RazorpayCredential.getActiveCredential);
router.patch(
  "/credentials/:id/activate",
  RazorpayCredential.activateCredential
);
router.post("/order", RazorpayCredential.create_order);

module.exports = router;
