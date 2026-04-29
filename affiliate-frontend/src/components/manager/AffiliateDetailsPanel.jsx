import { useEffect, useState } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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

export default function AffiliateDetailsPanel({ affiliateId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [offerId, setOfferId] = useState("");

  // ================= FETCH DETAILS =================
  useEffect(() => {
    if (!affiliateId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/manager/affiliate-details/${affiliateId}`);
        setData(res.data?.data || null);
      } catch (err) {
        toast.error("Failed to load affiliate details ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [affiliateId]);

  // ================= LOAD OFFERS =================
  useEffect(() => {
    api.get("/offers")
      .then(res => setOffers(res.data?.data || []))
      .catch(() => {});
  }, []);

  // ================= ASSIGN OFFER =================
  const assignOffer = async () => {
    if (!offerId) return toast.error("Select offer ❗");

    try {
      await api.post("/manager/assign-offer", {
        userId: affiliateId,
        offerId,
      });

      toast.success("Offer assigned ✅");
      setOfferId("");
    } catch {
      toast.error("Assign failed ❌");
    }
  };

  // ================= REMOVE =================
  const removeAffiliate = async () => {
    if (!window.confirm("Remove this affiliate?")) return;

    try {
      await api.patch(`/manager/remove-affiliate/${affiliateId}`);
      toast.success("Affiliate removed 🚫");
      onClose();
    } catch {
      toast.error("Failed ❌");
    }
  };

  if (!affiliateId) return null;

  return (
    <>
      {/* 🔥 OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* 🔥 MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed z-50 top-1/2 left-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            👤 Affiliate Details
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}

        {data && (
          <>
            {/* USER */}
            <div className="mb-6">
              <p className="font-semibold text-lg">
                {data?.affiliate?.name}
              </p>
              <p className="text-sm text-gray-500">
                {data?.affiliate?.email}
              </p>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard title="Clicks" value={data?.summary?.clicks || 0} />
              <StatCard title="Leads" value={data?.summary?.totalLeads || 0} />
              <StatCard title="Approved" value={data?.summary?.approved || 0} />
              <StatCard title="Revenue" value={`$${data?.summary?.revenue || 0}`} />
            </div>

            {/* CLICK CHART */}
            <Section title="Clicks Trend">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.clickTimeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.day" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Section>

            {/* OFFER CHART */}
            <Section title="Top Offers">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.offerStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </Section>

            {/* ACTIONS */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">⚙️ Actions</h3>

              <div className="flex gap-2 mb-3">
                <select
                  value={offerId}
                  onChange={(e) => setOfferId(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Offer</option>
                  {offers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={assignOffer}
                  className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>

              <button
                onClick={removeAffiliate}
                className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 transition"
              >
                ❌ Remove Affiliate
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// 💎 SMALL COMPONENTS
function StatCard({ title, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl text-center shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-xl">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}