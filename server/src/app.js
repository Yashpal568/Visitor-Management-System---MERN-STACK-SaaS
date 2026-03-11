const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();


// Security Middlewares
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL, 
  "http://localhost:5173", // Vite default
  "http://localhost:3000"  // React/Next default
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10kb" }));
// app.use(mongoSanitize());
// app.use(xss());
app.use(hpp());

// Rate Limiting
const { globalLimiter, authLimiter, paymentLimiter } = require("./middleware/rateLimiter");

// Rate Limiting
app.use(globalLimiter); // Apply to all requests
app.use("/auth", authLimiter); // Apply stricter limit to auth routes
app.use("/payment", paymentLimiter); // Apply strict limit to payment routes

//Routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/company", require("./routes/company.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/super-admin", require("./routes/superAdmin.routes"));
// app.use("/payment", require("./routes/payment.routes"));
console.log("companyActive type:", typeof require("./middleware/companyActive"));

app.use("/subscription", require("./routes/subscription.routes"));
app.use("/visitor", require("./routes/visitor.routes"));
app.use("/notifications", require("./routes/notification.routes"));
app.use("/security", require("./routes/security.routes"));
app.use("/payment", require("./routes/payment.routes"));




// Health Check
app.get("/", (req, res) => {
  res.json({ status: "VMS Backend Running 🚀" });
});

app.use(require("./middleware/errorHandler"));

module.exports = app;
