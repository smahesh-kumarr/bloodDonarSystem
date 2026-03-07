import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hospitalService from "../services/hospitalService";
import { toast } from "react-toastify";
import { Activity, Droplet, User, Save } from "lucide-react";
import AuthContext from "../context/AuthContext";

const HospitalDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for updating inventory
  const [updateBg, setUpdateBg] = useState("A+");
  const [updateUnits, setUpdateUnits] = useState(1);
  const [operation, setOperation] = useState("add");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: "",
    registrationNumber: "",
    address: "",
    city: "",
    contactNumber: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await hospitalService.getMe();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info("Please create your hospital profile first");
        setShowCreateForm(true);
      } else {
        toast.error("Failed to load hospital details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.updateInventory(
        updateBg,
        Number(updateUnits),
        operation,
      );
      if (res.success) {
        toast.success("Inventory updated");
        // Update local state without fetching again
        setProfile((prev) => {
          let updatedInventory = { ...prev.inventory };
          let current = updatedInventory[updateBg] || 0;
          let newValue =
            operation === "add"
              ? current + Number(updateUnits)
              : current - Number(updateUnits);
          if (newValue < 0) newValue = 0;
          updatedInventory[updateBg] = newValue;
          return { ...prev, inventory: updatedInventory };
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update inventory",
      );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading Hospital Data...
      </div>
    );
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.createProfile({ ...formData, email: user?.email });
      if (res.success) {
        toast.success("Hospital Profile created successfully!");
        setProfile(res.data);
        setShowCreateForm(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create profile");
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center font-sans">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Complete Your Hospital Profile</h2>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
              <input type="text" required className="w-full border rounded p-2 mt-1" value={formData.hospitalName} onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number / License</label>
              <input type="text" required className="w-full border rounded p-2 mt-1" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <textarea required className="w-full border rounded p-2 mt-1" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" required className="w-full border rounded p-2 mt-1" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input type="text" required className="w-full border rounded p-2 mt-1" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded mt-4">Create Profile</button>
          </form>
        </div>
      </div>
    );
  }

  // If user is verified but hospital schema profile isn't created yet somehow (depends on registration flow)
  // Usually created on Admin verify or initial register.

  const renderInventoryGrid = () => {
    // Inventory is a Map or Object depending on backend, we'll convert it to object to be safe
    const inventoryMap = profile?.inventory || {};

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {bloodGroups.map((bg) => {
          let units = 0;
          if (inventoryMap instanceof Map) units = inventoryMap.get(bg) || 0;
          else units = inventoryMap[bg] || 0;

          return (
            <div
              key={bg}
              className="bg-red-50 p-6 rounded-lg text-center shadow-sm border border-red-100 flex flex-col items-center"
            >
              <Droplet className="text-red-500 mb-2 h-8 w-8" />
              <h3 className="text-xl font-bold text-red-700">{bg}</h3>
              <p className="text-gray-700 font-medium">{units} Units</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Hospital Dashboard
            </h1>
            <p className="text-gray-500">
              {profile?.name || "Manage your blood inventory"}
            </p>
          </div>
          <Link
            to="/hospital-transfers"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Manage Transfers
          </Link>
        </div>

        {/* Dashboard grid */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Current Blood Inventory
          </h2>
          {renderInventoryGrid()}
        </div>

        {/* Update Inventory Form */}
        <div className="bg-white rounded-xl shadow-md p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Modify Inventory
          </h2>
          <form onSubmit={handleUpdateInventory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                value={updateBg}
                onChange={(e) => setUpdateBg(e.target.value)}
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Units (Blood Bags)
              </label>
              <input
                type="number"
                min="1"
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                value={updateUnits}
                onChange={(e) => setUpdateUnits(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="add"
                    checked={operation === "add"}
                    onChange={() => setOperation("add")}
                    className="text-red-600 focus:ring-red-500"
                  />
                  Add Stock
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="deduct"
                    checked={operation === "deduct"}
                    onChange={() => setOperation("deduct")}
                    className="text-red-600 focus:ring-red-500"
                  />
                  Deduct Stock
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 transition"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
