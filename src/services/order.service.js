const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');

const getAllOrdersByUserId = async (userId) => {
    try {
        // get all user's orders
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            raw: true,
            nest: true,
        });

        // from user's order, get all order id
        const orderIds = orders.map(order => order.id);

        // get all items from order's id
        const orderItems = await OrderItem.findAll({
            where: { order_id: { [Op.in]: orderIds } },
            raw: true,
            nest: true,
        });

        // get all product's id in order's items
        const productIds = orderItems.map(item => item.product_id);
        const products = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
            attributes: ['id', 'name', 'price', 'discount', 'image'],
            raw: true,
            nest: true,
        });

        // assign products for each order item
        const productMap = {};
        products.forEach(p => { productMap[p.id] = p; });
        const orderItemsWithProduct = orderItems.map(item => ({
            ...item,
            product: productMap[item.product_id] || null,
        }));

        // assign order items for each order
        const orderItemsByOrderId = {};
        orderItemsWithProduct.forEach(item => {
            if (!orderItemsByOrderId[item.order_id]) orderItemsByOrderId[item.order_id] = [];
            orderItemsByOrderId[item.order_id].push(item);
        });

        const ordersWithItems = orders.map(order => ({
            ...order,
            order_items: orderItemsByOrderId[order.id] || [],
        }));

        return ordersWithItems;
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

const updateOrderStatus = async (orderID, status) => {
    const transaction = await sequelize.transaction();

    try {
        const order = await Order.findByPk(orderID, { transaction: transaction });

        if (!order) {
            throw new Error("Order not found.");
        }

        // minus stock when order status is confirmed
        if (status === "confirmed" && order.status !== "confirmed") {
            const orderItems = await OrderItem.findAll({
                where: {
                    order_id: orderID,
                },
                transaction,
            });

            for (const item of orderItems) {
                const product = await Product.findByPk(item.product_id, { transaction: transaction });

                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for prodyct ${product.name}`);
                }

                await product.update(
                    {
                        stock_quantity: product.stock_quantity - item.quantity,
                    },
                    {
                        transaction: transaction,
                    },
                );
            }
        }

        await order.update(
            {
                status: status,
            },
            {
                transaction: transaction,
            },
        );
        await transaction.commit();
        return order;
    } catch (error) {
        await transaction.rollback();
        throw new Error(`Error when updating order status: ${error.message}`);
    }
}

module.exports = {
    getAllOrdersByUserId,
    createNewOrder,
    updateOrderStatus,
};
