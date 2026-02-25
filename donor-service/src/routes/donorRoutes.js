const express = require("express");
const {
  createDonorProfile,
  getMyDonorProfile,
  getDonors,
  getDonorsNearby,
  toggleAvailability,
} = require("../controllers/donorController");

// Reuse auth middleware (we'll need to duplicate/share the file or publish it as a library in real microservices)
// For now, assume we have a copy in src/middleware/authMiddleware.js
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createDonorProfile).get(getDonors); // Publicly searchable? Yes.

router.get("/me", protect, getMyDonorProfile);
router.get("/nearby", getDonorsNearby);
router.patch("/availability", protect, toggleAvailability);

module.exports = router;
