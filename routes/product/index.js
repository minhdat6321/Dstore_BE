const express = require('express');
const router = express.Router();
const { sendResponse, AppError, catchAsync } = require("../../helpers/utils");
const productController = require('../../controllers/product.controller');
const authentication = require('../../middlewares/authentication');


/**
 * @route POST /product
 * @description Create a new product
 * @body {product_name, product_thumb, product_description, product_price,
    product_type, product_attributes, product_quantity}
 * @access Private ( ADMIN )
 */
router.post("/", authentication.loginRequired, authentication.adminRequired, productController.createNewProduct)

/*

 * @route GET /product/search?keySearch=phone&page=1&limit=5&isPublished=true&priceRange=between&category=All&sort=priceDesc
 * @description Using Search to GET list Products
 * @access Public
 */
//get search list Products
router.get("/search", productController.getSearchListProducts)

/** 
 * @route GET /product?sort='ctime'&page=1&limit=50&isPublished=true&priceRange=between&category=All
 * @description Using Search to GET list Products
 * @access Public
 */
//get list Products newest
router.get("/", productController.getListProducts)

/**
 * @route GET /product/:product_id
 * @description  GET a detailed Product by ID
 * @access Public
 */
//get product by ID
router.get("/:product_id", productController.getProductById)

/**
 * @route PATCH /product/:product_id
 * @description  Update info Product by ID
 * @body {product_name, product_thumb, product_description, product_price,
    product_type, product_attributes, product_quantity,
}
 * @access Private ( ADMIN )
 */

//Patch update product by ID
router.patch("/:product_id", authentication.loginRequired, authentication.adminRequired, productController.updateProductById)

/**
 * @route PATCH /product/:product_id
 * @description  Update info Product by ID After paying
 * @body {product_quantity}
 * @access Private user
 */

//Patch update product_stock by ID
router.patch("/update/stock/:product_id", authentication.loginRequired, productController.updateProductQuantityAfterPayment)

module.exports = router 