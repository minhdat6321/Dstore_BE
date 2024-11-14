const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/checkout.controller');
const authentication = require('../../middlewares/authentication');


/**
 * @route POST /checkout
 * @description  checkout REVIEW
 * @body 
 * {
 * cartId
  "order_ids": [
    {
      "discounts": [
        {
          "discountId",
          "codeId"
        }
      ],
      "item_products": [
        {
          "price",
          "quantity",
          "productId"
        }
      ]
    },
    {
    "discounts": [
        {
          "discountId",
          "codeId"
        }
      ],
      "item_products": [
        {
          "price",
          "quantity",
          "productId"
        }
      ]
    }
  ]
}
 * @access Private user
 */
router.post('/', authentication.loginRequired, checkoutController.checkoutReview)

// PayPal Order Routes
router.post("/orders", authentication.loginRequired, checkoutController.createPaypalOrder);


router.post("/orders/:orderID/capture", authentication.loginRequired, checkoutController.capturePaypalOrder);


module.exports = router 