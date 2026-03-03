import axios from "axios";
import Cookies from "js-cookie";

const REQUEST_API_URL =
  import.meta.env.VITE_REQUEST_API || "http://localhost:5003/api/v1/requests";

// Get stored token
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const createRequest = async (requestData) => {
  const response = await axios.post(
    `${REQUEST_API_URL}/`,
    requestData,
    getAuthHeaders(),
  );
  return response.data;
};

const getRequests = async (filters = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && String(v).trim() !== "",
    ),
  );

  const queryParams = new URLSearchParams(cleaned).toString();

  const response = await axios.get(
    `${REQUEST_API_URL}${queryParams ? "?" + queryParams : ""}`,
    getAuthHeaders(),
  );
  return response.data;
};

const getCompletedRequests = async (filters = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && String(v).trim() !== "",
    ),
  );

  const queryParams = new URLSearchParams(cleaned).toString();

  const response = await axios.get(
    `${REQUEST_API_URL}/completed${queryParams ? "?" + queryParams : ""}`,
    getAuthHeaders(),
  );
  return response.data;
};

const getRequestById = async (id) => {
  const response = await axios.get(
    `${REQUEST_API_URL}/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

const acceptRequest = async (id) => {
  const response = await axios.patch(
    `${REQUEST_API_URL}/${id}/accept`,
    {},
    getAuthHeaders(),
  );
  return response.data;
};

const updateRequestStatus = async (id, status) => {
  const response = await axios.patch(
    `${REQUEST_API_URL}/${id}/status`,
    { status },
    getAuthHeaders(),
  );
  return response.data;
};

const deleteRequest = async (id) => {
  const response = await axios.delete(
    `${REQUEST_API_URL}/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

const requestService = {
  createRequest,
  getRequests,
  getCompletedRequests,
  getRequestById,
  acceptRequest,
  updateRequestStatus,
  deleteRequest,
};

export default requestService;
