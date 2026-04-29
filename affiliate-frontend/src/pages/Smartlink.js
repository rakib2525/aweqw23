import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast"; // 🔥 ADD

export default function Smartlink() {
  const [name, setName] = useState("");
  const [defaultOffer, setDefaultOffer] = useState("");
  const [offers, setOffers] = useState([]);

  const [rules, setRules] = useState([
    { country: "", offer: "", priority: 1 }
  ]);

  const [savedLink, setSavedLink] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [loading, setLoading] = useState(false); // 🔥 NEW

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await api.get("/offers");
      setOffers(res.data || []);
    } catch {
      toast.error("Failed to load offers ❌");
    }
  };

  const addRule = () => {
    setRules([
      ...rules,
      { country: "", offer: "", priority: rules.length + 1 }
    ]);
  };

  const deleteRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDrop = (index) => {
    const newRules = [...rules];
    const dragged = newRules[dragIndex];

    newRules.splice(dragIndex, 1);
    newRules.splice(index, 0, dragged);

    setRules(newRules);
    setDragIndex(null);
  };

  // 🔥 SAVE
  const saveSmartlink = async () => {
    if (!name || !defaultOffer) {
      return toast.error("Fill all required fields ⚠️");
    }

    const t = toast.loading("Saving smartlink...");

    try {
      setLoading(true);

      const res = await api.post("/smartlinks", {
        name,
        default_offer: defaultOffer
      });

      const smartlinkId = res.data._id;
      setSavedLink(res.data);

      // save rules
      for (let i = 0; i < rules.length; i++) {
        await api.post(`/smartlinks/${smartlinkId}/rules`, {
          country: rules[i].country,
          offer_id: rules[i].offer,
          priority: i + 1
        });
      }

      toast.success("Smartlink created 🚀", { id: t });

    } catch (err) {
      toast.error("Failed to save ❌", { id: t });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `http://localhost:5000/${savedLink.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Copied to clipboard 📋");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Smartlink Builder</h2>

      {/* NAME */}
      <input
        type="text"
        placeholder="Smartlink Name"
        className="border p-3 rounded w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* DEFAULT OFFER */}
      <select
        className="border p-3 rounded w-full mb-6"
        value={defaultOffer}
        onChange={(e) => setDefaultOffer(e.target.value)}
      >
        <option value="">Select Default Offer</option>
        {offers.map((offer) => (
          <option key={offer._id} value={offer._id}>
            {offer.name}
          </option>
        ))}
      </select>

      <h3 className="font-semibold mb-3">Rules (Drag to reorder)</h3>

      {rules.map((rule, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className="flex gap-2 mb-3 bg-gray-50 p-3 rounded-lg cursor-move hover:shadow transition"
        >
          <div className="w-10 flex items-center font-bold">
            #{index + 1}
          </div>

          <select
            className="border p-2 rounded w-1/4"
            value={rule.country}
            onChange={(e) => updateRule(index, "country", e.target.value)}
          >
            <option value="">Country</option>
            <option value="US">🇺🇸 US</option>
            <option value="BD">🇧🇩 BD</option>
            <option value="IN">🇮🇳 IN</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="CA">🇨🇦 CA</option>
          </select>

          <select
            className="border p-2 rounded w-1/4"
            value={rule.offer}
            onChange={(e) => updateRule(index, "offer", e.target.value)}
          >
            <option value="">Select Offer</option>
            {offers.map((offer) => (
              <option key={offer._id} value={offer._id}>
                {offer.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => deleteRule(index)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 rounded"
          >
            X
          </button>
        </div>
      ))}

      <button
        onClick={addRule}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        + Add Rule
      </button>

      <br />

      <button
        onClick={saveSmartlink}
        disabled={loading}
        className={`px-5 py-2 rounded text-white transition
          ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"}
        `}
      >
        {loading ? "Saving..." : "Save Smartlink"}
      </button>

      {/* PREVIEW */}
      {savedLink && (
        <div className="mt-6 p-4 bg-black text-white rounded-xl">
          <p className="mb-2 text-sm">🔗 Smartlink</p>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`http://localhost:5000/${savedLink.code}`}
              className="p-2 w-full text-black rounded"
            />

            <button
              onClick={copyLink}
              className="bg-green-500 px-4 rounded"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}