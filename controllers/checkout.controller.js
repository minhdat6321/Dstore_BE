const { default: mongoose } = require("mongoose");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const Cart = require("../models/Cart");
const { Product } = require("../models/Product");
const Order = require("../models/Order");
const {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} = require("@paypal/paypal-server-sdk");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Initialize PayPal client
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);

const checkoutController = {};


// Helper function to check and retrieve product details
const checkProductByServer = async (products) => {
  return await Promise.all(products.map(async (product) => {
    const foundProduct = await Product.findOne({ _id: product.productId });
    if (foundProduct) {
      return {
        price: foundProduct.product_price,
        quantity: product.quantity,
        productId: product.productId,
        name: foundProduct.product_name,
        thumb: foundProduct.product_thumb,
        stock: foundProduct.product_quantity,
      };
    }
    return null;
  }));
};

// Review checkout order
checkoutController.checkoutReview = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { order_ids, cartId } = req.body;

  const checkout_order = {
    totalPrice: 0,
    feeShip: 0,
    totalDiscount: 0,
    totalCheckout: 0,
  };
  const order_ids_new = [];

  const cartFound = await Cart.findOne({
    _id: cartId,
    cart_state: "active",
  });
  if (!cartFound) {
    throw new AppError(400, "Cart not found by ID", "Checkout Review Error");
  }

  for (const order of order_ids) {
    const { discounts = [], item_products = [] } = order;

    // Retrieve product details
    const itemProductsWithDetails = await checkProductByServer(item_products);
    const validProducts = itemProductsWithDetails.filter(Boolean);

    if (validProducts.length === 0) {
      throw new AppError(400, "Invalid Order", "Checkout Review Error");
    }

    const checkoutPrice = validProducts.reduce((acc, product) => {
      return acc + product.quantity * product.price;
    }, 0);

    checkout_order.totalPrice += checkoutPrice;

    const itemCheckout = {
      discounts,
      priceRaw: checkoutPrice,
      priceApplyDiscount: checkoutPrice,
      item_products: validProducts,
    };

    checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
    order_ids_new.push(itemCheckout);
  }

  sendResponse(
    res,
    200,
    true,
    { order_ids, order_ids_new, checkout_order },
    null,
    "Checkout Order Review retrieved successfully"
  );
});

// PayPal Order Creation
checkoutController.createPaypalOrder = catchAsync(async (req, res, next) => {
  const { totalCheckout } = req.body;

  const orderRequest = {
    intent: "CAPTURE",
    purchaseUnits: [
      {
        amount: {
          currencyCode: "USD",
          value: totalCheckout,
        },
      },
    ],
  };

  try {
    const { body } = await ordersController.ordersCreate({ body: orderRequest });
    sendResponse(res, 200, true, JSON.parse(body), null, "PayPal order created");
  } catch (error) {
    next(new AppError(500, error.message, "PayPal Error"));
  }
});

// PayPal Order Capture
checkoutController.capturePaypalOrder = catchAsync(async (req, res, next) => {
  const { orderID } = req.params;
  console.log("orderID ", orderID);

  try {
    // Create capture request object
    const captureRequest = {
      id: orderID,
      prefer: "return=minimal",
    };

    // Capture the order using ordersController
    const { body } = await ordersController.ordersCapture(captureRequest);
    const capturedOrder = JSON.parse(body);

    // Check if the transaction was completed
    if (capturedOrder.status !== "COMPLETED") {
      throw new AppError(400, "Transaction not completed", "PayPal Capture Error");
    }

    // Send the captured order details in response
    sendResponse(res, 200, true, capturedOrder, null, "Order captured successfully");
  } catch (error) {
    next(new AppError(500, error.message, "PayPal Error"));
  }
});


module.exports = checkoutController;
