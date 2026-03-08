import React, { useState, useEffect, useContext } from "react";
import hospitalService from "../services/hospitalService";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  Megaphone,
  MapPin,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
} from "lucide-react";

const Campaigns = () => {
  const { user } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchActiveCampaigns();
  }, []);

  const fetchActiveCampaigns = async () => {
    try {
      setLoading(true);
      const res = await hospitalService.getActiveCampaigns();
      if (res.success) {
        // Vanish the campaign when it meets two days before the end date
        const now = new Date();
        const filtered = res.data.filter((c) => {
          const endDate = new Date(c.endDate);
          const timeDiff = endDate.getTime() - now.getTime();
          const daysUntilEnd = timeDiff / (1000 * 3600 * 24);
          return daysUntilEnd > 2; // more than 2 days remaining
        });
        setCampaigns(filtered);
      }
    } catch (error) {
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setRegistering(true);
      const res = await hospitalService.registerForCampaign(
        selectedCampaign._id,
        {
          bloodGroup,
        },
      );
      if (res.success) {
        toast.success("Successfully registered for the campaign!");
        setShowModal(false);
        // We can re-fetch or optimistically update
        fetchActiveCampaigns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-center text-gray-500 font-sans">
        Loading Campaigns...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Megaphone className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Active Blood Campaigns
            </h1>
            <p className="text-gray-500">
              Join a campaign near you to donate blood and save lives.
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
            No active campaigns available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const isRegistered = camp.registeredDonors?.some(
                (d) => d.donorId === user?._id || d.donorId === user?.id,
              );

              return (
                <div
                  key={camp._id}
                  className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500 flex flex-col"
                >
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {camp.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {camp.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span>
                          {new Date(camp.startDate).toLocaleDateString()} -{" "}
                          {new Date(camp.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{camp.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>Target: {camp.targetUnits || "N/A"} Units</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    {isRegistered ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-md font-medium border border-green-200 cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => openRegisterModal(camp)}
                        className="w-full bg-red-600 text-white font-medium py-2 rounded-md hover:bg-red-700 transition"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Register for Campaign
            </h2>
            <p className="text-gray-600 mb-6">
              You are registering for{" "}
              <span className="font-semibold">{selectedCampaign.title}</span>.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"
                >
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

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  disabled={registering}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition disabled:opacity-50"
                >
                  {registering ? "Registering..." : "Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
