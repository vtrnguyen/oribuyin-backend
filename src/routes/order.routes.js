const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize(["admin", "staff"]), orderController.getAllOrders);
router.get("/recent", authenticate, authorize(["admin", "staff"]), orderController.getRecentOrders);
router.get("/current-month-revenue", authenticate, authorize(["admin"]), orderController.getCurrentMonthRevenue);
router.get("/by-time-range", authenticate, authorize(["admin", "staff"]), orderController.getOrdersByTimeRange);
router.get("/:userId", authenticate, authorize(["admin", "staff", "customer"]), orderController.getAllOrdersByUserId);
router.post("/", authenticate, authorize(["customer"]), orderController.createOrder);
router.put("/:orderID/status", authenticate, authorize(["admin", "staff", "customer"]), orderController.updateOrderStatus);

module.exports = router;
