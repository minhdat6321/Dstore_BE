const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const Cart = require("../models/Cart");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  // get data from request
  let { firstName, lastName, phone, email, password } = req.body;
  console.log(req.body)
  // validation
  let user = await User.findOne({ email: email });
  if (user)
    throw new AppError(400, "User already exists", "registration Error");
  // process
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ firstName, lastName, phone, email, password });
  const accessToken = await user.generateToken();

  const userCart = await Cart.create({
    cart_state: "active",
    _id: user._id,
    cart_userId: user._id
  })
  // response
  sendResponse(res, 200, true, user, null, "create user successfully");
});


userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(400, "User not found", "Get Current User Error");
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "get current user successfully"
  );
});


userController.updateProfile = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.userId;

  if (currentUserId !== userId)
    throw new AppError(400, "Permission denied", "Update User Error");
  let user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Update User Error");

  const allows = [
    "firstName",
    "lastName",
    "email",
    "phone",

    "password",

    "avatarUrl",
    "coverUrl",

    "city",
    "country",
    "state",
    "zipCode",
    "address",
  ];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();

  return sendResponse(res, 200, true, user, null, "Update user successfully");
});

module.exports = userController;