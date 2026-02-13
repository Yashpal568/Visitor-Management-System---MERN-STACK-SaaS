const rateLimit = require("express-rate-limit");

// 1. Global API Limiter (Standard protection)
// 100 requests per 15 minutes per IP
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Auth Limiter (Brute-force protection)
// 5 login/signup attempts per 15 minutes (Strict)
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts
    message: {
        status: 429,
        message: "Too many login attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Subscription/Payment Limiter (Prevent abuse of payment APIs)
exports.paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        status: 429,
        message: "Too many payment requests, please try again later",
    },
});
