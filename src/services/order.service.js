const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');

const getAllOrdersByUserId = async (userId) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: OrderItem,
                    as: 'order_items',
                    include: {
                        model: Product,
                        as: 'products',
                        attributes: ['id', 'name', 'price', 'discount', 'image'],
                    },
                },
            ],
            order: [['created_at', 'DESC']],
        });

        return orders;
    } catch (error) {
        throw new Error(`Error fetching orders for user ID ${userId}: ${error.message}`);
    }
};

const createNewOrder = async (orderData) => {
    const transaction = await sequelize.transaction();

    try {
        const { user_id, shipping_address, payment_method, products, voucher_discount = 0, shipping_fee } = orderData;

        const productIds = products.map(product => product.product_id);
        const existingProducts = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
            transaction,
        });

        if (existingProducts.length !== productIds.length) {
            throw new Error("One or more products do not exist.");
        }

        let totalAmount = 0;
        const orderItemsToCreate = [];

        for (const item of products) {
            const product = existingProducts.find(p => p.id === item.product_id);

            if (!product) {
                throw new Error(`Product with ID ${item.product_id} does not exist.`);
            }

            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}.`);
            }

            const discountedPrice = product.price * (1 - (product.discount / 100));
            totalAmount += discountedPrice * item.quantity;

            orderItemsToCreate.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order_time: discountedPrice,
            });
        }

        // last calculate for totalAmount
        totalAmount = totalAmount + shipping_fee - voucher_discount;

        let payment_status = "unpaid";
        if (payment_method === "online") payment_status = "paid";

        const newOrder = await Order.create({
            user_id: user_id,
            total_amount: totalAmount,
            shipping_address: shipping_address,
            payment_method: payment_method,
            status: "pending",
            payment_status: payment_status,
        }, { transaction });

        const orderItemsWithOrderId = orderItemsToCreate.map(item => ({
            ...item,
            order_id: newOrder.id
        }));

        await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });

        const userCart = await Cart.findOne({
            where: {
                user_id: user_id,
            },
            transaction,
        });

        if (userCart) {
            await CartItem.destroy({
                where: {
                    cart_id: userCart.id,
                    product_id: { [Op.in]: productIds },
                },
                transaction,
            });
        }

        // end of transaction
        await transaction.commit();

        return {
            order: newOrder,
            order_items: orderItemsWithOrderId,
        }

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllOrdersByUserId,
    createNewOrder,
};
