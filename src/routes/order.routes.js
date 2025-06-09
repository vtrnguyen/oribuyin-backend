const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/:userId", authenticate, authorize(["admin", "staff", "customer"]), orderController.getAllOrdersByUserId);
router.post("/", authenticate, authorize(["customer"]), orderController.createOrder);
router.put("/:orderID/status", authenticate, authorize(["admin", "staff", "customer"]), orderController.updateOrderStatus);

module.exports = router;
