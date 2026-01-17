const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const driverController = require("../controllers/driver.controller");
const router = express.Router();

// Admin
router.get(
  "/admin-all-drivers",
  isAuthenticated,
  isAdmin("admin"),
  driverController.getAllDrivers
);

module.exports = router;
