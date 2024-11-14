const express = require("express");
const userController = require("../../controllers/user.controller");
const router = express.Router();
const { body, param } = require("express-validator");
const validators = require("../../middlewares/validators");
const authentication = require("../../middlewares/authentication");

/**
 * @route POST /users
 * @description Register new user
 * @body {name, email, password}
 * @access Public
 */
router.post(
  "/",
  validators.validate([
    body("firstName", "Invalid name").exists().notEmpty(),
    body("lastName", "Invalid name").exists().notEmpty(),
    body("phone", "Invalid phone").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", authentication.loginRequired, userController.getCurrentUser);


/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body { "firstName",
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
    "address",}
 * @access CurrentUser === userId || ADMIN 
 */

router.put(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.updateProfile
);

module.exports = router;