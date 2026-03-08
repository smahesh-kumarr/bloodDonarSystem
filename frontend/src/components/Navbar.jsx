import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Megaphone,
  LogOut,
  LayoutDashboard,
  Search,
  Droplet,
  FileText,
  ArrowRightLeft,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // Don't show nav on login/register pages

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-red-600 bg-red-50"
      : "text-gray-600 hover:text-red-600 hover:bg-gray-50";

  return (
    <nav className="bg-white shadow top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={
                  user.role === "hospital"
                    ? "/hospital-dashboard"
                    : "/dashboard"
                }
                className="font-bold text-2xl text-red-600 flex items-center gap-2"
              >
                <Droplet className="h-6 w-6 fill-current" />
                Redora
              </Link>
            </div>
          </div>

          <div className="hidden md:flex ml-auto items-center gap-2">
            {user?.role === "hospital" ? (
              <>
                <Link
                  to="/hospital-dashboard"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/hospital-dashboard")}`}
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  to="/hospital/campaigns"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/hospital/campaigns")}`}
                >
                  <Megaphone className="h-4 w-4" /> Campaigns
                </Link>
                <Link
                  to="/hospital-transfers"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/hospital-transfers")}`}
                >
                  <ArrowRightLeft className="h-4 w-4" /> Transfers
                </Link>
                <Link
                  to="/requests"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/requests")}`}
                >
                  <FileText className="h-4 w-4" /> Global Requests
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/campaigns"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/campaigns")}`}
                >
                  <Megaphone className="h-4 w-4" /> Campaigns
                </Link>
                <Link
                  to="/find-donors"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/find-donors")}`}
                >
                  <Search className="h-4 w-4" /> Find Donors
                </Link>
                <Link
                  to="/requests"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/requests")}`}
                >
                  <FileText className="h-4 w-4" /> Blood Requests
                </Link>
                <Link
                  to="/donor-dashboard"
                  className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${isActive("/donor-dashboard")}`}
                >
                  <LayoutDashboard className="h-4 w-4" /> Profile
                </Link>
              </>
            )}

            <div className="ml-4 border-l pl-4 flex items-center gap-4">
              <span className="text-gray-700 font-medium text-sm">
                <span className="text-xs text-gray-400 block">
                  Logged in as
                </span>
                {user?.name || user?.hospitalName || "Hospital Admin"}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-white border border-red-600 hover:bg-red-600 px-4 py-2 rounded-md transition font-medium text-sm flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
