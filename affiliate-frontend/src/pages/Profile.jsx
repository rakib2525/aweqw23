import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [wallet, setWallet] = useState({
    method: "",
    account: ""
  });

  // =========================
  // 🔥 LOAD PROFILE
  // =========================
  const loadProfile = async () => {
    try {
      const res = await api.get("/profile");
      const user = res.data?.data;

      setData(user);

      setWallet({
        method: user?.wallet?.method || "",
        account: user?.wallet?.account || ""
      });

    } catch (err) {
      toast.error("Failed to load profile ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =========================
  // ✏️ UPDATE PROFILE
  // =========================
  const updateProfile = async () => {
    try {
      await api.put("/profile", {
        name: data.name
      });

      toast.success("Profile updated ✅");
      loadProfile();
    } catch (err) {
      toast.error("Update failed ❌");
    }
  };

  // =========================
  // 🔑 CHANGE PASSWORD
  // =========================
  const changePassword = async () => {
    if (!password) return toast.error("Enter password ❗");

    try {
      await api.put("/profile/password", { password });
      toast.success("Password changed 🔐");
      setPassword("");
    } catch {
      toast.error("Failed ❌");
    }
  };

  // =========================
  // 💳 SAVE WALLET
  // =========================
  const saveWallet = async () => {
    if (!wallet.method || !wallet.account) {
      return toast.error("Fill wallet info ❗");
    }

    try {
      await api.put("/profile/wallet", wallet);
      toast.success("Wallet saved 💳");
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed ❌");
    }
  };

  // =========================
  // 🔒 LOCK WALLET
  // =========================
  const lockWallet = async () => {
    if (!window.confirm("Lock wallet permanently? 🔒")) return;

    try {
      await api.patch("/profile/wallet/lock");
      toast.success("Wallet locked 🔒");
      loadProfile();
    } catch {
      toast.error("Failed ❌");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h2 className="text-2xl font-bold mb-6">
        👤 Profile Settings
      </h2>

      {/* ================= BASIC ================= */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Basic Info</h3>

        <input
          value={data?.name || ""}
          onChange={(e) =>
            setData({ ...data, name: e.target.value })
          }
          className="border p-2 w-full mb-3 rounded"
          placeholder="Name"
        />

        <input
          value={data?.email || ""}
          disabled
          className="border p-2 w-full mb-3 rounded bg-gray-100"
        />

        <button
          onClick={updateProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>

      {/* ================= PASSWORD ================= */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">
          Change Password
        </h3>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <button
          onClick={changePassword}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Update Password
        </button>
      </div>

      {/* ================= WALLET ================= */}
      <div className="bg-white p-5 rounded-2xl shadow">

        <h3 className="font-semibold mb-3 text-gray-700">
          💳 Wallet Settings
        </h3>

        {data?.walletLocked && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">
            🔒 Wallet Locked (Admin unlock required)
          </div>
        )}

        <select
          disabled={data?.walletLocked}
          value={wallet.method}
          onChange={(e) =>
            setWallet({ ...wallet, method: e.target.value })
          }
          className="border p-2 w-full mb-3 rounded"
        >
          <option value="">Select Method</option>
          <option value="bkash">Bkash</option>
          <option value="nagad">Nagad</option>
          <option value="binance">Binance</option>
          <option value="paypal">Paypal</option>
        </select>

        <input
          disabled={data?.walletLocked}
          value={wallet.account}
          onChange={(e) =>
            setWallet({ ...wallet, account: e.target.value })
          }
          placeholder="Account"
          className="border p-2 w-full mb-3 rounded"
        />

        {!data?.walletLocked && (
          <div className="flex gap-2">
            <button
              onClick={saveWallet}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Wallet
            </button>

            <button
              onClick={lockWallet}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              🔒 Lock
            </button>
          </div>
        )}

      </div>

    </div>
  );
}