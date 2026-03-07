import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DonorDashboard from "./pages/DonorDashboard";
import FindDonors from "./pages/FindDonors";
import Home from "./pages/Home";
import ViewRequests from "./pages/ViewRequests";
import CreateRequest from "./pages/CreateRequest";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalTransfers from "./pages/HospitalTransfers";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";

// Simple Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Hospital Only Route
const HospitalRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return <div className="flex justify-center mt-10">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "hospital") return <Navigate to="/dashboard" replace />;

  // Optional: If you want to force them to wait until admin verifies
  if (!user.isVerified) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Pending Verification
        </h2>
        <p className="text-gray-600">
          Your hospital account is awaiting admin approval.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 text-blue-500 underline"
        >
          Return Home
        </button>
      </div>
    );
  }

  return children;
};

// Placeholder Dashboard (Inline for now)
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-500">
              Your role is:{" "}
              <span className="font-bold uppercase text-red-500">
                {user?.role}
              </span>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Action Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition hover:scale-105 duration-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    {/* Icon */}
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Find Donors
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Search Nearby
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/find-donors"
                    className="font-medium text-red-700 hover:text-red-900"
                  >
                    View donors
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg transform transition hover:scale-105 duration-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Requests
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage Requests
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/requests"
                    className="font-medium text-blue-700 hover:text-blue-900"
                  >
                    View all active requests
                  </Link>
                </div>
              </div>
            </div>

            {/* Donor Action Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition hover:scale-105 duration-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 rounded-md p-3 ${user?.role === "donor" ? "bg-green-500" : "bg-orange-500"}`}
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {user?.role === "donor"
                          ? "Donor Profile"
                          : "Become a Donor"}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.role === "donor"
                          ? "Manage Availability"
                          : "Join the cause"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/donor-dashboard"
                    className={`font-medium ${user?.role === "donor" ? "text-green-700 hover:text-green-900" : "text-orange-700 hover:text-orange-900"}`}
                  >
                    {user?.role === "donor"
                      ? "Go to Dashboard"
                      : "Register Now"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/donor-dashboard"
            element={
              <PrivateRoute>
                <DonorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/find-donors"
            element={
              <PrivateRoute>
                <FindDonors />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute>
                <ViewRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests/create"
            element={
              <PrivateRoute>
                <CreateRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/hospital-dashboard"
            element={
              <HospitalRoute>
                <HospitalDashboard />
              </HospitalRoute>
            }
          />
          <Route
            path="/hospital-transfers"
            element={
              <HospitalRoute>
                <HospitalTransfers />
              </HospitalRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
