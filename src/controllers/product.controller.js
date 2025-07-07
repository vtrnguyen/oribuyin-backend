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
    const productID = req.params.id;

    try {
        const { product, reviews } = await productService.getProductByID(productID);

        if (!product) {
            return res.status(404).json({
                code: 0,
                message: "product not found",
                data: [],
            });
        }

        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            timestamps: review.created_at,
            user_avatar: review.user ? review.user.avatar : null,
            user_full_name: review.user ? `${review.user.first_name} ${review.user.last_name}` : "OriBuyin User",
            user_id: review.user ? review.user.id : null,
            product_id: review.product_id,
        }));

        return res.status(200).json({
            code: 1,
            message: "fetching detail product successful",
            data: {
                product: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    discount: product.discount,
                    stock_quantity: product.stock_quantity,
                    image: product.image,
                    category_id: product.category_id,
                    category_name: product.category_name,
                },
                reviews: formattedReviews,
            },
        })
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching detail product: ${error.message}`,
        });
    }
};

const getNumberOfProducts = async (req, res) => {
    try {
        const productCounter = await productService.getNumberOfProducts();

        return res.status(200).json({
            code: 1,
            message: "get number of products successful",
            data: productCounter,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching number of products: ${error.message}`,
        });
    }
};

const getSuggestedProducts = async (req, res) => {
    try {
        const suggestedProducts = await productService.getSuggestedProducts();

        if (!suggestedProducts || suggestedProducts.length === 0) {
            return res.status(404).json({
                code: 0,
                message: "there are no product in the system",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get suggested products successful",
            data: suggestedProducts,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetchin suggested products: ${error.message}`,
        });
    }
};

const getPaginationProducts = async (req, res) => {
    const { page, pageSize } = req.query;

    try {
        const result = await productService.getPaginationProducts(page, pageSize);

        if (!result || result.products.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "no products found on this page",
                data: [],
                total_records: 0,
            });
        }

        return res.status(200).json({
            code: 1,
            message: `get product in page ${page} successful`,
            data: result.products,
            total_records: result.totalRecords,
        });
    } catch (error) {
        return res.status(500).json({
            code: 0,
            message: `error when fetching pagination products: ${error.message}`,
        });
    }
};

const getFilteredPaginationProducts = async (req, res) => {
    const { page, pageSize, categoryID, minPrice, maxPrice, rating } = req.query;

    try {
        const result = await productService.getFilteredPaginationProducts(
            page,
            pageSize,
            categoryID,
            minPrice,
            maxPrice,
            rating
        );

        if (!result || result.products.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "no products found matching your criteria on this page",
                data: [],
                total_records: 0,
            });
        }

        return res.status(200).json({
            code: 1,
            message: `get filtered products in page ${page} successful`,
            data: result.products,
            total_records: result.total_records,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching filtered pagination products: ${error.message}`,
        });
    }
};

const getProductsByCategoryID = async (req, res) => {
    const { categoryID } = req.params;
    const { page, pageSize } = req.query;

    try {
        const result = await productService.getProductByCategoryID(categoryID, page, pageSize);

        if (!result || result.products.length === 0) {
            return res.status(200).json({
                code: 0,
                message: `no products found for category ID ${categoryID} on this page`,
                data: [],
                total_records: 0,
            });
        }

        return res.status(200).json({
            code: 1,
            message: `get products by category ID ${categoryID} successful`,
            data: result.products,
            total_records: result.totalRecords,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching products by category ID: ${error.message}`,
        });
    }
};

const getCheckoutProductDetail = async (req, res) => {
    try {
        const { itemIDs } = req.body;

        if (!itemIDs || !Array.isArray(itemIDs) || itemIDs.length === 0) {
            return res.status(400).json({
                code: 0,
                message: "missing input parameters",
            });
        }

        const checkoutItems = await productService.getCheckoutProductDetail(itemIDs);

        if (checkoutItems.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "checkout products are not found",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "fetch checkout products successful",
            data: checkoutItems,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching checkout product detail: ${error.message}`,
        });
    }
};

const getTotalStockQuantity = async (req, res) => {
    try {
        const totalStock = await productService.getTotalStockQuantity();
        return res.status(200).json({
            code: 1,
            message: "fetch total stock quantity successful",
            data: totalStock,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching total stock quantity: ${error.message}`,
        });
    }
}

const getTotalAlmostOutOfStockQuantity = async (req, res) => {
    try {
        const numberOfAlmostOutOfStock = await productService.getTotalAlmostOutOfStockQuantity();

        return res.status(200).json({
            code: 1,
            message: "fetch number of almost out of stock products successful",
            data: numberOfAlmostOutOfStock,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when fetching number of almost out of stock products: ${error.message}`,
        });
    }
}

const searchProductsByName = async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
        return res.status(400).json({
            code: 0,
            message: "keyword is required",
        });
    }

    try {
        const products = await productService.searchProductsByName(keyword);
        return res.status(200).json({
            code: 1,
            message: "search products successful",
            data: products,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when searching products: ${error.message}`,
        });
    }
};

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

const updateProductStock = async (req, res) => {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    if (stockQuantity === undefined || typeof stockQuantity !== "number") {
        return res.status(400).json({
            code: 0,
            message: "invalid product stock quantity",
        });
    }

    try {
        const result = await productService.updateProductStock(id, stockQuantity);

        if (!result) {
            return res.status(404).json({
                code: 0,
                message: "product not found",
            });
        }

        return res.status(200).json({
            code: 1,
            message: "update product stock quantity successul",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when updating product stock: ${error.message}`,
        });
    }
};

const bulkUpdateProductStock = async (req, res) => {
    const productsToUpdate = req.body;

    if (!Array.isArray(productsToUpdate) || productsToUpdate.length === 0) {
        return res.status(400).json({
            code: 0,
            message: "products and quantities are an array",
        });
    }

    for (const item of productsToUpdate) {
        if (!item.id || item.stockQuantity === undefined || typeof item.stockQuantity !== "number") {
            return res.status(400).json({
                code: 0,
                message: "invalid inputs, inputs include id and stock quantity with datatypes number"
            });
        }
    }

    try {
        const results = await productService.bulkUpdateProductStock(productsToUpdate);
        return res.status(200).json({
            code: 1,
            message: "bulk update product stock quantities successful",
            data: results,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: "error when bulk updating product stock quantities",
        });
    }
};

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
    getNumberOfProducts,
    getSuggestedProducts,
    getPaginationProducts,
    getFilteredPaginationProducts,
    getProductsByCategoryID,
    getCheckoutProductDetail,
    getTotalStockQuantity,
    getTotalAlmostOutOfStockQuantity,
    searchProductsByName,
    createProduct,
    updateProduct,
    bulkUpdateProductStock,
    updateProductStock,
    deleteProduct,
}
