const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const User = require("../models/User");
const Product = require("../models/Product");

const getCartByUserID = async (userID) => {
    try {
        const existingUser = User.findByPk(userID);

        if (!existingUser) {
            throw new Error(`User with ID ${userID} not found`);
        }

        const cart = await Cart.findOne({
            where: {
                user_id: userID,
            },
        });

        if (!cart) {
            return null;
        }

        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart.id,
            },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "price", "discount", "stock_quantity", "image"],
                }
            ]
        });

        return {
            cart_id: cart.id,
            items: cartItems.map(cartItem => ({
                cart_item_id: cartItem.id,
                quantity: cartItem.quantity,
                product: {
                    ...cartItem.product.get({ plain: true }),
                    price: Number(cartItem.product.price),
                    discount: Number(cartItem.product.discount),
                },
            })),
        };
    } catch (error) {
        throw new Error(`Error when fetching user cart by userID ${userID}: ${error.message}`);
    }
};

const addToCart = async (userID, productID, quantity) => {
    try {
        const existingUser = await User.findByPk(userID);

        if (!existingUser) {
            throw new Error(`User with ID ${userID} not found`);
        }

        const existingProduct = await Product.findByPk(productID);

        if (!existingProduct) {
            throw new Error(`Product with ID ${productID} not found`);
        }

        let cart = await Cart.findOne({
            where: {
                user_id: userID,
            },
        });

        if (!cart) {
            cart = await Cart.create({ user_id: userID });
        }

        const existingCartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_id: productID,
            },
        });

        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
            return existingCartItem;
        } else {
            const newCartItem = await CartItem.create({
                cart_id: cart.id,
                product_id: productID,
                quantity: quantity,
            });
            return newCartItem;
        }
    } catch (error) {
        throw new Error(`Error when adding product to cart: ${error.message}`);
    }
};

module.exports = {
    getCartByUserID,
    addToCart,
}
