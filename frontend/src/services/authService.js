import axios from "axios";
import Cookies from "js-cookie";

// Adjust base URL based on .env
const AUTH_API =
  import.meta.env.VITE_AUTH_API || "http://localhost:5001/api/v1/auth";

// Register user
const register = async (userData) => {
  const response = await axios.post(`${AUTH_API}/register`, userData);
  if (response.data.token) {
    Cookies.set("token", response.data.token, { expires: 7 });
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${AUTH_API}/login`, userData);
  if (response.data.token) {
    Cookies.set("token", response.data.token, { expires: 7 });
  }
  return response.data;
};

// Get current user
const getCurrentUser = async () => {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${AUTH_API}/me`, config);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user", error);
    return null;
  }
};

// Logout
const logout = () => {
  Cookies.remove("token");
};

// Forgot Password
const forgotPassword = async (email) => {
  const response = await axios.post(`${AUTH_API}/forgotpassword`, { email });
  return response.data;
};

// Reset Password
const resetPassword = async (token, password) => {
  const response = await axios.put(`${AUTH_API}/resetpassword/${token}`, { password });
  if (response.data.token) {
    Cookies.set('token', response.data.token, { expires: 7 });
  }
  return response.data;
};

const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword
};

export default authService;
