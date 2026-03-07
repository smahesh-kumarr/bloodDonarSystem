import React, { useState, useEffect, useCallback, useContext } from "react";
import donorService from "../services/donorService";
import hospitalService from "../services/hospitalService";
// import notificationService from "../services/notificationService";
import AuthContext from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  User,
  Phone,
  Droplet,
  Loader,
  AlertCircle,
  Send,
  HeartPulse,
  Activity,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

const FindDonors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestingId, setRequestingId] = useState(null);

  const [filters, setFilters] = useState({
    bloodGroup: "all",
    city: "",
    availability: "true",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 6;

  // Stats mock state (Ideally fetched from backend)
  const [stats] = useState({
    totalDonors: "2,450+",
    activeDonors: "1,200+",
    livesSaved: "8,500+",
  });

  const handleSendPersonalRequest = async (donor) => {
    if (!user) {
      toast.error("Please login to send personal requests");
      return;
    }

    if (!donor.email) {
      toast.error("Contact details not available for this donor");
      return;
    }

    // Redirect to Create Request form with target donor set via state
    navigate("/requests/create", { state: { targetDonor: donor } });
  };

  const fetchDonors = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const normalized = {
        availability:
          String(activeFilters.availability) === "false" ? "false" : "true",
      };

      const bg = String(activeFilters.bloodGroup || "").trim();
      if (bg && bg.toLowerCase() !== "all") normalized.bloodGroup = bg;

      const city = String(activeFilters.city || "").trim();
      if (city) normalized.city = city;

      // 1. Fetch individual donors
      const res = await donorService.getDonors(normalized);
      let fetchedDonors = Array.isArray(res?.data) ? res.data : [];
      fetchedDonors = fetchedDonors.map((d) => ({ ...d, listType: "donor" }));

      // 2. Fetch hospitals
      let hospitalList = [];
      try {
        const hRes = await hospitalService.getAllHospitals();
        let fetchedHospitals = Array.isArray(hRes?.data) ? hRes.data : [];

        fetchedHospitals.forEach((h) => {
          if (city && h.city?.toLowerCase() !== city.toLowerCase()) return;

          const getHospitalAvailability = (bloodGroupFilter) => {
            if (bloodGroupFilter && bloodGroupFilter.toLowerCase() !== "all") {
              return h.inventory && h.inventory[bloodGroupFilter] > 0;
            }
            return (
              h.inventory &&
              Object.values(h.inventory).some((units) => units > 0)
            );
          };

          const isAvailable = getHospitalAvailability(bg);

          if (normalized.availability === "false") return;
          if (normalized.availability === "true" && !isAvailable) return;

          const displayBg = bg && bg.toLowerCase() !== "all" ? bg : "Bank";

          hospitalList.push({
            _id: h._id,
            name: h.hospitalName,
            email: h.email,
            city: h.city,
            location: { formattedAddress: h.address },
            phone: h.contactNumber,
            bloodGroup: displayBg,
            availability: isAvailable,
            listType: "hospital",
          });
        });
      } catch (err) {
        console.error("Failed to fetch hospitals independently:", err);
      }

      setDonors([...fetchedDonors, ...hospitalList]);
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error("Failed to fetch donors:", error);
      setDonors([]);
      toast.error("Failed to fetch donors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors({ bloodGroup: "all", city: "", availability: "true" });
  }, [fetchDonors]); // initial load

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBloodGroupClick = (bg) => {
    setFilters((prev) => ({ ...prev, bloodGroup: bg }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchDonors(filters);
  };

  // Pagination logic
  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = donors.slice(indexOfFirstDonor, indexOfLastDonor);
  const totalPages = Math.ceil(donors.length / donorsPerPage);

  const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}
      </style>

      {/* Hero Section Header */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white relative overflow-hidden pb-32 pt-16 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Find Blood Donors
            </h1>
            <Link
              to="/"
              className="text-red-100 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full font-semibold backdrop-blur-sm transition-all border border-white/10 flex items-center"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Home
            </Link>
          </div>

          <p className="text-red-100 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-12">
            Search our community of registered life-savers. Every drop matters.
            Find the right match when it counts the most.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <HeartPulse className="w-8 h-8 text-red-200 mb-2" />
              <span className="text-3xl font-bold text-white">
                {stats.totalDonors}
              </span>
              <span className="text-red-100 font-medium mt-1">
                Total Donors
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <Activity className="w-8 h-8 text-red-200 mb-2" />
              <span className="text-3xl font-bold text-white">
                {stats.activeDonors}
              </span>
              <span className="text-red-100 font-medium mt-1">Active Now</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <Award className="w-8 h-8 text-red-200 mb-2" />
              <span className="text-3xl font-bold text-white">
                {stats.livesSaved}
              </span>
              <span className="text-red-100 font-medium mt-1">Lives Saved</span>
            </div>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-[-20%] right-[-5%] bg-white opacity-5 w-96 h-96 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] bg-red-900 opacity-20 w-80 h-80 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-20">
        {/* Filter Section */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-12"
        >
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
              Select Blood Group
            </label>
            <div className="flex flex-wrap gap-3">
              {bloodGroups.map((bg) => {
                const value = bg === "All" ? "all" : bg;
                const isSelected = filters.bloodGroup === value;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => handleBloodGroupClick(value)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                      isSelected
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent"
                    }`}
                  >
                    {bg}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                City / Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter a city to filter..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-gray-800 placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                Donor Status
              </label>
              <div className="relative">
                <select
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 appearance-none focus:bg-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-gray-800 outline-none"
                >
                  <option value="true">🟢 Fully Available</option>
                  <option value="false">🔴 On Cooldown</option>
                  <option value="all">⚪ Any Status</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] flex items-center justify-center bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:bg-red-400 transition-all shadow-lg hover:shadow-red-600/40 hover:-translate-y-0.5 font-bold text-base"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" /> Search
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Results Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 h-72 animate-pulse shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div>
                  <div className="w-3/4 h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-12 bg-gray-200 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No donors found
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              We couldn't find any donors matching your current criteria. Try
              adjusting your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilters({
                  bloodGroup: "all",
                  city: "",
                  availability: "true",
                });
                fetchDonors({
                  bloodGroup: "all",
                  city: "",
                  availability: "true",
                });
              }}
              className="mt-6 text-red-600 font-bold hover:text-red-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center text-gray-600 font-medium px-2">
              <p>
                Showing {indexOfFirstDonor + 1}-
                {Math.min(indexOfLastDonor, donors.length)} of {donors.length}{" "}
                donors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentDonors.map((donor, index) => (
                <div
                  key={donor._id || donor.id}
                  className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-20 bg-gradient-to-r from-red-50 to-orange-50 relative border-b border-red-100/50">
                    <div className="absolute -bottom-8 left-6">
                      <div className="bg-white p-2 rounded-full shadow-md">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full flex items-center justify-center">
                          <User className="w-7 h-7" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-5 top-5">
                      <div className="px-4 py-1.5 rounded-full bg-white shadow-sm border border-red-100 text-red-600 font-extrabold text-sm flex items-center">
                        <Droplet className="w-4 h-4 mr-1.5 fill-red-600" />
                        <span className="text-base">{donor.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 pb-6 px-6 flex-grow flex flex-col">
                    <h3 className="font-extrabold text-xl text-gray-900 truncate mb-1">
                      {donor.user?.name || donor.name || "Anonymous Donor"}
                    </h3>

                    <div className="mt-4 space-y-3.5 flex-grow">
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400 shrink-0" />
                        <span className="font-medium line-clamp-2">
                          {donor.location?.city ||
                            donor.location?.formattedAddress ||
                            donor.city ||
                            "Location not provided"}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Phone className="w-5 h-5 mr-3 text-gray-400" />
                        {donor.phone ? (
                          <a
                            href={`tel:${donor.phone}`}
                            className="font-medium hover:text-red-600 transition-colors"
                          >
                            {donor.phone}
                          </a>
                        ) : (
                          <span className="italic text-gray-400">Hidden</span>
                        )}
                      </div>

                      <div className="flex items-center pt-2">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                            donor.availability
                              ? "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${donor.availability ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-400"}`}
                          ></span>
                          {donor.availability
                            ? "Ready to Donate"
                            : "On Cooldown"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <button
                        onClick={() => handleSendPersonalRequest(donor)}
                        disabled={
                          requestingId === (donor._id || donor.id) ||
                          !donor.availability
                        }
                        className={`w-full h-12 flex items-center justify-center rounded-2xl transition-all font-bold text-sm shadow-sm ${
                          !donor.availability
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                            : "bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 hover:border-transparent group-hover:shadow-[0_8px_20px_rgba(220,38,38,0.2)] group-hover:-translate-y-0.5"
                        }`}
                      >
                        {requestingId === (donor._id || donor.id) ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Request Blood
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 flex justify-center items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                      currentPage === i + 1
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FindDonors;
