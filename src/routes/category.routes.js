const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, categoryController.getAllCategories);
router.get("/values", authenticate, categoryController.getCategoryValue);
router.get("/:id", authenticate, categoryController.getCategoryByID);
router.post("", authenticate, authorize(["admin"]), categoryController.createCategory);
router.put("/:id", authenticate, authorize(["admin"]), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize(["admin"]), categoryController.deleteCategory);

module.exports = router;
