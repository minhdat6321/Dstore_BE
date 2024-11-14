const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const authentication = require('../../middlewares/authentication');

/**
 * @route POST /cart 
 * @description  
 * create a cart if user add 1 product 
 * check cart existed 
 * check product existed in cart => Y: update quantity || N: create new product in cart
 * @body {
 * {
    "product": {

        "productId": "6706b09bfb15ef50c8e4f872",
        "quantity": "123"
    }
    
}}
 * @access Private User
 */
router.post('/', authentication.loginRequired, cartController.addToCartByProductId)

/**
 * @route GET /cart 
 * @description  
 * Get list products in cart
 * @access Private || ADMIN
 */
router.get('/', authentication.loginRequired, cartController.getListProductsInCart)

/**
 * @route POST /cart/update
 * @description  
 * Update quantity's product in cart
 * @body 
 * order_ids [
 *  {
 *    item_products: [
 *      {
 *        productId,
 *        price,
 *        quantity,
 *        old_quantity
 *      }
 *    ]
 *   }
 * ]
 * @access Private || ADMIN
 */
router.patch('/update', authentication.loginRequired, cartController.updateProductQuantity)

/**
 * @route DELETE /cart 
 * @description  
 * Delete product in cart
 * @body {
    "productId": "6706b09bfb15ef50c8e4f872"
}
 * @access Private 
 */
router.delete('/', authentication.loginRequired, cartController.deleteProductInCart)

module.exports = router 