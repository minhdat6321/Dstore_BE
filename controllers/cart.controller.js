const { default: mongoose } = require("mongoose");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const Cart = require("../models/Cart");
const { Product } = require("../models/Product");


const createUserCart = async ({ currentUserId, product }) => {
  const query = { cart_userId: currentUserId, cart_state: 'active' };
  const updateOrInsert = {
    $addToSet: {
      cart_products: product
    }
  };
  const options = { upsert: true, new: true };

  const userCart = await Cart.findOneAndUpdate(query, updateOrInsert, options);

  // Update the cart count product
  await updateCartCountProduct(userCart._id);

  return userCart;
};

// Helper function to update total count of products in the cart
const updateCartCountProduct = async (cartId) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return 0;

  // Sum the total quantity of all products in the cart
  cart.cart_count_product = cart.cart_products.reduce((sum, product) => sum + product.quantity, 0);

  // Save the updated cart
  await cart.save();
  return cart.cart_count_product;
};

// Helper function to update or add product quantity in the cart
const updateUserCartQuantity = async ({ currentUserId, product, isIncrement }) => {
  const { productId, quantity } = product;

  const query = {
    cart_userId: currentUserId,
    'cart_products.productId': productId,
    cart_state: 'active',
  };

  // Find the cart
  let userCart = await Cart.findOne({ cart_userId: currentUserId, cart_state: 'active' });
  if (!userCart) throw new Error("Cart not found");

  // Check if the product already exists in the cart
  const existingProduct = userCart.cart_products.find(p => p.productId.toString() === productId.toString());

  if (existingProduct) {
    // If in cart, update quantity based on increment or direct set
    existingProduct.quantity = isIncrement
      ? existingProduct.quantity + quantity
      : quantity;

    // If quantity is zero or less, remove the product from the cart
    if (existingProduct.quantity <= 0) {
      userCart.cart_products = userCart.cart_products.filter(p => p.productId.toString() !== productId.toString());
    }
  } else if (isIncrement) {
    // If product not found in cart, add it with specified quantity
    userCart.cart_products.push(product);
  } else {
    throw new Error("Product not found in cart to update");
  }

  // Save the updated cart and refresh the cart count
  await userCart.save();
  await updateCartCountProduct(userCart._id);

  return userCart;
};

const cartController = {};

cartController.createNewCart = catchAsync(async (req, res, next) => {
  const currentUserId = req.body.userId;

  // Check if product exists
  const userCart = await Cart.create({
    cart_state: "active",
    _id: currentUserId,
    cart_userId: currentUserId
  })

  sendResponse(res, 200, true, userCart, null, "Create a new cart successfully");
});

// POST: Add Product to Cart
cartController.addToCartByProductId = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { product } = req.body;
  const { productId, quantity } = product;

  // Check if product exists
  const productFound = await Product.findById(productId);
  if (!productFound) throw new AppError(404, "Product not found", "Add To Cart Error");

  // check quantity 
  if (productFound.product_quantity < quantity) throw new AppError(404, "Exceeds the stock", "Add To Cart Error");

  let userCart = await Cart.findOne({ cart_userId: currentUserId });

  if (!userCart) {
    userCart = await createUserCart({ currentUserId, product });
  } else {
    const existingProduct = userCart.cart_products.find(p => p.productId.toString() === productId.toString());

    if (existingProduct) {
      // Update quantity if product exists
      existingProduct.quantity += quantity;
    } else {
      // Add new product to cart
      userCart.cart_products.push(product);
    }

    // Save the updated cart and refresh the count immediately
    await userCart.save();
    await updateCartCountProduct(userCart._id); // Ensure count is updated immediately
  }

  // Fetch updated cart for response with populated product data
  const populatedCart = await Cart.findById(userCart._id).populate("cart_products.productId");

  sendResponse(res, 200, true, populatedCart, null, "Product added to cart successfully");
});

// GET: Get list of products in Cart
cartController.getListProductsInCart = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  // Find the user's active cart
  const userCart = await Cart.findOne({ cart_userId: currentUserId, cart_state: 'active' })
    .populate("cart_products.productId");

  if (!userCart) {
    throw new AppError(404, "Cart not found", "Get list products in Cart Error");
  }

  // Response
  sendResponse(
    res,
    200,
    true,
    userCart,
    null,
    "Get list products in Cart successfully"
  );
});


// PATCH: Update Product Quantity in Cart
cartController.updateProductQuantity = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { productId, quantity } = req.body;

  // Validate input data
  if (typeof quantity !== 'number') {
    return next(new AppError(400, "Quantity must be a number", "Invalid input"));
  }

  // Directly set the specified quantity
  const updatedCart = await updateUserCartQuantity({
    currentUserId,
    product: { productId, quantity },
    isIncrement: false // Set quantity directly rather than incrementing
  });

  // Populate the product details in the updated cart for response
  const populatedCart = await Cart.findById(updatedCart._id).populate("cart_products.productId");

  // Send response
  sendResponse(res, 200, true, populatedCart, null, "Updated product quantity in cart successfully");
});


// DELETE: Remove product from cart
cartController.deleteProductInCart = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { productId } = req.body;

  // Update the cart by removing the specified product
  const updatedCart = await Cart.findOneAndUpdate(
    { cart_userId: currentUserId, cart_state: 'active' },
    { $pull: { cart_products: { productId } } },
    { new: true }
  ).populate("cart_products.productId"); // Populate product details

  if (!updatedCart) {
    throw new AppError(404, "Cart not found or product not in cart", "Delete Product Error");
  }

  // Update the cart count product
  await updateCartCountProduct(updatedCart._id);

  // Reload the cart with the updated count and populated details
  const populatedCart = await Cart.findById(updatedCart._id).populate("cart_products.productId");

  // Send response with the updated cart
  sendResponse(res, 200, true, populatedCart, null, "Deleted product from cart successfully");
});

module.exports = cartController;
