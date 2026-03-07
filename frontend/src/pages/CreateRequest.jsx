import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import requestService from "../services/requestService";
import notificationService from "../services/notificationService";
import hospitalService from "../services/hospitalService";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Hospital,
  User,
  Droplet,
} from "lucide-react";

const CreateRequest = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const targetDonor = location.state?.targetDonor;

  useEffect(() => {
    if (user?.role === "hospital") {
      hospitalService
        .getMe()
        .then((res) => {
          if (res?.data) {
            setFormData((prev) => ({
              ...prev,
              hospitalName: res.data.hospitalName || user.name || "",
              location: res.data.address || res.data.location || "",
              contactNumber: res.data.contactNumber || "",
            }));
          }
        })
        .catch((err) => console.error("Could not fetch hospital data", err));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "A+",
    units: 1,
    hospitalName: "",
    location: "",
    contactNumber: "",
    neededDate: "",
    isEmergency: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestService.createRequest(formData);

      if (targetDonor && targetDonor.email) {
        // Send a personalized push via notificationService
        await notificationService.sendPersonalRequest(
          targetDonor.email,
          targetDonor.user?.name || targetDonor.name,
          user?.name || formData.patientName,
          formData.contactNumber,
        );
        toast.success(
          `Blood request published! Personal request sent directly to ${targetDonor.user?.name || targetDonor.name}.`,
        );
      } else {
        toast.success(
          "Blood request created successfully. Notifications sent to eligible donors!",
        );
      }

      navigate("/requests");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div
          className={`p-6 sm:p-10 ${formData.isEmergency ? "bg-red-50" : "bg-white"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-3 rounded-lg ${formData.isEmergency ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
            >
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create Blood Request
            </h2>
          </div>
          <p className="text-gray-600 ml-14">
            {targetDonor ? (
              <>
                You are sending a direct personal blood request to{" "}
                <strong className="text-red-600">
                  {targetDonor.user?.name || targetDonor.name}
                </strong>
                . Fill out the requirements below.
              </>
            ) : (
              "Fill out the details below to notify nearby compatible donors immediately."
            )}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Patient Name */}
              <div>
                <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2" /> Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  required
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 mr-2" /> Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Blood Group */}
              <div>
                <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="w-4 h-4 mr-2" /> Required Blood Group
                </label>
                <select
                  name="bloodGroup"
                  required
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Units */}
              <div>
                <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="w-4 h-4 mr-2" /> Units Required
                </label>
                <input
                  type="number"
                  name="units"
                  min="1"
                  required
                  value={formData.units}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Needed Date */}
              <div>
                <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 mr-2" /> Needed By
                </label>
                <input
                  type="date"
                  name="neededDate"
                  required
                  value={formData.neededDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                />
              </div>

              {/* Emergency Checkbox */}
              <div className="flex items-center mt-6 sm:mt-8">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isEmergency"
                    checked={formData.isEmergency}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-3 text-sm font-bold text-red-600">
                    Critical Emergency
                  </span>
                </label>
              </div>
            </div>

            {/* Hospital Name */}
            <div>
              <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                <Hospital className="w-4 h-4 mr-2" /> Hospital / Clinic Name
              </label>
              <input
                type="text"
                name="hospitalName"
                required
                value={formData.hospitalName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                placeholder="City General Hospital"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2" /> Full Address
              </label>
              <textarea
                name="location"
                required
                rows="3"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900 resize-none"
                placeholder="Include ward no, street, and city details..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl text-white text-lg font-bold shadow-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : formData.isEmergency
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/30 hover:shadow-red-500/50"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50"
              }`}
            >
              {loading ? "Publishing Request..." : "Publish Blood Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
