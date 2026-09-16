const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        error: "Too many requests. Try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        error: "Too many login or registration attempts. Please wait 15 minutes and try again."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

module.exports = {
    apiLimiter,
    authLimiter
};