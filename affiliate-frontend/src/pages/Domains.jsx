import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState("");
  const [smartlink, setSmartlink] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // 📦 FETCH DOMAINS
  // =========================
  const fetchDomains = async () => {
    try {
      const res = await api.get("/domains"); // ✅ FIXED
      setDomains(res.data || []);
    } catch (err) {
      console.log("Fetch error:", err);
      toast.error("Failed to load domains");
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // =========================
  // 🔥 ADD DOMAIN
  // =========================
  const addDomain = async () => {
    if (!domain || !smartlink) {
      return toast.error("All fields required");
    }

    // 🔥 CLEAN DOMAIN INPUT
    let cleanDomain = domain
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "")
      .replace("domain:", "")
      .trim()
      .toLowerCase();

    try {
      setLoading(true);

      await api.post("/domains", { // ✅ FIXED
        domain: cleanDomain,
        smartlink_id: smartlink
      });

      toast.success("Domain added ✅");

      setDomain("");
      setSmartlink("");

      fetchDomains();

    } catch (err) {
      console.log("Add error:", err);

      const msg = err.response?.data?.message;

      if (msg) {
        toast.error(msg);
      } else {
        toast.error("Failed to add domain");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div>
      <h2 className="text-2xl font-bold mb-5">🌐 Domain Manager</h2>

      {/* =========================
          ADD FORM
      ========================= */}
      <div className="bg-white p-5 rounded-xl shadow mb-6 flex gap-3 items-center">

        <input
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border p-2 rounded w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="smartlink id"
          value={smartlink}
          onChange={(e) => setSmartlink(e.target.value)}
          className="border p-2 rounded w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={addDomain}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* =========================
          LIST
      ========================= */}
      <div className="bg-white p-5 rounded-xl shadow">

        {domains.length === 0 ? (
          <p className="text-gray-500 text-center">No domains yet</p>
        ) : (
          <div className="space-y-3">
            {domains.map((d) => (
              <div
                key={d._id}
                className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 px-2 rounded transition"
              >
                {/* DOMAIN */}
                <span className="font-medium">{d.domain}</span>

                {/* SMARTLINK */}
                <span className="text-gray-500 text-sm">
                  SL: {
                    typeof d.smartlink_id === "object"
                      ? d.smartlink_id?.name
                      : d.smartlink_id
                  }
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}