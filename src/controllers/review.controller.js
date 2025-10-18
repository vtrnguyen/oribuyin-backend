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

const getReviewsByAvgRating = async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1', 10);
        const pageSize = parseInt(req.query.pageSize || '10', 10);
        const rating = req.query.rating ? parseInt(req.query.rating, 10) : undefined;
        const productId = req.query.productId ? parseInt(req.query.productId, 10) : undefined;
        const sort = req.query.sort || 'desc';

        const result = await reviewService.getReviewsByAvgRating({ page, pageSize, rating, productId, sort });

        return res.status(200).json({
            code: 1,
            message: "fetch reviews with product summary successful",
            data: result,
        });
    } catch (error) {
        console.error('getReviewsByAvgRating error:', error);
        return res.status(500).json({
            code: 0,
            message: `error when fetching reviews by average rating: ${error.message}`,
        });
    }
};

module.exports = {
    createReview,
    getReviewsByAvgRating,
};
