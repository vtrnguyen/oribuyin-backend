const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, productController.getAllProducts);
router.get("/:id", authenticate, productController.getProductByID);

module.exports = router;
