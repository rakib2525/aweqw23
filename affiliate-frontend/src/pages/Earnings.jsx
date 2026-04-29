import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔥 FETCH EARNINGS (CLEAN)
  // =========================
  const fetchEarnings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/earnings/history");

      // ✅ STANDARD FORMAT (FINAL)
      const data = res.data?.data || [];

      setEarnings(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Earnings error:", err);
      toast.error("Failed to load earnings ❌");
      setEarnings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // =========================
  // 🔥 TOTAL CALCULATION
  // =========================
  const total = earnings.reduce(
    (sum, item) => sum + Number(item?.affiliate_earning || 0),
    0
  );

  // =========================
  // 🔄 LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-5">
        <p className="text-gray-500">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">💰 Earnings</h2>

      {/* TOTAL */}
      <div className="bg-green-500 text-white p-4 rounded mb-5">
        <p>Total Earnings</p>
        <h2 className="text-2xl font-bold">
          ${total.toFixed(2)}
        </h2>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Offer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {earnings.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No earnings yet
                </td>
              </tr>
            ) : (
              earnings.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="p-3">
                    {e?.created_at
                      ? new Date(e.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    {e?.offer_name || "Offer"}
                  </td>

                  <td className="p-3 font-semibold text-green-600">
                    ${Number(e?.affiliate_earning || 0).toFixed(2)}
                  </td>

                  <td className="p-3">
                    <span
                      className={`text-xs font-bold ${
                        e?.status === "paid"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {e?.status || "pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}