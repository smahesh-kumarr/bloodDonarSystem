const express = require("express");
const {
  createCampaign,
  approveCampaign,
  rejectCampaign,
  getApprovedCampaigns,
  getHospitalCampaigns,
  registerForCampaign,
  getCampaignParticipants,
} = require("../controllers/campaignController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (No auth required for admin email action links)
router.get("/:id/approve", approveCampaign);
router.get("/:id/reject", rejectCampaign);

// User/public facing to view campaigns
router.get("/active", getApprovedCampaigns);

// Protection middleware for the rest
router.use(protect);

// Hospital only
router.route("/").post(createCampaign).get(getHospitalCampaigns);

router.get("/:id/participants", getCampaignParticipants);

// Donor actions
router.post("/:id/register", registerForCampaign);

module.exports = router;
