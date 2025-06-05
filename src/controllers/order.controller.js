const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { shipping_address, payment_method, products } = req.body;

        if (!shipping_address || !payment_method || !products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                code: -1,
                message: 'invalid order data. Please provide shipping address, payment method, and products.',
            });
        }

        for (const product of products) {
            if (!product.product_id || !product.quantity || product.quantity <= 0) {
                return res.status(400).json({
                    code: -1,
                    message: 'invalid product data. Each product must have a valid ID and quantity greater than 0.',
                });
            }
        }

        const orderData = {
            user_id: user_id,
            shipping_address,
            payment_method,
            products,
        };

        const result = await orderService.createNewOrder(orderData);

        res.status(201).json({
            code: 1,
            message: 'Order created successfully',
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
}

module.exports = {
    createOrder,
};
