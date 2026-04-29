import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthProvider";

export default function GenerateLink() {
  const { user } = useContext(AuthContext);

  const [smartlinks, setSmartlinks] = useState([]);
  const [selected, setSelected] = useState("");
  const [subid, setSubid] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔥 LOAD SMARTLINKS FROM API
  // =========================
  useEffect(() => {
    const fetchSmartlinks = async () => {
      try {
        const res = await api.get("/smartlinks");

        const data = res.data || [];
        setSmartlinks(data);

        if (data.length > 0) {
          setSelected(data[0]._id);
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load smartlinks ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchSmartlinks();
  }, []);

  // =========================
  // 🔗 GENERATE LINK
  // =========================
  const handleGenerate = () => {
    if (!selected) {
      return toast.error("Select a smartlink first ❌");
    }

    const base = "http://localhost:5000/track";

    const link =
      `${base}?sl=${selected}` +
      (subid ? `&subid=${subid}` : "");

    setGeneratedLink(link);
  };

  // =========================
  // 📋 COPY LINK
  // =========================
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Copied 🚀");
    } catch {
      toast.error("Copy failed ❌");
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) {
    return <p className="p-5">Loading smartlinks...</p>;
  }

  if (!user) {
    return <p className="p-5">Loading user...</p>;
  }

  return (
    <div className="p-5 max-w-2xl">

      <h2 className="text-2xl font-bold mb-6">
        ⚡ Generate Tracking Link
      </h2>

      {/* ================= SMARTLINK SELECT ================= */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Smartlink</label>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border p-2 rounded"
        >
          {smartlinks.length === 0 ? (
            <option>No smartlinks found</option>
          ) : (
            smartlinks.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || "Smartlink"} ({s._id})
              </option>
            ))
          )}
        </select>
      </div>

      {/* ================= SUBID ================= */}
      <div className="mb-4">
        <label className="block text-sm mb-1">SubID (optional)</label>

        <input
          value={subid}
          onChange={(e) => setSubid(e.target.value)}
          placeholder="fb_campaign_1"
          className="w-full border p-2 rounded"
        />
      </div>

      {/* ================= GENERATE BUTTON ================= */}
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
      >
        Generate Link
      </button>

      {/* ================= RESULT ================= */}
      {generatedLink && (
        <div className="mt-4">

          <p className="text-sm mb-1">Generated Link:</p>

          <div className="flex gap-2">
            <input
              value={generatedLink}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />

            <button
              onClick={copyLink}
              className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
            >
              Copy
            </button>
          </div>

        </div>
      )}

      {/* ================= INFO ================= */}
      <div className="mt-6 text-sm text-gray-500">
        <p>👉 Use this link in ads (Facebook, Google, etc)</p>
        <p>👉 SubID helps track traffic source</p>
      </div>

    </div>
  );
}