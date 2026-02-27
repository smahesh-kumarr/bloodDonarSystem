const express = require("express");
const {
  createRequest,
  getAllRequests,
  getCompletedRequests,
  getRequest,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/requestController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // Protect all routes in this file

// Specialized routes must come BEFORE dynamic routes like /:id
console.log(
  "Registering /completed route with handler:",
  getCompletedRequests ? "Function Found" : "UNDEFINED",
);
router.get("/completed", getCompletedRequests);

router.route("/").post(createRequest).get(getAllRequests);

router.route("/:id").get(getRequest).delete(deleteRequest);

router.patch("/:id/status", updateRequestStatus);

module.exports = router;
