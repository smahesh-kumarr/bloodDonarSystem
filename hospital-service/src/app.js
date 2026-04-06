const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust first hop (AWS ALB) so req.secure and cookies work correctly
app.set("trust proxy", 1);

// Body parser
app.use(express.json());

// CORS — origins come from env var (no hardcoding)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Route files
const hospitalRoutes = require("./routes/hospitalRoutes");
const campaignRoutes = require("./routes/campaignRoutes");

// Mount routers
app.use("/api/v1/hospital/campaigns", campaignRoutes);
app.use("/api/v1/hospital", hospitalRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5005;

const server = app.listen(
  PORT,
  console.log(
    `Hospital Service running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  ),
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
