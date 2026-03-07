const express = require("express");
const {
  createProfile,
  updateProfile,
  getMe,
  getAllHospitals,
  updateInventory,
  createTransfer,
  acceptTransfer,
  completeTransfer,
  getTransfers,
} = require("../controllers/hospitalController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/all", getAllHospitals);

// Protected routes (Hospital only)
router.use(protect);
router.use(authorize("hospital", "admin"));

router.route("/profile").post(createProfile).put(updateProfile);

router.get("/me", getMe);
router.put("/inventory", updateInventory);

// Transfers
router.route("/transfer").post(createTransfer).get(getTransfers);

router.put("/transfer/:id/accept", acceptTransfer);
router.put("/transfer/:id/complete", completeTransfer);

module.exports = router;
