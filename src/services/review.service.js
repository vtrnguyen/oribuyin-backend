const sequelize = require("../config/database");
const Review = require("../models/Review");

const createReview = async ({ user_id, product_id, rating, comment }) => {
    const transaction = await sequelize.transaction();

    try {
        const review = await Review.create(
            {
                user_id: user_id,
                product_id: product_id,
                rating: rating,
                comment: comment,
            },
            {
                transaction,
            },
        );

        await transaction.commit();
        return review;
    } catch (error) {
        await transaction.rollback();
        throw new Error(`Error when reviewing: ${error.message}`);
    }
};

module.exports = {
    createReview,
};
