const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyHospital,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/verify-hospital/:id/:action", verifyHospital);

module.exports = router;
