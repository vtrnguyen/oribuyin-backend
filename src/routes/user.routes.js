const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
router.get("/:id", authenticate, authorize(["admin", "customer"]), userController.getUserByID)
router.post("/", authenticate, authorize(["admin"]), userController.createUser);
router.delete("/:id", authenticate, authorize(["admin"]), userController.deleteUser);

module.exports = router;
