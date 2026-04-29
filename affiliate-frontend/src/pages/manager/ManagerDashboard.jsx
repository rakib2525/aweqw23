import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import AffiliateTable from "./components/AffiliateTable";
import AffiliateDetailsPanel from "../../components/manager/AffiliateDetailsPanel";

export default function ManagerDashboard() {
  const [data, setData] = useState({});
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, earningRes] = await Promise.all([
        api.get("/stats/manager"),
        api.get("/manager/earnings"),
      ]);

      setData(statsRes.data?.data || {});
      setEarnings(earningRes.data?.total || 0);
    } catch (err) {
      toast.error("Failed to load dashboard ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-400 animate-pulse">
        Loading manager dashboard...
      </div>
    );
  }

  const safe = {
    affiliates: data?.affiliates || 0,
    clicks: data?.clicks || 0,
    totalLeads: data?.totalLeads || 0,
    approved: data?.approved || 0,
    pending: data?.pending || 0,
    revenue: data?.revenue || 0,
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* 🔥 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            👨‍💼 Manager Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Overview of your affiliate performance
          </p>
        </div>

        {/* 💰 EARNINGS */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl">
          <p className="text-xs opacity-80">Total Earnings</p>
          <p className="text-2xl font-bold">
            ${Number(earnings).toFixed(2)}
          </p>
        </div>
      </div>

      {/* 🔥 COLORFUL CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
        <StatCard title="Affiliates" value={safe.affiliates} icon="👥" color="blue" />
        <StatCard title="Clicks" value={safe.clicks} icon="🖱️" color="purple" />
        <StatCard title="Leads" value={safe.totalLeads} icon="🎯" color="orange" />
        <StatCard title="Approved" value={safe.approved} icon="✅" color="green" />
        <StatCard title="Pending" value={safe.pending} icon="⏳" color="yellow" />
        <StatCard title="Revenue" value={`$${safe.revenue}`} icon="💰" color="green" />
      </div>

      {/* 🔥 TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AffiliateTable onSelect={setSelectedAffiliate} />
      </motion.div>

      {/* 🔥 PANEL */}
      {selectedAffiliate && (
        <AffiliateDetailsPanel
          affiliateId={selectedAffiliate}
          onClose={() => setSelectedAffiliate(null)}
        />
      )}
    </div>
  );
}


// 💎 COLORFUL PRO CARD
function StatCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-400 to-red-400",
    yellow: "from-yellow-400 to-amber-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      className={`p-5 rounded-2xl text-white shadow-lg hover:shadow-2xl transition duration-300 bg-gradient-to-r ${colors[color]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-80">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>

      <div className="text-2xl font-bold">
        {value}
      </div>
    </motion.div>
  );
}