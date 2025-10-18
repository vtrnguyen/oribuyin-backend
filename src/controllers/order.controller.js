const orderService = require('../services/order.service');

const getAllOrders = async (req, res) => {
    try {
        let orders = await orderService.getAllOrders();

        if (orders === null || orders.length === 0) {
            return res.status(404).json({
                code: 0,
                message: "no order can be found",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "fetch all orders successful",
            data: orders,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching all products: ${error.message}`,
        });
    }
};

const getRecentOrders = async (req, res) => {
    try {
        let recentOrders = await orderService.getRecentOrders();

        if (recentOrders === null || recentOrders.length === 0) {
            return res.status(404).json({
                code: 0,
                message: "no recent order can be found",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "fetch all recent orders successful",
            data: recentOrders,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching recent orders: ${error.message}`,
        });
    }
};

const getAllOrdersByUserId = async (req, res) => {

    const userID = req.params.userId;

    if (!userID) {
        return res.status(400).json({
            code: 0,
            message: "user id not be null",
        });
    }

    try {
        let orders = await orderService.getAllOrdersByUserId(userID);

        if (orders === null || orders.length === 0) {
            return res.status(404).json({
                code: 0,
                message: `no order can be found by user id: ${userID}`,
            });
        }

        return res.status(200).json({
            code: 1,
            message: `get all orders by user id ${userID} sucessful`,
            data: orders,
        });

    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when get all orders by user id: ${error.message}`,
        });
    }
};

const getCurrentMonthRevenue = async (req, res) => {
    try {
        const totalRevenue = await orderService.getCurrentMonthRevenue();

        return res.status(200).json({
            code: 1,
            message: "get current month revenue successful",
            data: totalRevenue,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching current month revenue`,
        });
    }
};

const getOrdersByTimeRange = async (req, res) => {
    try {
        const { range, custom_start, custom_end } = req.query;

        if (!range) {
            return res.status(400).json({
                code: 0,
                message: "range is required",
            });
        }

        const orders = await orderService.getOrdersByTimeRange(range, custom_start, custom_end);

        if (orders === null || orders.length === 0) {
            return res.status(200).json({
                code: 0,
                message: `no orders found for the specified time range: ${range}`,
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get orders by time range successful",
            data: orders,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching orders by time range: ${error.message}`,
        });
    }
};

const getNumberOfPendingOrders = async (req, res) => {
    try {
        const pendingOrdersCount = await orderService.getNumberOfPendingOrders();
        return res.status(200).json({
            code: 1,
            message: "get number of pending orders successful",
            data: pendingOrdersCount,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching number of pending orders: ${error.message}`,
        });
    }
}

const createOrder = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { shipping_address, payment_method, products, voucher_discount = 0, shipping_fee = 30000 } = req.body;

        if (!shipping_address || !payment_method || !products || !Array.isArray(products) || products.length === 0 || shipping_fee === undefined) {
            return res.status(400).json({
                code: -1,
                message: 'invalid order data. Please provide shipping address, payment method, products, and shipping fee.',
            });
        }

        for (const product of products) {
            if (!product.product_id || !product.quantity || product.quantity <= 0) {
                return res.status(400).json({
                    code: -1,
                    message: 'invalid product data. Each product must have an id and a positive quantity.',
                });
            }
        }

        const orderData = {
            user_id,
            shipping_address,
            payment_method,
            products,
            voucher_discount,
            shipping_fee,
        };

        const result = await orderService.createNewOrder(orderData);

        res.status(201).json({
            code: 1,
            message: 'order created successfully',
            data: {
                order: result.order,
                order_items: result.order_items,
            },
        });
    } catch (error) {
        res.status(500).json({
            code: -1,
            message: `errror when creating order: ${error.message}`,
        });
    }
};

const updateOrderStatus = async (req, res) => {
    const { orderID } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            code: 0,
            message: "status is required",
        });
    }

    try {
        const result = await orderService.updateOrderStatus(orderID, status);

        return res.status(200).json({
            code: 1,
            message: "order status updated successfully",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when updating order status: ${error.message}`,
        });
    }
};

const getMonthlyRevenueByYear = async (req, res) => {
    try {
        const year = parseInt(req.query.year, 10);
        if (!year || isNaN(year)) {
            return res.status(400).json({
                code: 0,
                message: "valid year is required",
            });
        }
        const data = await orderService.getMonthlyRevenueByYear(year);
        return res.status(200).json({
            code: 1,
            message: "get monthly revenue by year successful",
            data: data,
        });
    } catch (error) {
        console.error('getMonthlyRevenueByYear error:', error);
        return res.status(500).json({
            code: -1,
            message: `error when fetching monthly revenue by year: ${error.message}`,
        });
    }
};

module.exports = {
    getAllOrders,
    getRecentOrders,
    getAllOrdersByUserId,
    getCurrentMonthRevenue,
    getOrdersByTimeRange,
    getNumberOfPendingOrders,
    createOrder,
    updateOrderStatus,
    getMonthlyRevenueByYear,
};
