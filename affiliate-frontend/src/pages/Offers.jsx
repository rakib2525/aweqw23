import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState([]);
  const [links, setLinks] = useState({}); // 🔥 store tracking links

  // =========================
  // 🔥 FETCH OFFERS
  // =========================
  const fetchOffers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/offers");
      setOffers(res.data || []);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setApplied(user?.appliedOffers || []);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load offers ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // =========================
  // 🔥 APPLY OFFER + GET LINK
  // =========================
  const applyOffer = async (offerId) => {
    try {
      const res = await api.post(`/offers/apply/${offerId}`);

      toast.success("Applied + Link Generated 🚀");

      // update applied list
      setApplied((prev) =>
        prev.includes(offerId) ? prev : [...prev, offerId]
      );

      // 🔥 save tracking link
      if (res.data?.tracking_link) {
        setLinks((prev) => ({
          ...prev,
          [offerId]: res.data.tracking_link
        }));
      }

    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Apply failed ❌");
    }
  };

  // =========================
  // 🔥 COPY LINK
  // =========================
  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied 📋");
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">🎯 Offers</h2>

      {loading ? (
        <div className="bg-white p-4 rounded-xl shadow">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 rounded mb-2 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Offer Name</th>
                <th className="p-3 text-left">Payout</th>
                <th className="p-3 text-left">Country</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No offers found
                  </td>
                </tr>
              ) : (
                offers.map((o) => {
                  const isApplied = applied.includes(o._id);
                  const link = links[o._id];

                  return (
                    <tr
                      key={o._id}
                      className="border-t hover:bg-blue-50 transition duration-200"
                    >
                      <td className="p-3 font-medium">{o.name}</td>

                      <td className="p-3 font-semibold">
                        ${Number(o.payout || 0).toFixed(2)}
                      </td>

                      <td className="p-3">
                        {o.country || "All"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            o.status === "active"
                              ? "bg-green-100 text-green-600"
                              : o.status === "paused"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td className="p-3 space-y-2">

                        {/* APPLY BUTTON */}
                        <button
                          type="button"
                          disabled={isApplied}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            applyOffer(o._id);
                          }}
                          className={`px-3 py-1 rounded text-xs text-white transition ${
                            isApplied
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {isApplied ? "Applied" : "Apply"}
                        </button>

                        {/* 🔥 SHOW LINK AFTER APPLY */}
                        {link && (
                          <div className="mt-2">
                            <input
                              value={link}
                              readOnly
                              className="w-full border p-1 text-xs rounded mb-1"
                            />
                            <button
                              onClick={() => copyLink(link)}
                              className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}