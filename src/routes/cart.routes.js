const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

router.get("/count/:userID", authenticate, authorize(["customer"]), cartController.getNumberOfCartProduct);
router.get("/:userID", authenticate, authorize(["customer"]), cartController.getCartByUserID);
router.put("/:cartItemID", authenticate, authorize(["customer"]), cartController.updateCartItemQuantity);
router.post("/", authenticate, authorize(["customer"]), cartController.addToCart);
router.delete("/:cartItemID", authenticate, authorize(["customer"]), cartController.deleteCartItem);

module.exports = router;
