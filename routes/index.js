const express = require('express');
const router = express.Router();
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send({ status: "ok", data: "Hello" })
});

router.use('/auth', require('./auth'))

router.use('/users', require('./user'))
router.use('/products', require('./product'))
router.use('/cart', require('./cart'))

router.use('/checkout', require('./checkout'))
router.use('/orders', require('./order'))

module.exports = router;
