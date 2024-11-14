const { model, Schema } = require('mongoose');
const DOCUMENT_NAME = "Cart";
const COLLECTIONS_NAME = "Carts";

// Declare the Schema of the Mongo model
const cartSchema = new Schema({
  cart_state: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'failed', 'pending'],
    default: 'active'
  },
  cart_products: [{
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product' // Reference product model dynamically
    },

    quantity: { type: Number, required: true }
  }],
  cart_count_product: {
    type: Number,
    default: 0
  },
  cart_userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Assuming a User model exists
  }
}, {
  collection: COLLECTIONS_NAME,
  timestamps: true,
});

//Export the model
module.exports = model(DOCUMENT_NAME, cartSchema);
