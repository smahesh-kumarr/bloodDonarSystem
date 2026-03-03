import axios from "axios";
import Cookies from "js-cookie";

const NOTIFICATION_API_URL =
  import.meta.env.VITE_NOTIFICATION_API ||
  "http://localhost:5004/api/v1/notifications";

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const sendPersonalRequest = async (
  email,
  donorName,
  requesterName,
  requesterPhone,
) => {
  const payload = {
    email,
    subject: "URGENT: Personal Blood Request via Redora",
    message: `Hello ${donorName},\n\nYou have received an urgent personal blood request on Redora.\n\nRequester: ${requesterName}\nContact Number: ${requesterPhone}\n\nPlease contact the requester immediately if you are available to donate blood.\n\nThank you,\nThe Redora Team`,
  };

  const response = await axios.post(
    `${NOTIFICATION_API_URL}/send`,
    payload,
    getAuthHeaders(),
  );
  return response.data;
};

const notificationService = {
  sendPersonalRequest,
};

export default notificationService;
