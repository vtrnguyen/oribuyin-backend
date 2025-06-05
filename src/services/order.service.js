const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');

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
        const { user_id, shipping_address, payment_method, products } = orderData;

        const productIds = products.map(product => product.id);
        const existingProducts = await Product.findAll({
            where: {
                id: {
                    [Op.in]: productIds
                }
            },
            transaction: transaction, // ensure all queries are part of the transaction
        });

        if (existingProducts.length !== productIds.length) {
            throw new Error("One or more products do not exist.");
        }

        let totalAmount = 0;
        const orderItemsToCreate = [];

        for (const item of products) {
            const product = existingProducts.find(p => p.id === item.product_id);

            if (!product) {
                throw new Error(`Product with ID ${item.id} does not exist.`);
            }

            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
            }

            const discountedPrice = product.price * (1 - (product.discount / 100));
            totalAmount += discountedPrice * item.quantity;

            orderItemsToCreate.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order_time: discountedPrice,
            });
        }

        const newOrder = await Order.create({
            user_id: user_id,
            total_amount: totalAmount,
            shipping_address: shipping_address,
            payment_method: payment_method,
            status: "pending",
            payment_status: "unpaid",
        }, { transaction });

        const orderItemsWithOrderId = orderItemsToCreate.map(item => ({
            ...item,
            order_id: newOrder.id
        }));

        await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction: transaction });

        for (const item of products) {
            const product = existingProducts.find(p => p.id === item.product_id);
            await product.update({
                stock_quantity: product.stock_quantity - item.quantity,
            }, { transaction });
        }

        await transaction.commit();

        return {
            order: newOrder,
            order_items: orderItemsWithOrderId,
        }
    } catch (error) {
    }
};

module.exports = {
    getAllOrdersByUserId,
    createNewOrder,
};
