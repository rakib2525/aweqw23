import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function GenerateLink() {
  const [smartlinks, setSmartlinks] = useState([]);
  const [selected, setSelected] = useState("");
  const [subid, setSubid] = useState("");
  const [generated, setGenerated] = useState("");

  useEffect(() => {
    fetchSmartlinks();
  }, []);

  const fetchSmartlinks = async () => {
    try {
      const res = await api.get("/smartlinks");
      setSmartlinks(res.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load smartlinks ❌");
    }
  };

  // ✅ FIXED LINK GENERATION
  const generateLink = () => {
    if (!selected) {
      toast.error("Select a smartlink ❌");
      return;
    }

    const base = window.location.origin.replace(":3000", ":5000");

    // 🔥 FIX: use /track/:id (NOT ?sl=)
    const link =
      `${base}/track/${selected}` +
      (subid ? `?subid=${subid}` : "");

    setGenerated(link);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      toast.success("Copied 🚀");
    } catch {
      toast.error("Copy failed ❌");
    }
  };

  return (
    <div className="p-5 max-w-xl">
      <h2 className="text-xl font-bold mb-4">🔗 Generate Link</h2>

      {/* SELECT */}
      <select
        className="border p-2 rounded w-full mb-3"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select Smartlink</option>
        {smartlinks.map((sl) => (
          <option key={sl._id} value={sl._id}>
            {sl.name}
          </option>
        ))}
      </select>

      {/* SUBID */}
      <input
        placeholder="SubID (optional)"
        className="border p-2 rounded w-full mb-3"
        value={subid}
        onChange={(e) => setSubid(e.target.value)}
      />

      {/* BUTTON */}
      <button
        onClick={generateLink}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-3 hover:bg-blue-600"
      >
        Generate Link
      </button>

      {/* RESULT */}
      {generated && (
        <div>
          <input
            value={generated}
            readOnly
            className="border p-2 rounded w-full bg-gray-100 mb-2"
          />

          <button
            onClick={copyLink}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}