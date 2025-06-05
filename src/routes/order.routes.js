const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.post("/", authenticate, authorize(["customer"]), orderController.createOrder);

module.exports = router;
