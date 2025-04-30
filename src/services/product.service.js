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
}

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
    createProduct,
    updateProduct,
    deleteProduct,
};
