const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const User = require('../models/User');

const getAllOrders = async () => {
    try {
        const orders = await Order.findAll({
            order: [["created_at", "DESC"]],
            raw: true,
            nest: true,
            include: [{
                model: User,
                attributes: ["id", "first_name", "last_name", "email", "phone_number",],
            }],
        });

        if (orders.length === 0) {
            return [];
        }

        const orderIds = orders.map(order => order.id);

        const orderItems = await OrderItem.findAll({
            where: {
                order_id: {
                    [Op.in]: orderIds,
                }
            },
            raw: true,
            nest: true,
        });

        const productIds = orderItems.map(item => item.product_id);
        const products = await Product.findAll({
            where: {
                id: {
                    [Op.in]: productIds,
                }
            },
            attributes: ['id', 'name', 'price', 'discount', 'image'],
            raw: true,
            nest: true,
        });

        const productMap = {};
        products.forEach(p => { productMap[p.id] = p; });

        const orderItemsWithProduct = orderItems.map(item => ({
            ...item,
            product: productMap[item.product_id] || null,
        }));

        const orderItemsByOrderId = {};
        orderItemsWithProduct.forEach(item => {
            if (!orderItemsByOrderId[item.order_id]) orderItemsByOrderId[item.order_id] = [];
            orderItemsByOrderId[item.order_id].push(item);
        });

        const ordersWithDetails = orders.map(order => ({
            id: order.id,
            order_date: order.order_date,
            status: order.status,
            total_amount: order.total_amount,
            shipping_address: order.shipping_address,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            created_at: order.created_at,
            updated_at: order.updated_at,
            user_id: order.user_id,
            customer: {
                id: order.User.id,
                first_name: order.User.first_name,
                last_name: order.User.last_name,
                email: order.User.email,
                phone_number: order.User.phone_number,
            },
            order_items: orderItemsByOrderId[order.id] || [],
        }));

        return ordersWithDetails;
    } catch (error) {
        throw new Error(`Error when fetching all orders: ${error.message}`);
    }
};

const getRecentOrders = async () => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // back to 7 days

        const recentOrders = await Order.findAll({
            where: {
                order_date: {
                    [Op.gte]: oneWeekAgo,
                },
            },
            order: [["created_at", "DESC"]],
            raw: true,
            nest: true,
            include: [{
                model: User,
                attributes: ["first_name", "last_name"],
            }],
        });

        const formattedRecentOrders = recentOrders.map(order => ({
            id: order.id,
            order_date: order.order_date,
            status: order.status,
            total_amount: order.total_amount,
            shipping_address: order.shipping_address,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            created_at: order.created_at,
            updated_at: order.updated_at,
            user_id: order.user_id,
            customer_name: `${order.User.first_name || ''} ${order.User.last_name || ''}`.trim(),
        }));

        return formattedRecentOrders;
    } catch (error) {
        throw new Error(`Error when fetching recent orders: ${error.message}`);
    }
};

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

const getCurrentMonthRevenue = async () => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const totalRevenue = await Order.sum("total_amount", {
            where: {
                payment_status: "paid",
                status: { [Op.ne]: "cancelled" },
                created_at: {
                    [Op.gte]: firstDayOfMonth,
                    [Op.lte]: lastDayOfMonth,
                },
            },
        });

        return Math.round(totalRevenue || 0);
    } catch (error) {
        throw new Error(`Error when fetching current month revenue: ${error.message}`);
    }
};

const getOrdersByTimeRange = async (range, customStart, customEnd) => {
    try {
        let startDate, endDate;
        const now = new Date();

        switch (range) {
            case "today":
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case "yesterday":
                startDate = new Date(now.setDate(now.getDate() - 1));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "last_7_days":
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "this_month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case "last_month":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case "this_quarter":
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
                break;
            case "custom":
                if (!customStart || !customEnd) throw new Error("customStart and customEnd are required for custom range");
                startDate = new Date(customStart);
                endDate = new Date(customEnd);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                throw new Error("Invalid range type");
        }

        // get all orders within the specified time range
        const orders = await Order.findAll({
            where: {
                created_at: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            include: [{
                model: User,
                attributes: ["id", "first_name", "last_name", "email", "phone_number"],
            }],
            order: [["created_at", "DESC"]],
            raw: true,
            nest: true,
        });

        // get all order ids
        const orderIds = orders.map(order => order.id);

        // get all order items for those orders
        const orderItems = await OrderItem.findAll({
            where: { order_id: { [Op.in]: orderIds } },
            attributes: ["order_id", "quantity"],
            raw: true,
        });

        // get number of items in each order
        const quantityByOrderId = {};
        orderItems.forEach(item => {
            // initialize the quantity for the order if it doesn't exist
            if (!quantityByOrderId[item.order_id]) {
                quantityByOrderId[item.order_id] = 0;
            }
            // accumulate the quantity for the order
            quantityByOrderId[item.order_id] += item.quantity;
        });

        const result = orders.map(order => ({
            id: order.id,
            order_date: order.order_date,
            customer: {
                id: order.User.id,
                first_name: order.User.first_name,
                last_name: order.User.last_name,
                email: order.User.email,
                phone_number: order.User.phone_number,
            },
            total_amount: order.total_amount,
            status: order.status,
            payment_status: order.payment_status,
            product_item_quantity: quantityByOrderId[order.id] || 0,
        }));

        return result;
    } catch (error) {
        throw new Error(`Error when fetching orders by time range: ${error.message}`);
    }
};

const getNumberOfPendingOrders = async () => {
    try {
        const pendingOrdersCount = await Order.count({
            where: {
                status: "pending",
            },
        });

        return pendingOrdersCount;
    } catch (error) {
        throw new Error(`Error when fetching number of pending orders: ${error.message}`);
    }
}

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

                if (!product) {
                    throw new Error(`Product with ID ${item.product_id} not found.`);
                }

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

        const updateFields = {
            status: status,
        };

        // if order is completed, update payment status tp paid 
        if (status === "delivered") {
            updateFields.payment_status = "paid";
        }

        await order.update(
            updateFields,
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
    getAllOrders,
    getRecentOrders,
    getAllOrdersByUserId,
    getCurrentMonthRevenue,
    getOrdersByTimeRange,
    getNumberOfPendingOrders,
    createNewOrder,
    updateOrderStatus,
};
