const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const OrderItem = require("../models/OrderItem");

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

const getReviewsByAvgRating = async (options = {}) => {
    const { page = 1, pageSize = 10, rating, productId, sort = "desc" } = options;
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const ps = parseInt(pageSize, 10) || 10;
    const offset = (pg - 1) * ps;
    const orderDirection = sort && sort.toLowerCase() === "asc" ? "ASC" : "DESC";

    try {
        // build where clause
        const where = {};
        if (rating !== undefined && rating !== null) {
            where.rating = rating;
        }
        if (productId) {
            where.product_id = productId;
        }

        // fetch total count for pagination
        const total = await Review.count({ where });

        // fetch reviews with pagination and sorting
        const reviews = await Review.findAll({
            where,
            include: [
                { model: User, as: "user", attributes: ["id", "first_name", "last_name"] },
            ],
            order: [["rating", orderDirection], ["created_at", "DESC"]],
            limit: ps,
            offset: offset,
        });

        // compute total_sold for products in this page 
        const productIds = [...new Set(reviews.map(r => r.product_id).filter(Boolean))];
        let soldMap = new Map();
        if (productIds.length > 0) {
            const soldRows = await OrderItem.findAll({
                attributes: [
                    'product_id',
                    [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_sold']
                ],
                where: { product_id: productIds },
                group: ['product_id'],
                raw: true,
            });
            soldRows.forEach(sr => {
                soldMap.set(sr.product_id, Number(sr.total_sold || 0));
            });
        }

        // fetch product details
        const products = await Product.findAll({
            where: { id: productIds },
            attributes: ['id', 'name', 'category_id', 'image'],
            raw: true,
        });
        const prodMap = new Map();
        products.forEach(p => prodMap.set(p.id, p));

        // assemble final data
        const data = reviews.map(r => {
            const rev = r.get ? r.get({ plain: true }) : r;
            const pid = rev.product_id;
            const product = prodMap.get(pid) || null;
            return {
                review: rev,
                product: {
                    id: product?.id || pid,
                    name: product?.name || null,
                    category_id: product?.category_id || null,
                    image: product?.image || null,
                    total_sold: soldMap.get(pid) || 0,
                },
            };
        });

        return {
            total,
            page: pg,
            pageSize: ps,
            data,
        };
    } catch (error) {
        throw new Error(`Error when fetching reviews by average rating: ${error.message}`);
    }
}

module.exports = {
    createReview,
    getReviewsByAvgRating,
};
