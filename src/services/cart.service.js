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
            ],
            order: [["created_at", "DESC"]],
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

const getNumberOfCartProduct = async (userID) => {
    try {
        const existingUser = await User.findByPk(userID);

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

        const totalQuantity = await CartItem.count("product_id", {
            where: { cart_id: cart.id },
        });

        return totalQuantity || 0;
    } catch (error) {
        throw new Error(`Error when fetching number of cart product: ${error.message}`);
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

const updateCartItemQuantity = async (cartItemID, quantity) => {
    try {
        const cartItem = await CartItem.findByPk(cartItemID);

        if (!cartItem) {
            throw new Error(`Cart item with ID ${cartItemID} not found`);
        }

        const product = await Product.findByPk(cartItem.product_id);

        if (!product) {
            throw new Error(`Product with ID ${cartItem.product_id} not found`);
        }

        if (quantity < 1) {
            throw new Error("Quantity must be at least 1");
        }

        if (quantity > product.stock_quantity) {
            throw new Error(`Requested quantity (${quantity}) exceeds available stock (${product.stock_quantity})`);
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        return cartItem;
    } catch (error) {
        throw new Error(`Error when update cart item quantity ${error.message}`);
    }
};

const deleteCartItem = async (cartItemID) => {
    try {
        const cartItem = await CartItem.findByPk(cartItemID);

        if (!cartItem) {
            throw new Error(`Cart item with ID ${cartItemID} not found`);
        }

        await cartItem.destroy();

        return true;
    } catch (error) {
        throw new Error(`Error when deleting cart item with ID ${cartItemID}`);
    }
};

module.exports = {
    getCartByUserID,
    getNumberOfCartProduct,
    addToCart,
    updateCartItemQuantity,
    deleteCartItem,
}
