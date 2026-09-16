const express = require("express");
const router = express.Router();

const urlController = require("../controllers/urlController");
const authMiddleware =
    require("../middlewares/authMiddleware");
const {
    createUrlValidation
} = require("../validators/urlValidator");

const validationMiddleware =
    require("../middlewares/validationMiddleware");

router.post(
    "/",
    authMiddleware,
    createUrlValidation,
    validationMiddleware,
    urlController.createShortUrl
);

router.get(
    "/stats/:shortCode",
    urlController.getStats
);

router.get(
    "/:shortCode",
    urlController.redirectToOriginalUrl
);

module.exports = router;