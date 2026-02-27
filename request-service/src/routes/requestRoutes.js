const express = require("express");
const {
  createRequest,
  getAllRequests,
  getCompletedRequests,
  getRequest,
  updateRequestStatus,
  deleteRequest,
  acceptRequest,
} = require("../controllers/requestController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// IMPORTANT: Specialized routes MUST be defined before parameterized routes (/:id)
router.get("/completed", getCompletedRequests);

// General collection routes
router.route("/").get(getAllRequests).post(createRequest);

// Action routes
router.patch("/:id/accept", acceptRequest);
router.patch("/:id/status", updateRequestStatus);

// Parameterized routes (/:id) - MUST be last
router.route("/:id").get(getRequest).delete(deleteRequest);

module.exports = router;
