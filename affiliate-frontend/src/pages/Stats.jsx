import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthProvider";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Stats() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({});
  const [epcData, setEpcData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    subid: "",
    country: "",
    device: "",
    browser: "",
  });

  // =========================
  // 🔥 QUERY BUILDER
  // =========================
  const buildQuery = () => {
    const clean = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value) clean[key] = value;
    });

    return new URLSearchParams(clean).toString();
  };

  // =========================
  // 🔥 FETCH STATS (CLEAN)
  // =========================
  const fetchStats = async () => {
    try {
      if (!user) return;

      setLoading(true);

      const query = buildQuery();

      const statsEndpoint =
        user.role === "manager"
          ? "/stats/manager"
          : query
          ? `/stats?${query}`
          : "/stats";

      // 🔥 API CALLS
      const statsRes = await api.get(statsEndpoint);

      let epcRes = null;

      if (user.role !== "manager") {
        epcRes = await api.get("/stats/epc");
      }

      // =========================
      // ✅ FIXED PARSE
      // =========================
      const statsData = statsRes.data?.data || {};
      setStats(statsData);

      if (user.role !== "manager") {
        const epc = epcRes?.data?.data || [];
        setEpcData(Array.isArray(epc) ? epc : []);
      } else {
        setEpcData([]);
      }

    } catch (err) {
      console.error("Stats error:", err);
      toast.error("Failed to load stats ❌");
      setStats({});
      setEpcData([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔥 LOAD
  // =========================
  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  // =========================
  // 🔥 SAFE STATS
  // =========================
  const safeStats = {
    clicks: Number(stats?.clicks || 0),
    approved: Number(stats?.approved || 0),
    pending: Number(stats?.pending || 0),
    revenue: Number(stats?.revenue || 0),
    cr: Number(stats?.cr || 0),
  };

  // =========================
  // 🔥 CHART DATA
  // =========================
  const chartData = Array.isArray(epcData)
    ? epcData.map((item) => ({
        name: item?.name || "Unknown",
        epc: Number(item?.epc || 0),
        revenue: Number(item?.revenue || 0),
      }))
    : [];

  // =========================
  // UI STATES
  // =========================
  if (!user) return <p className="p-5">Loading user...</p>;

  if (loading) {
    return (
      <div className="p-5">
        <p className="text-gray-500">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">
        📊 {user.role === "manager"
          ? "Team Stats"
          : "Stats Dashboard"}
      </h2>

      {/* FILTER */}
      {user.role !== "manager" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">

          <input type="date" className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />

          <input type="date" className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />

          <input placeholder="SubID" className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, subid: e.target.value })}
          />

          <input placeholder="Country" className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          />

          <input placeholder="Device" className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, device: e.target.value })}
          />

          <input placeholder="Browser" className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, browser: e.target.value })}
          />

          <button
            onClick={fetchStats}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">

        <StatCard title="Clicks" value={safeStats.clicks} />
        <StatCard title="Approved" value={safeStats.approved} color="text-green-600" />
        <StatCard title="Pending" value={safeStats.pending} color="text-yellow-500" />
        <StatCard title="CR" value={`${safeStats.cr}%`} />
        <StatCard title="Revenue" value={`$${safeStats.revenue}`} color="text-green-600" />

      </div>

      {/* CHART */}
      {user.role !== "manager" && chartData.length > 0 && (
        <>
          <h3 className="mb-2 font-semibold">📈 EPC</h3>

          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line dataKey="epc" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h3 className="mb-2 font-semibold">💰 Revenue</h3>

          <div className="bg-white p-4 rounded-xl shadow">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

// =========================
// 🔥 CARD COMPONENT
// =========================
function StatCard({ title, value, color = "" }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}