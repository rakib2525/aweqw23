import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Withdraws() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔥 FETCH (FIXED)
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/withdraw");

      // ✅ FIX (IMPORTANT)
      const withdraws = res.data?.data || [];

      setData(Array.isArray(withdraws) ? withdraws : []);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load data ❌");
      setData([]); // safety
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // ✅ APPROVE
  // =========================
  const approve = async (id) => {
    const t = toast.loading("Approving...");

    try {
      await api.patch(`/withdraw/${id}/approve`);
      toast.success("Approved ✅", { id: t });

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Approve failed ❌", { id: t });
    }
  };

  // =========================
  // ❌ REJECT
  // =========================
  const reject = async (id) => {
    const t = toast.loading("Rejecting...");

    try {
      await api.patch(`/withdraw/${id}/reject`);
      toast.success("Rejected ❌", { id: t });

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Reject failed ❌", { id: t });
    }
  };

  return (
    <div className="p-5">

      <h2 className="text-2xl font-bold mb-6">
        Withdraw Requests
      </h2>

      {/* 🔄 LOADING */}
      {loading ? (
        <div className="bg-white p-4 rounded-xl shadow">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 rounded mb-2 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Account</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No withdraw requests
                  </td>
                </tr>
              ) : (
                (Array.isArray(data) ? data : []).map((w) => (
                  <tr
                    key={w._id}
                    className="border-t hover:bg-blue-50 transition duration-200"
                  >

                    <td className="p-3">
                      {w.userId?.name || "Unknown"}
                    </td>

                    <td className="p-3 font-semibold">
                      ${Number(w.amount || 0).toFixed(2)}
                    </td>

                    <td className="p-3">
                      {w.method}
                    </td>

                    <td className="p-3">
                      {w.account}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold
                          ${w.status === "approved" && "bg-green-100 text-green-600"}
                          ${w.status === "pending" && "bg-yellow-100 text-yellow-600"}
                          ${w.status === "rejected" && "bg-red-100 text-red-600"}
                        `}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {w.status === "pending" ? (
                        <div className="flex gap-2">

                          <button
                            onClick={() => {
                              if (window.confirm("Approve this request?")) {
                                approve(w._id);
                              }
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm("Reject this request?")) {
                                reject(w._id);
                              }
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                          >
                            Reject
                          </button>

                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No action
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}