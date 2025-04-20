const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
router.get("/:id", authenticate, authorize(["admin", "customer"]), userController.getUserByID)

module.exports = router;
