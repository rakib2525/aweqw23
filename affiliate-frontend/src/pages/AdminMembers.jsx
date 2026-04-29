import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [managers, setManagers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [selectedManager, setSelectedManager] = useState("");

  const [loadingOffer, setLoadingOffer] = useState(false);
  const [loadingManager, setLoadingManager] = useState(false);
  const [unlockingId, setUnlockingId] = useState(null);

  // 🔥 NEW: CREATE MANAGER
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [creatingManager, setCreatingManager] = useState(false);

  // =========================
  // 🔥 FETCH ALL DATA
  // =========================
  const fetchData = async () => {
    try {
      const [userRes, offerRes, managerRes] = await Promise.all([
        api.get("/admin/affiliates"),
        api.get("/offers"),
        api.get("/admin/managers"),
      ]);

      setUsers(userRes.data?.data || []);
      setOffers(offerRes.data || []);
      setManagers(managerRes.data?.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load data ❌");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // 🔥 CREATE MANAGER
  // =========================
  const createManager = async () => {
    if (!newManager.name || !newManager.email || !newManager.password) {
      return toast.error("All fields required ❗");
    }

    try {
      setCreatingManager(true);

      await api.post("/admin/create-manager", newManager);

      toast.success("Manager created ✅");

      setNewManager({
        name: "",
        email: "",
        password: ""
      });

      fetchData();

    } catch (err) {
      console.log(err);
      toast.error("Create failed ❌");
    } finally {
      setCreatingManager(false);
    }
  };

  // =========================
  // 🔥 RESET WHEN USER CHANGE
  // =========================
  useEffect(() => {
    if (selectedUser) {
      setSelectedOffer("");
      setSelectedManager(selectedUser.manager_id?._id || "");
    }
  }, [selectedUser]);

  // =========================
  // 🔓 UNLOCK WALLET
  // =========================
  const unlockWallet = async (id) => {
    if (!window.confirm("Unlock this wallet? 🔓")) return;

    try {
      setUnlockingId(id);

      await api.patch(`/profile/wallet/unlock/${id}`);

      toast.success("Wallet unlocked 🔓");

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Unlock failed ❌");
    } finally {
      setUnlockingId(null);
    }
  };

  // =========================
  // 🎯 ASSIGN OFFER
  // =========================
  const assignOffer = async () => {
    if (!selectedUser || !selectedOffer) {
      return toast.error("Select user & offer");
    }

    try {
      setLoadingOffer(true);

      const res = await api.post("/admin/assign-offer", {
        userId: selectedUser._id,
        offerId: selectedOffer,
      });

      toast.success("Offer assigned ✅");

      if (res.data?.tracking_link) {
        prompt("📎 Copy Tracking Link:", res.data.tracking_link);
      }

      setSelectedOffer("");
    } catch (err) {
      console.log(err);
      toast.error("Assign failed ❌");
    } finally {
      setLoadingOffer(false);
    }
  };

  // =========================
  // 👨‍💼 ASSIGN MANAGER
  // =========================
  const assignManager = async () => {
    if (!selectedUser || !selectedManager) {
      return toast.error("Select user & manager");
    }

    try {
      setLoadingManager(true);

      await api.post("/admin/assign-manager", {
        userId: selectedUser._id,
        managerId: selectedManager,
      });

      toast.success("Manager assigned ✅");

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Manager assign failed ❌");
    } finally {
      setLoadingManager(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">👥 Affiliate Members</h2>

      {/* ================= CREATE MANAGER ================= */}
      <div className="bg-white p-5 rounded-xl shadow mb-6 max-w-lg">
        <h3 className="font-bold mb-4 text-lg">➕ Create Manager</h3>

        <input
          placeholder="Name"
          value={newManager.name}
          onChange={(e) =>
            setNewManager({ ...newManager, name: e.target.value })
          }
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          placeholder="Email"
          value={newManager.email}
          onChange={(e) =>
            setNewManager({ ...newManager, email: e.target.value })
          }
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={newManager.password}
          onChange={(e) =>
            setNewManager({ ...newManager, password: e.target.value })
          }
          className="border p-2 w-full mb-3 rounded"
        />

        <button
          onClick={createManager}
          disabled={creatingManager}
          className="bg-indigo-600 text-white w-full p-2 rounded"
        >
          {creatingManager ? "Creating..." : "Create Manager"}
        </button>
      </div>

      {/* ================= USER TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Balance</th>
              <th className="p-3 text-left">Manager</th>
              <th className="p-3 text-left">Wallet</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No affiliates found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">${u.balance || 0}</td>

                  <td className="p-3 text-sm text-gray-600">
                    {u.manager_id?.name || (
                      <span className="text-red-500">No Manager</span>
                    )}
                  </td>

                  <td className="p-3">
                    {u.walletLocked ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-red-500 text-xs">🔒 Locked</span>

                        <button
                          onClick={() => unlockWallet(u._id)}
                          disabled={unlockingId === u._id}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                        >
                          {unlockingId === u._id ? "..." : "🔓 Unlock"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-600 text-xs">Unlocked</span>
                    )}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= CONTROL PANEL ================= */}
      {selectedUser && (
        <div className="bg-white p-5 rounded-xl shadow max-w-lg">
          <h3 className="font-bold mb-4">
            ⚙️ Manage → {selectedUser.name}
          </h3>

          {/* OFFER */}
          <select
            value={selectedOffer}
            onChange={(e) => setSelectedOffer(e.target.value)}
            className="border p-2 w-full mb-3 rounded"
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
            className="bg-green-500 text-white w-full p-2 rounded mb-3"
          >
            Assign Offer
          </button>

          {/* MANAGER */}
          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="border p-2 w-full mb-3 rounded"
          >
            <option value="">Select Manager</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={assignManager}
            className="bg-purple-500 text-white w-full p-2 rounded mb-3"
          >
            Assign Manager
          </button>

          <button
            onClick={() => setSelectedUser(null)}
            className="bg-gray-400 text-white w-full p-2 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}