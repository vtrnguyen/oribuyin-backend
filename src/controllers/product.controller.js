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
        return res.status(500).json({
            code: 0,
            message: `error when fetching all products: ${err.message}`,
        })
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
        return res.status(500).json({
            code: 0,
            message: `error when fetching product: ${err.message}`,
        });
    }
}

const createProduct = async (req, res) => {
    const { newProduct } = req.body;

    if (!newProduct || !newProduct.name || newProduct.price === undefined 
        || newProduct.stock_quantity === undefined || newProduct.discount === undefined
        || !newProduct.category_id || !newProduct.description
    ) {
        return res.status(400).json({
            code: 0,
            message: "missing inputs parameters",
        });
    }

    try {
        const result = await productService.createProduct(newProduct);

        return res.status(201).json({
            code: 1,
            message: "create new product successful",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when creating new product ${error.message}`,
        });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { updatingProduct } = req.body;

    if (!updatingProduct || !updatingProduct.name || updatingProduct.price === undefined 
        || updatingProduct.stock_quantity === undefined || updatingProduct.discount === undefined
        || !updatingProduct.category_id || !updatingProduct.description
    ) {
        return res.status(400).json({
            code: 0,
            message: "missing inputs parameters",
        });
    }

    try {
        const result = await productService.updateProduct(id, updatingProduct);

        return res.status(200).json({
            code: 1,
            message: "update product successful",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: "error when updating product",
        });
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProductCount = await productService.deleteProduct(id);
        
        if (deletedProductCount === 0) {
            return res.status(404).json({
                code: 0,
                message: "product not found",
            });
        }
        
        return res.status(200).json({
            code: 1,
            message: "delete product successful",
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when deleting product: ${error.message}`,
        });
    }
};

module.exports = {
    getAllProducts,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct,
}
