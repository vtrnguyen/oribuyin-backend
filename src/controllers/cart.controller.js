const cartService = require("../services/cart.service");

const getCartByUserID = async (req, res) => {
    try {
        const userID = req.params.userID;
        const cartData = await cartService.getCartByUserID(userID);

        if (cartData) {
            return res.status(200).json({
                code: 1,
                message: "retrieve cart successful",
                data: cartData,
            });
        }

        return res.status(200).json({
            code: 1,
            message: "cart is empty",
            data: cartData,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching cart: ${error.message}`,
        });
    }
};

const getNumberOfCartProduct = async (req, res) => {
    try {
        const userID = req.params.userID;
        const count = await cartService.getNumberOfCartProduct(userID);

        return res.status(200).json({
            code: 1,
            message: "retrieve number cart product successful",
            data: count,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching number of cart product: ${error.message}`,
        });
    }
};

const addToCart = async (req, res) => {
    const { userID, productID, quantity } = req.body;

    if (!productID || !quantity || quantity <= 0) {
        return res.status(400).json({
            code: 0,
            message: "invalid product ID or quantity",
        });
    }

    try {
        const cartItem = await cartService.addToCart(userID, productID, quantity);
        return res.status(200).json({
            code: 1,
            message: "adding product into cart successful",
            data: cartItem,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when adding product to cart: ${error.message}`
        });
    }
};

module.exports = {
    getCartByUserID,
    getNumberOfCartProduct,
    addToCart,
};
