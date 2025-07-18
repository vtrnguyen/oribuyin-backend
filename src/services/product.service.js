const { Sequelize, where, Op } = require("sequelize");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const Category = require("../models/Category");
const CartItem = require("../models/CartItem");

const getAllProducts = async () => {
    return await Product.findAll();
};

const getProductByID = async (productID) => {
    try {
        const product = await Product.findOne({
            where: {
                id: productID,
            },
        });

        if (!product) throw new Error("Product not found");

        const reviews = await Review.findAll({
            where: {
                product_id: productID,
            },
            include: {
                model: User,
                attributes: ["id", "first_name", "last_name", "avatar"],
                as: "user",
            },
            order: [["created_at", "DESC"]],
        });

        return { product, reviews };
    } catch (error) {
        throw new Error(`error when fetching detail product: ${error.message}`);
    }
};

const getNumberOfProducts = async () => {
    try {
        const productCounter = await Product.count();
        return productCounter;
    } catch (error) {
        throw new Error("Unable to fetch number of products");
    }
};

const getSuggestedProducts = async () => {
    try {
        const suggestedProducts = await Product.findAll({
            order: Sequelize.literal("RAND()"),
            limit: 24,
        });

        return suggestedProducts;
    } catch (error) {
        throw new Error("Unable to fetch suggested products");
    }
};

const getPaginationProducts = async (page, pageSize) => {
    const limit = parseInt(pageSize, 10) || 10;
    const offset = (parseInt(page, 10) - 1) * limit || 0;

    try {
        const { count, rows } = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
        });

        return {
            totalRecords: count,
            products: rows,
        };
    } catch (error) {
        throw new Error(`Unable to fetch pagination products: ${error.message}`);
    }
};

const getFilteredPaginationProducts = async (page, pageSize, categoryID, minPrice, maxPrice, rating) => {
    const limit = parseInt(pageSize, 10) || 10;
    const offset = (parseInt(page, 10) - 1) * limit || 0;
    const whereClause = {};
    const includeClause = [
        {
            model: Category,
            as: "category",
            where: {},
        },
    ];
    const orderClause = [];

    if (categoryID) {
        includeClause[0].where.id = categoryID;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
        whereClause.price = {
            [Op.gte]: parseFloat(minPrice),
            [Op.lte]: parseFloat(maxPrice),
        };
    } else if (minPrice !== undefined) {
        whereClause.price = {
            [Op.gte]: parseFloat(minPrice),
        };
    } else if (maxPrice !== undefined) {
        whereClause.price = {
            [Op.lte]: parseFloat(maxPrice),
        };
    }

    if (rating) {
        includeClause.push({
            model: Review,
            as: "review",
            where: {
                rating: { [Op.eq]: parseInt(rating, 10) },
            },
        });
    }

    try {
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit: limit,
            offset: offset,
            distinct: true,
            order: orderClause,
        });

        return {
            total_records: count,
            products: rows,
        };
    } catch (error) {
        throw new Error(`Unable to fetch filtered pagination products: ${error.message}`);
    }
};

const getProductByCategoryID = async (categoryID, page, pageSize) => {
    const limit = parseInt(pageSize, 10) || 10;
    const offset = (parseInt(page, 10) - 1) * limit || 0; // return which item will be started

    try {
        const { count, rows } = await Product.findAndCountAll({ // count is number of products in db
            where: {
                category_id: categoryID,
            },
            limit: limit,
            offset: offset,
        });

        return {
            totalRecords: count,
            products: rows,
        };
    } catch (error) {
        throw new Error(`Unable to fetch products by category ID: ${error.message}`);
    }
};

const getCheckoutProductDetail = async (itemIDs) => {
    try {
        const products = await Product.findAll({
            where: {
                id: itemIDs,
            },
        });

        const cartItems = await CartItem.findAll({
            where: {
                product_id: itemIDs,
            },
            attributes: ['product_id', 'quantity'],
        });

        const quantityMap = new Map();
        cartItems.forEach(item => {
            quantityMap.set(item.product_id, item.quantity);
        });

        const productsWithQuantity = products.map(product => {
            const productData = product.get({ plain: true });
            const quantityInCart = quantityMap.get(productData.id) || 1;

            return {
                ...productData,
                quantity_to_buy: quantityInCart,
            };
        });

        return productsWithQuantity;
    } catch (error) {
        throw new Error(`Error when fetching checkout product detail: ${error.message}`);
    }
};

const getTotalStockQuantity = async () => {
    try {
        const totalStock = await Product.sum('stock_quantity');
        return totalStock || 0;
    } catch (error) {
        throw new Error(`Unable to fetch total stock quantity: ${error.message}`);
    }
};

const getTotalAlmostOutOfStockQuantity = async () => {
    try {
        const products = await Product.findAll({
            where: {
                // stock_quantity is between 1 and 5 is considered as almost out of stock
                stock_quantity: {
                    [Op.lte]: 5,
                    [Op.gte]: 1,
                },
            },
        });
        return products.length;
    } catch (error) {
        throw new Error(`Unable to fetch number of almost out of stock products: ${error.message}`);
    }
}

const searchProductsByName = async (keyword) => {
    try {
        const products = await Product.findAll({
            where: {
                name: {
                    [Op.like]: `%${keyword}%`,
                },
            },
        });

        return products;
    } catch (error) {
        throw new Error(`Unable to search products: ${error.message}`);
    }
};

const createProduct = async (productInfo) => {
    const newProduct = await Product.create({
        name: productInfo.name,
        image: productInfo?.image,
        description: productInfo?.description,
        price: productInfo.price,
        stock_quantity: productInfo.stock_quantity,
        discount: productInfo.discount,
        category_id: productInfo.category_id,
    });
    return {
        created_product: newProduct,
    };
};

const updateProduct = async (productID, updatingProductInfo) => {
    const updatingProduct = await Product.findByPk(productID);

    if (!updatingProduct) throw new Error("Product not found");

    await updatingProduct.update(updatingProductInfo);

    return {
        updated_product: updatingProduct,
    };
};

const updateProductStock = async (productID, stockQuantity) => {
    const product = await Product.findByPk(productID);

    if (!product) {
        throw new Error("Product not found");
    }

    await product.update({
        stock_quantity: stockQuantity,
    });

    return product;
};

const bulkUpdateProductStock = async (productsToUpdate) => {
    const result = [];

    for (const productInfo of productsToUpdate) {
        const { id, stockQuantity } = productInfo;
        const product = await Product.findByPk(id);
        if (product) {
            await product.update({ stock_quantity: stockQuantity });
            result.push({ subcode: 1, id: product.id, stock_quantity: product.stockQuantity, message: "update product stock quantity successful" });
        } else {
            result.push({ subcode: 0, id: id, message: "no products are found" });
        }
    }

    return result;
};

const deleteProduct = async (productID) => {
    return Product.destroy({
        where: {
            id: productID,
        },
    });
};

module.exports = {
    getAllProducts,
    getProductByID,
    getNumberOfProducts,
    getSuggestedProducts,
    getPaginationProducts,
    getFilteredPaginationProducts,
    getProductByCategoryID,
    getCheckoutProductDetail,
    getTotalStockQuantity,
    getTotalAlmostOutOfStockQuantity,
    searchProductsByName,
    createProduct,
    updateProduct,
    updateProductStock,
    bulkUpdateProductStock,
    deleteProduct,
};
