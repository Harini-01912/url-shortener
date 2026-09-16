const { body } = require("express-validator");

exports.createUrlValidation = [
    body("url")
        .notEmpty()
        .withMessage("URL is required")
        .isURL()
        .withMessage("Please provide a valid URL"),

    body("expiresAt")
        .optional()
        .isISO8601()
        .withMessage("expiresAt must be a valid date")
];