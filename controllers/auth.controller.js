const bcryptjs = require("bcryptjs");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // get data from request
  const { email, password } = req.body;

  // login validation
  const user = await User.findOne({ email }, "+password");
  if (!user) throw new AppError(400, "Invalid Credentials", "Login Error");

  // process
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong password", "Login Error");
  const accessToken = await user.generateToken();

  // response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login successfully"
  );
});

module.exports = authController;