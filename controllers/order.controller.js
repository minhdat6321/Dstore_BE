const Order = require("../models/Order"); // Import the Order model
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");

const orderController = {};

// Create Order in Database after Paying, Capture
orderController.createOrderAfterCapture = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  // Destructure essential information from the unified req.body
  const {
    // Capture PayPal response details
    id: paypalOrderId,
    payment_source: {
      paypal: { email_address: payerEmail, account_id: payerId },
    },
    purchase_units: [
      {
        payments: {
          captures: [
            {
              id: paypalCaptureId,
              amount: { currency_code: currencyCode, value },
            },
          ],
        },
        shipping: {
          name: { full_name: fullName },
          address: {
            address_line_1: addressLine1,
            admin_area_2: city,
            admin_area_1: state,
            postal_code: postalCode,
            country_code: country,
          },
        },
      },
    ],

    // Capture order summary from the frontend request
    order_checkout,
    order_products,
  } = req.body;

  try {

    // Create the order record using the extracted information
    const newOrder = await Order.create({
      order_userId: currentUserId,
      order_checkout: {
        totalPrice: order_checkout.totalPrice,
        totalApplyDiscount: order_checkout.totalApplyDiscount || 0,
        feeShip: order_checkout.feeShip || 0,
      },
      order_shipping: {
        fullName,
        addressLine1,
        city,
        state,
        postalCode,
        country,
      },
      order_payment: {
        paypalOrderId,
        paypalCaptureId,
        status: "COMPLETED",
        amount: { currencyCode, value },
        payerEmail,
        payerId,
      },
      order_products: order_products.flatMap(order =>
        order.item_products.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          thumb: item.thumb,
          stock: item.stock,
        }))
      ),

      order_status: "confirmed", // Update the status as required
    });

    sendResponse(res, 200, true, newOrder, null, "Order created successfully with essential capture information");
  } catch (error) {
    next(new AppError(500, error.message, "Order Creation Error"));
  }
});

// Get all completed orders for the current user
orderController.getAllCompletedOrders = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  // Retrieve all orders with status 'COMPLETED' for the current user
  const completedOrders = await Order.find({
    order_userId: currentUserId,
    order_status: "confirmed"
  });

  sendResponse(res, 200, true, completedOrders, null, "Completed orders retrieved successfully");
});

module.exports = orderController;
