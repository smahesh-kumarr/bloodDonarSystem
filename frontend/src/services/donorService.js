import axios from "axios";
import Cookies from "js-cookie";

const DONOR_API_URL =
  import.meta.env.VITE_DONOR_API || "http://localhost:5002/api/v1/donors";

// Get stored token
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create Donor Profile
const createDonorProfile = async (donorData) => {
  const response = await axios.post(
    `${DONOR_API_URL}/`,
    donorData,
    getAuthHeaders(),
  );
  return response.data;
};

// Get My Donor Profile
const getMyDonorProfile = async () => {
  try {
    const response = await axios.get(`${DONOR_API_URL}/me`, getAuthHeaders());
    return response.data;
  } catch (error) {
    // If 404, it means profile doesn't exist yet
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

// Update Donor Profile
const updateDonorProfile = async (donorData) => {
  const response = await axios.put(
    `${DONOR_API_URL}/me`,
    donorData,
    getAuthHeaders(),
  );
  return response.data;
};

// Toggle Availability
const toggleAvailability = async () => {
  const response = await axios.patch(
    `${DONOR_API_URL}/availability`,
    {},
    getAuthHeaders(),
  );
  return response.data;
};

// Get Donors (Public/Filtered)
const getDonors = async (filters = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && String(v).trim() !== "",
    ),
  );

  const queryParams = new URLSearchParams({
    ...cleaned,
    _ts: Date.now().toString(),
  }).toString();

  const response = await axios.get(`${DONOR_API_URL}?${queryParams}`, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  return response.data;
};

// Get Nearby Donors
const getDonorsNearby = async (lat, lng, distance = 10) => {
  const response = await axios.get(
    `${DONOR_API_URL}/nearby?latitude=${lat}&longitude=${lng}&distance=${distance}`,
  );
  return response.data;
};

const donorService = {
  createDonorProfile,
  getMyDonorProfile,
  updateDonorProfile,
  toggleAvailability,
  getDonors,
  getDonorsNearby,
};

export default donorService;
