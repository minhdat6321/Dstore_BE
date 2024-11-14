const mongoose = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new mongoose.Schema(
  {
    order_userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order_checkout: {
      totalPrice: { type: Number, required: true },
      totalApplyDiscount: { type: Number, default: 0 },
      feeShip: { type: Number, default: 0 },
    },
    order_shipping: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, },
      city: { type: String, },
      state: { type: String, },
      postalCode: { type: String, },
      country: { type: String, required: true },
    },
    order_payment: {
      paypalOrderId: { type: String, required: true },
      paypalCaptureId: { type: String, required: true },
      status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING" },
      amount: {
        currencyCode: { type: String, required: true },
        value: { type: Number, required: true },
      },
      payerEmail: { type: String, required: true },
      payerId: { type: String, required: true },
    },
    order_products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        thumb: { type: String, required: true },
        stock: { type: Number, required: true },
      },
    ],
    order_trackingNumber: { type: String, default: "#0000118052022" },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "cancelled", "delivered"],
      default: "pending",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
