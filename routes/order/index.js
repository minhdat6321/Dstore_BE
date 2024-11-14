const express = require('express');
const router = express.Router();
const authentication = require('../../middlewares/authentication');
const orderController = require('../../controllers/order.controller');

/**
 * @route Patch /orders/completed
 * @description  
 * Update quantity's product in cart
 * @body 
 * @access Private || ADMIN
 */
router.get('/completed', authentication.loginRequired, orderController.getAllCompletedOrders)

/**
 * @route Post /orders/create/:orderID/
 * @description  
Create Order in Database after Paying, Capture
 * @body 
{
    paypalOrderId,
    paypalCaptureId,
    currencyCode,
    value,
    payerEmail,
    payerId,
    order_checkout,
    order_shipping,
    order_products,
  }
 * @access Private user
 */
router.post('/create/:orderID/', authentication.loginRequired, orderController.createOrderAfterCapture)


module.exports = router 