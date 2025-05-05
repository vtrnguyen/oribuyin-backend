const { Sequelize } = require("sequelize");
const Product = require("../models/Product");

const getAllProducts = async () => {
    return await Product.findAll();
};

const getProductByID = async (productID) => {
    return await Product.findOne({
        where: {
            id: productID,
        },
    });
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
    getProductByCategoryID,
    createProduct,
    updateProduct,
    updateProductStock,
    bulkUpdateProductStock,
    deleteProduct,
};
