const reviewService = require('../services/review.service');

const createReview = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { product_id, rating, comment } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({
                code: 0,
                message: "product id and rating are required",
            });
        }

        const review = await reviewService.createReview({ user_id, product_id, rating, comment });

        return res.status(201).json({
            code: 1,
            message: "review created successfully",
            data: review,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error creating review: ${error.message}`
        });
    }
};

module.exports = {
    createReview,
};
