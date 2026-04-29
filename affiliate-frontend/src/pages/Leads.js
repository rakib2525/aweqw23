import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { emitUpdate } from "../utils/events";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // =========================
  // 🔥 FETCH LEADS
  // =========================
  const fetchLeads = async () => {
    try {
      setLoading(true);

      const res = await api.get("/lead");
      setLeads(res.data?.data || res.data || []);

    } catch (err) {
      console.log("Leads error:", err);
      toast.error("Failed to load leads ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // =========================
  // 🟡 CONFIRM
  // =========================
  const confirmLead = async (id) => {
    if (!window.confirm("Confirm this lead?")) return;

    try {
      setActionId(id);

      await api.patch(`/admin/leads/${id}/confirm`);

      toast.success("Lead confirmed ✅");
      fetchLeads();
      emitUpdate();

    } catch (err) {
      console.log(err);
      toast.error("Confirm failed ❌");
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // 🟢 FINAL APPROVE
  // =========================
  const approveLead = async (id) => {
    if (!window.confirm("Final approve this lead? 💰")) return;

    try {
      setActionId(id);

      await api.patch(`/admin/leads/${id}/approve`);

      toast.success("Lead approved 💰");
      fetchLeads();
      emitUpdate();

    } catch (err) {
      console.log(err);
      toast.error("Approve failed ❌");
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // ❌ DECLINE
  // =========================
  const declineLead = async (id) => {
    if (!window.confirm("Reject this lead?")) return;

    try {
      setActionId(id);

      await api.patch(`/admin/leads/${id}/decline`);

      toast.success("Lead rejected ❌");
      fetchLeads();
      emitUpdate();

    } catch (err) {
      console.log(err);
      toast.error("Reject failed ❌");
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // 🔍 SEARCH FILTER
  // =========================
  const filteredLeads = leads.filter((l) =>
    (l.user_id?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================
  // 🎨 STATUS COLOR
  // =========================
  const statusColor = (status) => {
    if (status === "pending") return "text-yellow-500";
    if (status === "confirmed") return "text-blue-500";
    if (status === "approved") return "text-green-500";
    if (status === "declined") return "text-red-500";
    return "text-gray-400";
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-5">
        <div className="bg-white p-4 rounded-xl shadow">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">

      <h2 className="text-2xl font-bold mb-5">
        📊 Leads Management
      </h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search user..."
        className="border p-2 mb-4 rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Offer</th>
              <th className="p-3 text-left">Payout</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              filteredLeads.map((l) => {
                const status = (l.status || "").toLowerCase();

                return (
                  <tr key={l._id} className="border-t hover:bg-gray-50">

                    {/* USER */}
                    <td className="p-3">
                      {l.user_id?.name || "N/A"}
                    </td>

                    {/* OFFER */}
                    <td className="p-3">
                      {l.offer_id?.name || "N/A"}
                    </td>

                    {/* PAYOUT */}
                    <td className="p-3 font-semibold">
                      ${Number(l.payout || 0).toFixed(2)}
                    </td>

                    {/* STATUS */}
                    <td className="p-3">
                      <span className={`font-semibold ${statusColor(status)}`}>
                        {status}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="p-3">

                      {/* 🟡 PENDING */}
                      {status === "pending" && (
                        <button
                          onClick={() => confirmLead(l._id)}
                          disabled={actionId === l._id}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Confirm
                        </button>
                      )}

                      {/* 🔵 CONFIRMED */}
                      {status === "confirmed" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveLead(l._id)}
                            disabled={actionId === l._id}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Approve 💰
                          </button>

                          <button
                            onClick={() => declineLead(l._id)}
                            disabled={actionId === l._id}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* ✅ FINAL */}
                      {status === "approved" && (
                        <span className="text-green-600 text-xs">
                          Completed
                        </span>
                      )}

                      {status === "declined" && (
                        <span className="text-red-500 text-xs">
                          Declined
                        </span>
                      )}

                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}