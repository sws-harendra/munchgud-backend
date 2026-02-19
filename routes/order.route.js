const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");

router.post("/place", isAuthenticated, orderController.createOrder);
router.get("/my-orders", isAuthenticated, orderController.getMyOrders);

router.get("/driver/my-orders", isAuthenticated, orderController.getDriverOrders);

router.get("/:orderId", isAuthenticated, orderController.getOrderById);
router.get(
  "/",
  isAuthenticated,
  isAdmin("admin"),
  orderController.getAllOrders
);
// routes/order.js
router.put( 
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  orderController.updateOrder
);
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  orderController.deleteOrder
);
module.exports = router;
