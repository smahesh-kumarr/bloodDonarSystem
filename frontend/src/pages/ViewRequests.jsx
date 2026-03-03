import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import requestService from "../services/requestService";
import donorService from "../services/donorService";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  Clock,
  MapPin,
  Phone,
  Hospital,
  User,
  Droplet,
  AlertCircle,
  CheckCircle2,
  Heart,
  Trash2,
  Filter,
  Plus,
} from "lucide-react";

const StatusStepper = ({ status }) => {
  const stepKey =
    status === "completed"
      ? "completed"
      : status === "accepted"
        ? "accepted"
        : "pending";
  const steps = ["pending", "accepted", "completed"];
  const currentIndex = steps.indexOf(stepKey);

  return (
    <div className="flex items-center justify-between mt-4 mb-2 px-1">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                index <= currentIndex
                  ? "bg-red-50 text-red-600 border-2 border-red-500 shadow-sm"
                  : "bg-white text-gray-300 border-2 border-gray-200"
              }`}
            >
              {index < currentIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-[10px] mt-2 uppercase tracking-wider font-bold transition-colors duration-300 ${
                index <= currentIndex ? "text-red-700" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 relative top-[-8px]">
              <div
                className={`h-full transition-all duration-500 ${
                  index < currentIndex ? "bg-red-500" : "bg-gray-200"
                }`}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-pulse"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-3 flex-1 pr-4">
            <div className="h-7 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded-full w-1/2 mt-2"></div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0"></div>
        </div>
        <div className="flex justify-between items-center mb-8 mt-2">
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          <div className="h-1 bg-gray-200 w-full mx-2"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          <div className="h-1 bg-gray-200 w-full mx-2"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
        </div>
        <div className="space-y-4 mt-6 bg-gray-50 p-4 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="mt-6 h-14 bg-gray-200 rounded-xl w-full"></div>
      </div>
    ))}
  </div>
);

const ViewRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my" or "completed"
  const [donorProfile, setDonorProfile] = useState(null);

  // Filters
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterBloodGroup, setFilterBloodGroup] = useState("all");

  const fetchRequests = useCallback(async () => {
    try {
      if (activeTab === "completed") {
        const resCreated = await requestService.getCompletedRequests({
          requesterId: user?._id || user?.id,
        });
        const createdData = Array.isArray(resCreated?.data)
          ? resCreated.data
          : [];

        let donatedData = [];
        if (donorProfile) {
          const resDonated = await requestService.getCompletedRequests({
            donorId: donorProfile._id,
          });
          donatedData = Array.isArray(resDonated?.data) ? resDonated.data : [];
        }

        // Combine and map to remove duplicates just in case
        const combined = [...createdData, ...donatedData];
        const map = new Map();
        combined.forEach((req) => map.set(req._id, req));
        setRequests(Array.from(map.values()));
      } else {
        const filters =
          activeTab === "my" ? { requesterId: user?._id || user?.id } : {};
        const res = await requestService.getRequests(filters);
        setRequests(Array.isArray(res?.data) ? res.data : []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, [activeTab, user, donorProfile]);

  useEffect(() => {
    const fetchDonor = async () => {
      if (!user) return;
      try {
        const res = await donorService.getMyDonorProfile();
        if (res?.data) {
          setDonorProfile(res.data);
        }
      } catch (err) {
        console.error("Could not fetch donor profile", err);
      }
    };
    fetchDonor();
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAcceptRequest = async (id) => {
    if (donorProfile?.lastDonationDate) {
      const lastDonate = new Date(donorProfile.lastDonationDate);
      const today = new Date();
      const diffTime = today - lastDonate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 90) {
        toast.error(
          `You cannot accept requests during your 90-day cooldown period. (${90 - diffDays} days left)`,
        );
        return;
      }
    }

    try {
      await requestService.acceptRequest(id);
      toast.success("Request accepted! Please contact the given number.");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  };

  const handleMarkCompleted = async (id) => {
    if (donorProfile?.lastDonationDate) {
      const lastDonate = new Date(donorProfile.lastDonationDate);
      const today = new Date();
      const diffTime = today - lastDonate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 90) {
        toast.error(
          `You cannot complete a request during your cooldown period. (${90 - diffDays} days left)`,
        );
        return;
      }
    }

    if (
      window.confirm("Are you sure you want to mark this request as completed?")
    ) {
      try {
        await requestService.updateRequestStatus(id, "completed");
        toast.success("Donation confirmed! Request marked as completed.");
        fetchRequests(); // Automatically removes it from the active list
        window.location.reload(); // Refresh to update donor profile globally
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to update status");
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this request permanently?",
      )
    ) {
      try {
        await requestService.deleteRequest(id);
        toast.success("Request deleted successfully!");
        fetchRequests();
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to delete request",
        );
      }
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab !== "all") return true;
    if (filterUrgency === "emergency" && !req.isEmergency) return false;
    if (filterUrgency === "normal" && req.isEmergency) return false;
    if (filterBloodGroup !== "all" && req.bloodGroup !== filterBloodGroup)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Blood Requests
            </h1>
            <p className="text-gray-500 mt-2 text-lg max-w-2xl">
              {activeTab === "all"
                ? "Help someone in emergency by accepting a life-saving blood request below."
                : activeTab === "completed"
                  ? "View your past fulfilled blood donation requests."
                  : "Manage the blood requests you have created."}
            </p>
          </div>
          <Link
            to="/requests/create"
            className="flex items-center px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5 transition-all font-bold gap-2"
          >
            <Plus className="w-5 h-5" /> Create Request
          </Link>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: "all", label: "Community Requests" },
            { id: "my", label: "My Requests" },
            { id: "completed", label: "Past History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-200"
                  : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters for Community Requests */}
        {activeTab === "all" && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800 font-bold px-2">
              <Filter className="w-5 h-5 text-red-500" /> Filter Requests
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="all">All Urgency</option>
                <option value="emergency">Critical Emergency</option>
                <option value="normal">Normal Priority</option>
              </select>

              <select
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="all">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Requests Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              {activeTab === "my"
                ? "You haven't created any requests yet. When you do, they'll appear right here."
                : activeTab === "completed"
                  ? "You don't have any completed donation history to display."
                  : "There are currently no matching blood requests. Please check back later!"}
            </p>
            {activeTab === "my" && (
              <Link
                to="/requests/create"
                className="mt-8 px-8 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200 hover:-translate-y-0.5"
              >
                Create a Request Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRequests.map((req) => {
              const isCreator =
                req.requesterId === user?._id || req.requesterId === user?.id;

              const isAcceptor =
                donorProfile && req.donorId === donorProfile._id;

              const canComplete = isAcceptor;

              return (
                <div
                  key={req._id}
                  className={`group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col relative overflow-hidden transform hover:-translate-y-1 ${
                    req.isEmergency ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  {/* Priority Banner Header */}
                  {req.isEmergency && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-black uppercase tracking-widest py-2 px-4 flex items-center justify-center gap-2 z-10 animate-pulse border-b border-red-700">
                      <AlertCircle className="w-4 h-4" /> Critical Emergency
                    </div>
                  )}

                  {isCreator && req.status !== "completed" && (
                    <button
                      onClick={() => handleDelete(req._id)}
                      className={`absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10 shadow-sm border border-gray-100 ${
                        req.isEmergency ? "mt-6" : ""
                      }`}
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div
                    className={`p-6 flex-grow ${
                      req.isEmergency ? "pt-12" : "pt-8"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-12">
                        <h3 className="font-extrabold text-2xl text-gray-900 leading-tight mb-3">
                          {req.patientName}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                          <Droplet className="w-4 h-4 fill-current" />{" "}
                          {req.units} Units Required
                        </span>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <span
                          className={`flex items-center justify-center w-16 h-16 rounded-2xl font-black text-2xl shadow-inner ${
                            req.isEmergency
                              ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                              : "bg-gradient-to-br from-red-100 to-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          {req.bloodGroup}
                        </span>
                      </div>
                    </div>

                    <StatusStepper status={req.status || "pending"} />

                    <div className="space-y-4 mt-8 bg-gray-50/70 p-5 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-red-100 transition-colors">
                      <div className="flex items-start text-sm text-gray-700 group/item">
                        <Hospital className="w-5 h-5 mr-3 text-red-400 shrink-0 group-hover/item:text-red-500 transition-colors" />
                        <span className="font-semibold leading-tight pt-0.5 text-gray-900">
                          {req.hospitalName}
                        </span>
                      </div>

                      <div className="flex items-start text-sm text-gray-600 group/item">
                        <MapPin className="w-5 h-5 mr-3 text-red-400 shrink-0 group-hover/item:text-red-500 transition-colors" />
                        <span className="leading-tight pt-0.5">
                          {req.location}
                        </span>
                      </div>

                      <div className="flex items-start text-sm text-gray-600 group/item">
                        <Clock className="w-5 h-5 mr-3 text-red-400 shrink-0 group-hover/item:text-red-500 transition-colors" />
                        <span className="pt-0.5 font-medium text-gray-800">
                          Needed:{" "}
                          {new Date(req.neededDate).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-700 group/item">
                        <Phone className="w-5 h-5 mr-3 text-red-400 shrink-0 group-hover/item:text-red-500 transition-colors" />
                        <a
                          href={`tel:${req.contactNumber}`}
                          className="text-gray-900 hover:text-red-600 font-bold transition-colors"
                        >
                          {req.contactNumber}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-white border-t border-gray-50 mt-auto rounded-b-3xl">
                    <div className="pt-1">
                      {req.status === "completed" ? (
                        <button
                          disabled
                          className="w-full py-4 px-4 bg-gray-100 text-gray-500 rounded-xl font-bold transition-colors cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
                        >
                          <CheckCircle2 className="w-5 h-5 text-gray-400" />{" "}
                          Donation Completed
                        </button>
                      ) : req.status === "accepted" ? (
                        canComplete ? (
                          <button
                            onClick={() => handleMarkCompleted(req._id)}
                            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" /> Confirm
                            Donation Made
                          </button>
                        ) : isCreator ? (
                          <button
                            disabled
                            className="w-full py-4 px-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold transition-colors cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Clock className="w-5 h-5" /> Awaiting Donor
                            Confirmation
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-4 px-4 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-bold transition-colors cursor-not-allowed"
                          >
                            Already Accepted
                          </button>
                        )
                      ) : isCreator ? (
                        <button
                          disabled
                          className="w-full py-4 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold transition-colors cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Clock className="w-5 h-5" /> Looking for Donors
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className={`w-full py-4 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                            req.isEmergency
                              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-600/30"
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30"
                          }`}
                        >
                          <Heart className="w-5 h-5 fill-white" /> Accept & Help
                          Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRequests;
