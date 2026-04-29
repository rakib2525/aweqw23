import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import Card from "../components/Card";
import { motion } from "framer-motion";
import { onUpdate } from "../utils/events";
import { AuthContext } from "../context/AuthProvider";

import ManagerDashboard from "./manager/ManagerDashboard";

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

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({});
  const [epcData, setEpcData] = useState([]);
  const [topOffers, setTopOffers] = useState([]);
  const [earnings, setEarnings] = useState({
    balance: 0,
    total_earned: 0,
  });

  const [loading, setLoading] = useState(true);

  // ================= LOAD =================
  const loadAll = async () => {
    try {
      setLoading(true);

      const role = user?.role;

      // ================= API CALLS =================
      const requests = [];

      // STATS
      requests.push(
        api.get(role === "manager" ? "/stats/manager" : "/stats")
      );

      // EPC (not for manager)
      if (role !== "manager") {
        requests.push(api.get("/stats/epc"));
      }

      // EARNINGS (affiliate only)
      if (role === "affiliate") {
        requests.push(api.get("/earnings/me"));
      }

      // ADMIN DATA
      if (role === "admin") {
        requests.push(api.get("/stats/top-offers"));
      }

      const res = await Promise.all(requests);

      let i = 0;

      // ================= STATS =================
      const statsRes = res[i++]?.data?.data || {};
      setStats(statsRes);

      // ================= EPC =================
      if (role !== "manager") {
        const epcRes = res[i++]?.data?.data;
        setEpcData(Array.isArray(epcRes) ? epcRes : []);
      } else {
        setEpcData([]);
      }

      // ================= EARNINGS =================
      if (role === "affiliate") {
        const earnRes = res[i++]?.data?.data || {};
        setEarnings({
          balance: Number(earnRes?.balance || 0),
          total_earned: Number(earnRes?.total_earned || 0),
        });
      }

      // ================= ADMIN =================
      if (role === "admin") {
        const topRes = res[i++]?.data?.data;
        setTopOffers(Array.isArray(topRes) ? topRes : []);
      }

    } catch (err) {
      console.error("Dashboard error:", err);
      setEpcData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const off = onUpdate(() => loadAll());
    return off;
  }, [user]);

  // 👉 MANAGER REDIRECT
  if (user?.role === "manager") {
    return <ManagerDashboard />;
  }

  // ================= SAFE DATA =================
  const safeStats = {
    clicks: Number(stats?.clicks || 0),
    leads: Number(stats?.leads ?? stats?.totalLeads ?? 0),
    approved: Number(stats?.approved ?? stats?.approvedLeads ?? 0),
    pending: Number(stats?.pending ?? stats?.pendingLeads ?? 0),
    revenue: Number(stats?.revenue ?? stats?.approvedAmount ?? 0),
  };

  const chartData = epcData.map((item) => ({
    name: item?.name || "Offer",
    epc: Number(item?.epc || 0),
  }));

  const topOfferChart = topOffers.map((item) => ({
    name: item?.name || "Offer",
    revenue: Number(item?.revenue || 0),
  }));

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        {user?.role === "admin" && "👑 Admin Dashboard"}
        {user?.role === "affiliate" && "📊 Affiliate Dashboard"}
      </h2>

      {/* ================= STATS ================= */}
      <div className="grid md:grid-cols-5 gap-6 mb-6">
        <Card title="Clicks" value={safeStats.clicks} />
        <Card title="Leads" value={safeStats.leads} />
        <Card title="Pending" value={safeStats.pending} />
        <Card title="Approved" value={safeStats.approved} />
        <Card title="Revenue" value={`$${safeStats.revenue}`} />
      </div>

      {/* ================= BALANCE ================= */}
      {user?.role === "affiliate" && (
        <div className="bg-blue-500 text-white p-4 rounded mb-6">
          <p>Available Balance</p>
          <h2 className="text-2xl font-bold">
            ${earnings.balance}
          </h2>
        </div>
      )}

      {/* ================= EPC CHART ================= */}
      {chartData.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
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
      )}

      {/* ================= ADMIN CHART ================= */}
      {user?.role === "admin" && topOfferChart.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topOfferChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}