const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes");
const globalErrorHandler = require("./middleware/errorMiddleware");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Notification Service is running");
});

// Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5004;

const server = app.listen(PORT, () => {
  console.log(
    `Notification Service running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
