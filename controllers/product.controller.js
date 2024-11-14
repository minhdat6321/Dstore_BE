const { default: mongoose } = require("mongoose");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { Product, Phone, Tablet, Accessory, Watch } = require('../models/Product');

const productController = {};
productController.createNewProduct = catchAsync(async (req, res, next) => {
  // Add const currentUserId = req.userId;
  const currentUserId = req.userId; // Assuming user ID is passed in the request
  const {
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_attributes,
    product_quantity,
    isDraft = true, // Default value can be set to true or false based on your logic
    isPublished = false, // Default value can be set to true or false based on your logic
  } = req.body;

  const createData = {
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_attributes,
    product_quantity,
    isPublished,
  };

  // Check if the product already exists
  let product = await Product.findOne({
    product_name,
    product_thumb,
    product_description,
    product_type,
    product_attributes,
    isDraft, // Add isDraft and isPublished checks if required
    isPublished,
  });

  if (product) {
    throw new AppError(400, "Product already exists", "Create New Product Error");
  }

  // Business logic
  // Create New Product from req
  const newProduct = await Product.create(createData);
  if (!newProduct) {
    throw new AppError(400, "Create New Product Error", "Create New Product Error");
  }

  // Create Item from product_attributes
  // Optimize finding => assign id new Item = id product
  const createNewItem = await mongoose.model(product_type).create({
    ...product_attributes,
    _id: newProduct._id,
  });

  if (!createNewItem) {
    throw new AppError(400, "Creating a new Item UNSUCCESSFULLY", "Create New Item Error");
  }

  // Response
  sendResponse(res, 200, true, newProduct, null, "Create new product successfully");
});


// GET SEARCH list product 
productController.getSearchListProducts = catchAsync(async (req, res, next) => {
  let { page, limit, priceRange, category, sort, isPublished, ...filter } = { ...req.query };

  // Set default values for pagination
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [];

  // Set publication filter based on the isPublished parameter
  if (isPublished === undefined || isPublished === "true") {
    filterConditions.push({ isPublished: true });
  } else if (isPublished === "false") {
    filterConditions.push({ isPublished: false });
  }


  // Apply search filter if keySearch is provided
  if (filter.keySearch) {
    const searchPattern = new RegExp(filter.keySearch, "i"); // Case-insensitive search
    filterConditions.push({
      $text: { $search: searchPattern }
    });
  }

  // Apply category filter if provided
  if (category && category !== "All") {
    filterConditions.push({ product_type: category });
  }

  // Apply priceRange filter if provided
  if (priceRange) {
    let priceCondition;
    switch (priceRange) {
      case "below":
        priceCondition = { $lt: 200 };
        break;
      case "between":
        priceCondition = { $gte: 200, $lte: 750 };
        break;
      case "above":
        priceCondition = { $gt: 750 };
        break;
      default:
        break;
    }
    if (priceCondition) {
      filterConditions.push({ product_price: priceCondition });
    }
  }

  // Combine all filter conditions
  const filterCriteria = filterConditions.length ? { $and: filterConditions } : {};

  // Count total documents for pagination
  const count = await Product.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // Set sorting logic based on the sort parameter
  let sortOptions = {};
  if (sort === "priceDesc") {
    sortOptions.product_price = -1; // Sort by price descending
  } else if (sort === "priceAsc") {
    sortOptions.product_price = 1; // Sort by price ascending
  } else {
    sortOptions.score = { $meta: 'textScore' }; // Default sorting by relevance
  }

  // Fetch products based on filters and sorting
  let products = await Product.find(filterCriteria)
    .sort(sortOptions)
    .skip(offset)
    .limit(limit);

  // Send response with filtered products, total pages, and count
  return sendResponse(
    res,
    200,
    true,
    { products, totalPages, count },
    null,
    "get search list products successfully"
  );
});

// GET list products newest
productController.getListProducts = catchAsync(async (req, res, next) => {
  let { page, limit, sort, category, priceRange, isPublished, ...filter } = { ...req.query };

  // List of valid categories
  const allowedCategories = ['Phone', 'Watch', 'Tablet', 'Accessory'];

  // Check if category is provided and is valid
  if (category && !allowedCategories.includes(category)) {
    throw new AppError(400, "No products available in this category", "Get list products Error");
  }

  // Select specific fields to return
  const select = {
    'product_name': 1,
    'product_price': 1,
    'product_thumb': 1,
    'product_type': 1,
    'product_quantity': 1,
    'isPublished': 1,
  };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // Set up filter conditions including publication status and any additional filters
  const filterConditions = { ...filter };

  // Set publication filter based on the isPublished parameter
  if (isPublished === undefined || isPublished === "true") {
    filterConditions.isPublished = true;
  } else if (isPublished === "false") {
    filterConditions.isPublished = false;
  }

  if (category && category !== "All") {
    filterConditions.product_type = category;
  }

  // Apply price range filter
  if (priceRange === "below") {
    filterConditions.product_price = { $lt: 200 };
  } else if (priceRange === "between") {
    filterConditions.product_price = { $gte: 200, $lte: 750 };
  } else if (priceRange === "above") {
    filterConditions.product_price = { $gt: 750 };
  }

  // Count total products
  const count = await Product.countDocuments(filterConditions);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // Set sorting logic based on the sort parameter
  let sortOptions = {};
  if (sort === "priceDesc") {
    sortOptions.product_price = -1; // Sort by price descending
  } else if (sort === "priceAsc") {
    sortOptions.product_price = 1; // Sort by price ascending
  } else {
    sortOptions._id = 1; // Default to sorting by newest first (by _id)
  }

  // Fetch products based on filters and sorting
  let products = await Product.find(filterConditions)
    .sort(sortOptions)
    .skip(offset)
    .limit(limit)
    .select(select);

  // Send response with product list, total pages, and count
  return sendResponse(
    res,
    200,
    true,
    { products, totalPages, count },
    null,
    "Get list products successfully"
  );
});

// GET Product By Id
productController.getProductById = catchAsync(async (req, res, next) => {
  const product_id = req.params.product_id;

  // check product_id nay co khong 
  let product = await Product.findById(product_id);
  console.log("product_id", product_id)
  if (!product || product.isPublished === false) throw new AppError(400, "Product not found", "Get Product Error");
  console.log("product", product)


  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "get product by Id successfully"
  );
});

// PATCH Update Product By Id (ADMIN)
productController.updateProductById = catchAsync(async (req, res, next) => {
  const { product_type } = req.body;
  let inputData = req.body;
  const product_id = req.params.product_id;

  // Unselect unnecessary fields like __v
  const unSelect = { '__v': 0 };

  // Check input data === null or undefined to protect data
  const updateNestedObjectParser = (obj) => {
    const final = {};
    Object.keys(obj).forEach(k => {
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        const response = updateNestedObjectParser(obj[k]); // Recursive call for nested objects
        Object.keys(response).forEach(a => {
          final[`${k}.${a}`] = response[a]; // Flatten the nested object
        });
      } else if (obj[k] !== null && obj[k] !== undefined) {
        final[k] = obj[k]; // Directly add non-null, non-undefined values
      } else {
        delete obj[k]; // Remove null or undefined keys
      }
    });
    return final;
  };

  const checkedInputData = updateNestedObjectParser(inputData);

  // Check if the product exists
  let updateProduct = await Product.findById({ _id: product_id, isPublished: true });
  if (!updateProduct) throw new AppError(400, "Product not found", "Get Product Error");

  // Check if `product_attributes` need updating
  if (inputData.product_attributes) {
    await mongoose.model(product_type).findByIdAndUpdate(product_id, inputData.product_attributes, { new: true });
  }

  // Update the rest of the product fields
  updateProduct = await Product.findByIdAndUpdate(product_id, checkedInputData, { new: true }).select(unSelect);

  // Save the updated product
  await updateProduct.save();

  return sendResponse(
    res,
    200,
    true,
    updateProduct,
    null,
    "Patch update product by Id successfully"
  );
});

// PATCH Update Product Quantity by ID (after payment)
productController.updateProductQuantityAfterPayment = catchAsync(async (req, res, next) => {
  const { product_quantity } = req.body;
  const product_id = req.params.product_id;

  // Ensure the `product_quantity` field is provided
  if (product_quantity === null || product_quantity === undefined) {
    throw new AppError(400, "Product quantity is required", "Update Product Quantity Error");
  }

  // Validate that `product_quantity` is a non-negative integer
  if (typeof product_quantity !== 'number' || product_quantity < 0 || !Number.isInteger(product_quantity)) {
    throw new AppError(400, "Product quantity must be a non-negative integer", "Update Product Quantity Error");
  }

  // Find the product by ID and update the quantity
  const updatedProduct = await Product.findByIdAndUpdate(
    product_id,
    { product_quantity },
    { new: true, select: { '__v': 0 } } // Unselect the '__v' field
  );

  // Check if the product exists
  if (!updatedProduct) {
    throw new AppError(404, "Product not found", "Update Product Quantity Error");
  }

  // Send response with the updated product
  return sendResponse(
    res,
    200,
    true,
    updatedProduct,
    null,
    "Product quantity updated successfully"
  );
});

module.exports = productController;