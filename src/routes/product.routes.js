const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize(["admin", "staff", "customer"]), productController.getAllProducts);
router.get("/count", authenticate, authorize(["admin", "staff"]), productController.getNumberOfProducts);
router.get("/:id", authenticate, authorize(["admin", "staff", "customer"]), productController.getProductByID);
router.post("/", authenticate, authorize(["admin"]), productController.createProduct);
router.put("/:id", authenticate, authorize(["admin"]), productController.updateProduct);
router.delete("/:id", authenticate, authorize(["admin"]), productController.deleteProduct);
router.put("/stocks/bulk", authenticate, authorize(["admin", "staff"]), productController.bulkUpdateProductStock);
router.put("/stocks/:id", authenticate, authorize(["admin", "staff"]), productController.updateProductStock);

module.exports = router;
