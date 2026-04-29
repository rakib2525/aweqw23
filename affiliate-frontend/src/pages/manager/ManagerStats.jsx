import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function ManagerStats() {
  const [affiliates, setAffiliates] = useState([]);
  const [selected, setSelected] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // ✅ LOAD AFFILIATES (FIXED)
  // =========================
  useEffect(() => {
    const loadAffiliates = async () => {
      try {
        // 🔥 FIX: correct route
        const res = await api.get("/manager/affiliates");

        setAffiliates(res.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load affiliates ❌");
      }
    };

    loadAffiliates();
  }, []);

  // =========================
  // ✅ FETCH SINGLE AFFILIATE STATS (FIXED)
  // =========================
  const fetchStats = async () => {
    if (!selected) {
      toast.error("Select affiliate first ❗");
      return;
    }

    try {
      setLoading(true);

      // 🔥 FIX: new backend route
      const res = await api.get(`/manager/affiliate-stats/${selected}`);

      setStats(res.data?.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stats ❌");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAFE DATA
  // =========================
  const safe = {
    clicks: stats?.clicks || 0,
    leads: stats?.totalLeads || 0,
    approved: stats?.approved || 0,
    pending: stats?.pending || 0,
    revenue: stats?.revenue || 0,
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        📊 Team Stats
      </h2>

      {/* ================= SELECT ================= */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2 rounded w-64"
        >
          <option value="">Select Affiliate</option>
          {affiliates.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name} ({a.email})
            </option>
          ))}
        </select>

        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Load Stats
        </button>
      </div>

      {/* ================= LOADING ================= */}
      {loading && <p>Loading stats...</p>}

      {/* ================= STATS ================= */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          <Card title="Clicks" value={safe.clicks} icon="🖱️" />
          <Card title="Leads" value={safe.leads} icon="🎯" />
          <Card title="Approved" value={safe.approved} icon="✅" />
          <Card title="Pending" value={safe.pending} icon="⏳" />
          <Card title="Revenue" value={`$${safe.revenue}`} icon="💰" />

        </div>
      )}
    </div>
  );
}

// ================= CARD =================
function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-sm text-gray-500">
        {icon} {title}
      </p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}