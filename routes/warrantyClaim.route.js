"use strict";

const express = require("express");
const router = express.Router();
const warrantyController = require("../controllers/warrantyClaim.controller");

// Public endpoints
// POST /warranty -> Register product / Submit claim
router.post("/", warrantyController.createWarrantyClaim);
// GET /warranty/check -> Check warranty status by serial/orderId/claimId
router.get("/check", warrantyController.checkWarrantyStatus);

// Admin endpoints
// GET /warranty/admin -> List all claims with filters & live statistics
router.get("/admin", warrantyController.getAllWarrantiesAdmin);
// PATCH /warranty/admin/:id -> Update status, admin notes, validity
router.patch("/admin/:id", warrantyController.updateWarrantyStatusAdmin);
// DELETE /warranty/admin/:id -> Delete record
router.delete("/admin/:id", warrantyController.deleteWarrantyAdmin);

module.exports = router;
