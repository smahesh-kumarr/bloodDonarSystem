import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If token invalid, remove it
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (userData) => {
    const data = await authService.login(userData);
    if (data.token) {
      const user = await authService.getCurrentUser();
      setUser(user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);

    // Only auto-login if the user is NOT a hospital
    // Hospitals must wait for email verification
    if (data.token && userData.role !== "hospital") {
      const user = await authService.getCurrentUser();
      setUser(user);
    } else if (userData.role === "hospital") {
      authService.logout(); // Clear the cookie that authService.js just set
    }
    return data;
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    const data = await authService.resetPassword(token, password);
    if (data.token) {
      const user = await authService.getCurrentUser();
      setUser(user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
