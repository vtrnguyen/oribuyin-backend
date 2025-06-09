const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
router.get("/count", authenticate, authorize(["admin"]), userController.getNumberOfUsers);
router.get("/:id", authenticate, authorize(["admin", "customer"]), userController.getUserByID)
router.post("/", authenticate, authorize(["admin"]), userController.createUser);
router.put("/:id", authenticate, authorize(["admin"]), userController.updateUser);
router.put("/update-profile/:id", authenticate, authorize(["customer"]), userController.updateUserProfile);
router.delete("/:id", authenticate, authorize(["admin"]), userController.deleteUser);

module.exports = router;
