const productService = require("../services/product.service");

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();

        if (!products || products.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "there are no products in the system",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get all products successful",
            data: products,
        });
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
};

const getProductByID = async (req, res) => {
    const { id } = req.params;
    
    try {
        const product = await productService.getProductByID(id);

        if (!product || product.length === 0) {
            return res.status(404).json({
                code: 0,
                message: "product not found",
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get product successful",
            data: product,
        });
    } catch (err) {
        return res.status(500).json({ err: err.message });
    }
}

module.exports = {
    getAllProducts,
    getProductByID,
}
