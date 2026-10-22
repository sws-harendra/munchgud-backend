"use strict";

const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { uploadInquiry } = require("../helpers/multerInquiry");

// Public / User endpoint (Supports auto-capturing user session if logged in & file attachment)
router.post("/", uploadInquiry.single("attachment"), contactController.createContactInquiry);

// Admin endpoints
router.get("/admin", contactController.getAllInquiriesAdmin);
router.patch("/admin/:id", contactController.updateInquiryStatus);
router.delete("/admin/:id", contactController.deleteInquiry);

module.exports = router;
