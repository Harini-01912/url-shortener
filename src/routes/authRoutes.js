const express = require("express");
const router = express.Router();

const authController =
    require("../controllers/authController");
const authMiddleware =
    require("../middlewares/authMiddleware");

console.log(require.resolve("../middlewares/authMiddleware"));
console.log(authMiddleware);
console.log("authMiddleware:", typeof authMiddleware);
console.log("register:", typeof authController.register);
console.log("login:", typeof authController.login);
console.log("getMyUrls:", typeof authController.getMyUrls);
router.get(
    "/me/urls",
    authMiddleware,
    authController.getMyUrls
);
router.post(

    "/register",
    authController.register
);
router.post(
    "/login",
    authController.login
);

module.exports = router;