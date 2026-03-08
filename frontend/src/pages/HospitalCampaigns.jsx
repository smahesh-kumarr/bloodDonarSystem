import React, { useState, useEffect } from "react";
import hospitalService from "../services/hospitalService";
import { toast } from "react-toastify";
import { PlusCircle, Search, Edit2, Trash2, Users } from "lucide-react";

const HospitalCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Registration View Modal
  const [isRegistrantsModalOpen, setIsRegistrantsModalOpen] = useState(false);
  const [selectedRegistrants, setSelectedRegistrants] = useState([]);
  const [currentCampaignTitle, setCurrentCampaignTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    targetUnits: "",
  });
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const res = await hospitalService.getMyCampaigns();
      if (res.success) {
        setCampaigns(res.data);
      }
    } catch (error) {
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      targetUnits: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign) => {
    const sDate = new Date(campaign.startDate).toISOString().slice(0, 10);
    const eDate = new Date(campaign.endDate).toISOString().slice(0, 10);

    setFormData({
      title: campaign.title,
      description: campaign.description,
      startDate: sDate,
      endDate: eDate,
      location: campaign.location,
      targetUnits: campaign.targetUnits,
    });
    setCurrentId(campaign._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsRegistrantsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        toast.info("Updating campaign...");
        const res = await hospitalService.updateCampaign(currentId, formData);
        if (res.success) {
          toast.success("Campaign updated!");
          fetchMyCampaigns();
        }
      } else {
        toast.info("Creating campaign...");
        const res = await hospitalService.createCampaign(formData);
        if (res.success) {
          toast.success("Campaign created successfully!");
          fetchMyCampaigns();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save campaign");
    }
  };

  const viewRegistrants = (title, registrants) => {
    setCurrentCampaignTitle(title);
    setSelectedRegistrants(registrants || []);
    setIsRegistrantsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-center text-gray-500 font-sans">
        Loading your campaigns...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hospital Campaigns
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and organize blood donation drives
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
          >
            <PlusCircle className="h-5 w-5" />
            Create Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">
              You haven't created any campaigns yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Registrants
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((camp) => (
                    <tr
                      key={camp._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {camp.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Target: {camp.targetUnits} Units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camp.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(camp.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {new Date(camp.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${camp.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {camp.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            viewRegistrants(camp.title, camp.registeredDonors)
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5"
                        >
                          <Users className="h-4 w-4" />
                          {camp.registeredDonors?.length || 0}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(camp)}
                          className="text-indigo-600 hover:text-indigo-900 mx-2"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? "Edit Campaign" : "Create New Campaign"}
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Units
                  </label>
                  <input
                    type="number"
                    name="targetUnits"
                    value={formData.targetUnits}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
                >
                  {isEditing ? "Update Campaign" : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrants Modal */}
      {isRegistrantsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Registered Participants
                </h3>
                <p className="text-sm text-gray-500">{currentCampaignTitle}</p>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-0 overflow-y-auto flex-1">
              {selectedRegistrants.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No one has registered for this campaign yet.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Donor ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedRegistrants.map((reg, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reg.donorId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {reg.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(reg.registrationDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalCampaigns;
