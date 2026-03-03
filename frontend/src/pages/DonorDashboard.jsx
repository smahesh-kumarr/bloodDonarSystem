import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import donorService from "../services/donorService";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Loader,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Droplet,
  Shield,
  HeartPulse,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";

const DonorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bloodGroup: "",
    age: "",
    weight: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    medicalHistory: "",
    lastDonationDate: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await donorService.getMyDonorProfile();
        if (response && response.data) {
          setDonorProfile(response.data);
          setFormData({
            bloodGroup: response.data.bloodGroup || "",
            age: response.data.age || "",
            weight: response.data.weight || "",
            phoneNumber: response.data.phone || "",
            address: response.data.location?.street || "",
            city: response.data.location?.city || "",
            state: response.data.location?.state || "",
            zipCode: response.data.location?.zipcode || "",
            medicalHistory: Array.isArray(response.data.medicalHistory)
              ? response.data.medicalHistory.join(", ")
              : response.data.medicalHistory || "",
            lastDonationDate: response.data.lastDonationDate
              ? new Date(response.data.lastDonationDate)
                  .toISOString()
                  .split("T")[0]
              : "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch donor profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleAvailability = async () => {
    if (!isEligible) {
      toast.error(
        "You cannot change availability while in your cooldown period.",
      );
      return;
    }
    try {
      const res = await donorService.toggleAvailability();
      setDonorProfile((prev) => ({
        ...prev,
        availability: res.data.availability,
      }));
      toast.success(
        `Availability set to: ${res.data.availability ? "Available" : "Unavailable"}`,
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        name: user.name,
        email: user.email,
        bloodGroup: formData.bloodGroup,
        phone: formData.phoneNumber,
        age: Number(formData.age),
        weight: Number(formData.weight),
        location: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipCode,
          coordinates: [0, 0],
        },
        medicalHistory: formData.medicalHistory
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        lastDonationDate: formData.lastDonationDate || null,
      };

      let res;
      if (donorProfile) {
        let shouldStop = false;
        if (donorProfile.lastDonationDate) {
          const lastD = new Date(donorProfile.lastDonationDate);
          const today = new Date();
          const diffTime = today - lastD;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 90) {
            toast.error(
              `You cannot update your profile. You must wait ${90 - diffDays} more days.`,
            );
            shouldStop = true;
          }
        }

        if (shouldStop) return;

        res = await donorService.updateDonorProfile(submissionData);
        toast.success("Profile updated successfully");
      } else {
        res = await donorService.createDonorProfile(submissionData);
        toast.success("Donor profile created successfully");
      }
      setDonorProfile(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const getEligibilityInfo = () => {
    if (!donorProfile?.lastDonationDate) {
      return { isEligible: true, daysLeft: 0, nextDate: null };
    }
    const lastD = new Date(donorProfile.lastDonationDate);
    const today = new Date();
    const diffTime = Math.max(0, today - lastD);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const nextDateObj = new Date(lastD);
    nextDateObj.setDate(lastD.getDate() + 90);
    const nextDate = nextDateObj.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (diffDays < 90) {
      return {
        isEligible: false,
        daysLeft: 90 - diffDays,
        lastDays: diffDays,
        nextDate,
      };
    }
    return {
      isEligible: true,
      daysLeft: 0,
      lastDays: diffDays,
      nextDate: "Currently Eligible",
    };
  };

  const { isEligible, daysLeft, nextDate } = getEligibilityInfo();
  const displayAvailability =
    donorProfile && isEligible ? donorProfile.availability : false;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Loader className="w-12 h-12 animate-spin text-red-600" />
      </div>
    );
  }

  // Without a donor profile, show the onboarding screen
  if (!donorProfile && !isEditing) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <HeartPulse className="w-12 h-12 text-red-500 animate-pulse" />
            <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Become a Hero Today
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Create your donor profile to help save lives in your community. Join
            our network of lifesavers.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-red-200 transition-all hover:-translate-y-0.5 text-lg"
          >
            Create My Donor Profile
          </button>
        </div>
      </div>
    );
  }

  const renderForm = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50/80 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {donorProfile ? "Update Profile" : "Create Profile"}
        </h2>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            >
              <option value="">Select Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
              min="18"
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              required
              min="45"
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Medical History (comma separated)
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800 resize-none"
              placeholder="E.g. Asthma, Diabetes, None"
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Last Donation Date (Optional)
            </label>
            <input
              type="date"
              name="lastDonationDate"
              value={formData.lastDonationDate}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
            />
          </div>

          <div className="col-span-1 md:col-span-2 pt-4">
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
              {donorProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-200 font-bold transition-all hover:-translate-y-0.5"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Welcome back, {user?.name || "Donor"}!
            </p>
          </div>

          {donorProfile && !isEditing && (
            <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <span className="px-4 text-sm font-bold text-gray-600">
                Status
              </span>
              <div className="relative inline-flex items-center">
                <button
                  onClick={handleToggleAvailability}
                  disabled={!isEligible}
                  className={`relative inline-flex h-10 w-28 items-center rounded-xl transition-colors duration-300 focus:outline-none ${
                    !isEligible
                      ? "bg-gray-300 cursor-not-allowed opacity-70"
                      : donorProfile.availability
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-lg bg-white transition duration-300 shadow-sm ${
                      donorProfile.availability
                        ? "translate-x-18"
                        : "translate-x-1"
                    }`}
                  />
                  <span
                    className={`absolute left-0 w-full flex justify-center text-xs font-black text-white px-2 pointer-events-none ${donorProfile.availability ? "pr-8" : "pl-8"}`}
                  >
                    {donorProfile.availability ? "READY" : "BUSY"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {isEditing ? (
          renderForm()
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Card 1 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Total Donations
                  </p>
                  <h3 className="text-3xl font-black text-gray-900 leading-none">
                    {donorProfile.lastDonationDate ? "1+" : "0"}
                  </h3>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isEligible ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"}`}
                >
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Next Eligible
                  </p>
                  <h3
                    className={`text-lg font-black leading-none mt-2 ${isEligible ? "text-green-600" : "text-gray-900"}`}
                  >
                    {nextDate}
                  </h3>
                  {!isEligible && (
                    <p className="text-xs text-orange-600 font-bold mt-2 bg-orange-50 inline-block px-2 py-1 rounded-md">
                      {daysLeft} days left
                    </p>
                  )}
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Donor Badge
                  </p>
                  <h3 className="text-xl font-black text-gray-900 leading-none mt-2">
                    {donorProfile.lastDonationDate
                      ? "Silver Contributor"
                      : "New Member"}
                  </h3>
                </div>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Droplet className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Impact Level
                  </p>
                  <h3 className="text-xl font-black text-gray-900 leading-none mt-2">
                    {donorProfile.lastDonationDate
                      ? "3 Lives Saved"
                      : "0 Lives Saved"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card (Left Col) */}
              <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-br from-red-600 to-red-700 h-32 relative">
                  <div className="absolute -bottom-12 inset-x-0 flex justify-center">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-md p-1 transform rotate-3">
                      <div className="w-full h-full bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-100 border-dashed">
                        <span className="text-4xl font-black text-red-600 transform -rotate-3">
                          {donorProfile.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-16 pb-8 px-6 text-center flex-grow">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">
                    {user?.name}
                  </h2>
                  <p className="text-gray-500 font-medium flex items-center justify-center gap-1 mb-6">
                    <MapPin className="w-4 h-4" />{" "}
                    {donorProfile.location?.city || "Unknown City"}
                  </p>

                  <div className="space-y-4 text-left bg-gray-50 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {donorProfile.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                          Vitals
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {donorProfile.age} yrs • {donorProfile.weight} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isEligible ? (
                    <div className="w-full py-3 bg-orange-50 text-orange-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-orange-100">
                      <XCircle className="w-5 h-5" /> In Cooldown
                    </div>
                  ) : (
                    <div className="w-full py-3 bg-green-50 text-green-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
                      <CheckCircle className="w-5 h-5" /> Eligible to Donate
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button
                    disabled={!isEligible}
                    onClick={() => setIsEditing(true)}
                    className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                      isEligible
                        ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 shadow-sm"
                        : "bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed"
                    }`}
                  >
                    <Edit className="w-4 h-4" />{" "}
                    {isEligible ? "Edit Profile" : "Locked Details"}
                  </button>
                </div>
              </div>

              {/* Right Dual Cols */}
              <div className="lg:col-span-2 space-y-8">
                {/* Medical History Widget */}
                {donorProfile.medicalHistory?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <HeartPulse className="w-5 h-5 text-red-500" /> Medical
                      Notes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {donorProfile.medicalHistory.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold px-4 py-2 rounded-xl"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby Active Requests (Mocked UI) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-500" /> Nearby
                      Urgent Requests
                    </h3>
                    <Link
                      to="/requests"
                      className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="p-0">
                    <div className="divide-y divide-gray-50">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 font-black text-lg flex items-center justify-center shadow-inner">
                              {i === 1 ? "O+" : "AB-"}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                Emergency at City Hospital
                              </h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" /> Needed by Today •
                                2km away
                              </p>
                            </div>
                          </div>
                          <Link
                            to="/requests"
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:border-red-500 hover:text-red-600 transition-colors text-sm shadow-sm group-hover:shadow-md"
                          >
                            Help
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Health & Preparation Guidelines Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-blue-500" /> Preparation &
                    Guidelines
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Droplet className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900">
                          Stay Hydrated
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Drink an extra 16 oz of water before your donation to
                        maintain blood volume.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">
                          Iron-Rich Diet
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Eat a healthy meal rich in iron like spinach or red meat
                        before you donate.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-gray-900">Rest Well</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ensure you get at least 7-8 hours of sleep the night
                        before your donation.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h4 className="font-bold text-gray-900">Bring ID</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Don't forget to bring your donor card or a valid state
                        ID when you go.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
