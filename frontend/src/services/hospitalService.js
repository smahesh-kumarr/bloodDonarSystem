import axios from "axios";
import Cookies from "js-cookie";

const HOSPITAL_API =
  import.meta.env.VITE_HOSPITAL_API || "http://localhost:5005/api/v1/hospital";

// Helper to configure authorization headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create a new hospital profile (immediately after registration)
// Get the current hospital's detailed profile & inventory
const getMe = async () => {
  const response = await axios.get("`${HOSPITAL_API}/me`", getAuthHeaders());
  return response.data;
};

const createProfile = async (profileData) => {
  const response = await axios.post(
    `${HOSPITAL_API}/profile`,
    profileData,
    getAuthHeaders(),
  );
  return response.data;
};

// Update hospital profile details
const updateProfile = async (profileData) => {
  const response = await axios.put(
    `${HOSPITAL_API}/profile`,
    profileData,
    getAuthHeaders(),
  );
  return response.data;
};

// Update blood inventory manually (add/deduct)
const updateInventory = async (bloodGroup, units, operation = "add") => {
  // Backend expects an object like {"A+": 2, "O-": -1}
  const payload = {
    [bloodGroup]: operation === "add" ? units : -units,
  };

  const response = await axios.put(
    `${HOSPITAL_API}/inventory`,
    payload,
    getAuthHeaders(),
  );
  return response.data;
};

// Initiate an inter-hospital blood transfer
const createTransfer = async (receiverEmail, bloodGroup, units) => {
  const response = await axios.post(
    `${HOSPITAL_API}/transfer`,
    { receiverEmail, bloodGroup, units },
    getAuthHeaders(),
  );
  return response.data;
};

// Get all transfers related to this hospital (incoming and outgoing)
const getTransfers = async () => {
  const response = await axios.get(
    `${HOSPITAL_API}/transfer`,
    getAuthHeaders(),
  );
  return response.data;
};

// Accept an incoming transfer
const acceptTransfer = async (transferId) => {
  const response = await axios.put(
    `${HOSPITAL_API}/transfer/${transferId}/accept`,
    {},
    getAuthHeaders(),
  );
  return response.data;
};

// Mark an ongoing transfer as completed
const completeTransfer = async (transferId) => {
  const response = await axios.put(
    `${HOSPITAL_API}/transfer/${transferId}/complete`,
    {},
    getAuthHeaders(),
  );
  return response.data;
};

// Public: Get a list of all verified hospitals
const getAllHospitals = async () => {
  const response = await axios.get(`${HOSPITAL_API}/all`);
  return response.data;
};

const hospitalService = {
  getMe,
  createProfile,
  updateProfile,
  updateInventory,
  createTransfer,
  getTransfers,
  acceptTransfer,
  completeTransfer,
  getAllHospitals,
  createCampaign: async (data) =>
    (await axios.post(`${HOSPITAL_API}/campaigns`, data, getAuthHeaders()))
      .data,
  getMyCampaigns: async () =>
    (await axios.get(`${HOSPITAL_API}/campaigns`, getAuthHeaders())).data,
  updateCampaign: async (id, data) =>
    (await axios.put(`${HOSPITAL_API}/campaigns/${id}`, data, getAuthHeaders()))
      .data,
  getActiveCampaigns: async () =>
    (await axios.get(`${HOSPITAL_API}/campaigns/active`)).data,
  getCampaignParticipants: async (id) =>
    (
      await axios.get(
        `${HOSPITAL_API}/campaigns/${id}/participants`,
        getAuthHeaders(),
      )
    ).data,
  registerForCampaign: async (id, data) =>
    (
      await axios.post(
        `${HOSPITAL_API}/campaigns/${id}/register`,
        data,
        getAuthHeaders(),
      )
    ).data,
};

export default hospitalService;
