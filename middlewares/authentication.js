const jwt = require("jsonwebtoken");
const { AppError } = require("../helpers/utils");
const User = require("../models/User");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authentication = {};

authentication.loginRequired = (req, res, next) => {
  try {
    console.log('[Req header]: ', req.headers)

    const tokenString = req.headers.authorization;
    if (!tokenString) throw new AppError(401, "Login required", "Authentication error");
    console.log('[Token STRING]: ', tokenString)
    const token = tokenString.replace("Bearer ", "");
    console.log('[Token]: ', token)

    jwt.verify(token, JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new AppError(401, "Login required", "Authentication Error");
        } else {
          throw new AppError(401, "Token is invalid", "Authentication Error");
        }
      }

      req.userId = payload._id;

      // Fetch the user's role based on the token
      const user = await User.findById(req.userId).select("role");
      if (!user) throw new AppError(404, "User not found", "Authentication Error");

      // Store the role in the request object for use in the controller if needed
      req.userRole = user.role;

      next();
    });
  } catch (error) {
    next(error);
  }
};

// Middleware to check if the user is an Admin
authentication.adminRequired = (req, res, next) => {
  if (req.userRole !== 'Admin') {
    return next(new AppError(403, "Admin access required", "Authorization error"));
  }
  next();
};

module.exports = authentication;