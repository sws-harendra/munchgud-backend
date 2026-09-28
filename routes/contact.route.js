"use strict";

const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Public / User endpoint (Supports auto-capturing user session if logged in)
router.post("/", contactController.createContactInquiry);

// Admin endpoints
router.get("/admin", contactController.getAllInquiriesAdmin);
router.patch("/admin/:id", contactController.updateInquiryStatus);
router.delete("/admin/:id", contactController.deleteInquiry);

module.exports = router;
