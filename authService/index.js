const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const publicKeyRoute = require("./routes/auth/publicKeyRoute");
const loginRoute = require("./routes/auth/loginRoute");
const { correlationIdMiddleware } = require("../correlationId");

dotenv.config();
// Set up rate limiting


// Initialize express app
const app = express();
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 MINUTE
  max: 5, // Limit each IP to 10 requests per windowMs
  message: "Too many requests, please try again later.",
  headers: true, // Enable rate limit headers
});

// Middleware
app.use(express.json());
app.use( correlationIdMiddleware);
app.use(limiter); // Middleware to handle correlation IDs

// Public Key
app.use("/.well-known/jwks.json", publicKeyRoute);   //stores the public key

// Routes
app.use("/api/login", limiter, loginRoute);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth Server running on port ${PORT}`);
});
