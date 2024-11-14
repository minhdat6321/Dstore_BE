const express = require("express");
const { loginWithEmail } = require("../../controllers/auth.controller");
const validators = require("../../middlewares/validators");
const router = express.Router();
const { body } = require("express-validator");

/**
 * @route POST /auth/login
 * @description login with email and password
 * @body {email, password}
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  loginWithEmail
);

module.exports = router;