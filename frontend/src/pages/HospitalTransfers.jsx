import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hospitalService from "../services/hospitalService";
import { toast } from "react-toastify";
import { ArrowRightLeft, Check, X, Send } from "lucide-react";

const HospitalTransfers = () => {
  const [transfers, setTransfers] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  // New Transfer Form State
  const [receiverEmail, setReceiverEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [units, setUnits] = useState(1);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await hospitalService.getTransfers();
      if (res.success) {
        setTransfers({
          incoming: res.data.incoming || [],
          outgoing: res.data.outgoing || [],
        });
      }
    } catch (error) {
      toast.error("Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.createTransfer(
        receiverEmail,
        bloodGroup,
        Number(units),
      );
      if (res.success) {
        toast.success("Transfer initiated successfully");
        setReceiverEmail("");
        setUnits(1);
        fetchTransfers(); // Refresh lists
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initiate transfer",
      );
    }
  };

  const handleAction = async (transferId, action) => {
    try {
      if (action === "accept") {
        await hospitalService.acceptTransfer(transferId);
        toast.success("Transfer accepted");
      } else if (action === "complete") {
        await hospitalService.completeTransfer(transferId);
        toast.success("Transfer marked as complete");
      }
      fetchTransfers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to ${action} transfer`,
      );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">Loading Transfers...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
              Blood Transfers
            </h1>
            <p className="text-gray-500">
              Manage incoming and outgoing inter-hospital blood transfers.
            </p>
          </div>
          <Link
            to="/hospital-dashboard"
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Transfer Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
              Initiate Transfer
            </h2>
            <form onSubmit={handleInitiateTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Hospital Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  placeholder="admin@hospital.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
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
                  Units to Transfer
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition"
              >
                <Send className="h-4 w-4" /> Send Transfer Request
              </button>
            </form>
          </div>

          {/* Transfers Lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Incoming Transfers */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                Incoming Requests
              </h2>
              {transfers.incoming.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No incoming transfer requests.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {transfers.incoming.map((t) => (
                    <li
                      key={t._id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          From: {t.senderId?.name || t.senderId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t.units} Units of{" "}
                          <span className="font-bold text-red-600">
                            {t.bloodGroup}
                          </span>
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1
                          ${
                            t.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : t.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : t.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {t.status === "pending" && (
                          <button
                            onClick={() => handleAction(t._id, "accept")}
                            className="bg-green-100 text-green-700 p-2 rounded-md hover:bg-green-200"
                            title="Accept"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        {/* If you wanted a Reject feature, you'd add it here */}
                        {t.status === "accepted" && (
                          <button
                            onClick={() => handleAction(t._id, "complete")}
                            className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 text-sm font-semibold"
                            title="Mark Complete"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Outgoing Transfers */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                Outgoing Requests
              </h2>
              {transfers.outgoing.length === 0 ? (
                <p className="text-gray-500 text-sm">No outgoing transfers.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {transfers.outgoing.map((t) => (
                    <li
                      key={t._id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          To: {t.receiverId?.name || t.receiverId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t.units} Units of{" "}
                          <span className="font-bold text-red-600">
                            {t.bloodGroup}
                          </span>
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1
                          ${
                            t.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : t.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : t.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalTransfers;
