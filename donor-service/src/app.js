const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const donorRoutes = require("./routes/donorRoutes");
const globalErrorHandler = require("./middleware/errorMiddleware");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust first hop (AWS ALB) so req.secure and cookies work correctly
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// CORS — origins come from env var (no hardcoding)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
app.use(cors({ origin: allowedOrigins, credentials: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1/donors", donorRoutes);

app.get("/", (req, res) => {
  res.send("Donor Service is running");
});

// Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(
    `Donor Service running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
