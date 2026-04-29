import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthProvider";

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const role = (user?.role || "").toLowerCase();

  // ================= BALANCE FIX =================
  useEffect(() => {
    if (!user || role !== "affiliate") {
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const res = await api.get("/earnings/me");

        // ✅ FIXED HERE
        setBalance(res.data?.data?.balance || 0);

      } catch (err) {
        console.log("Balance error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user, role]);

  const formattedBalance = Number(balance || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // ================= ACTIVE =================
  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== "/" && location.pathname.startsWith(path + "/")) return true;
    return false;
  };

  const linkClass = (path) =>
    `block px-3 py-2 rounded transition ${
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="w-60 min-h-screen bg-white shadow p-5 flex flex-col justify-between">

      <div>
        <h2 className="text-xl font-bold mb-4">🚀 Rakib Panel</h2>

        {/* ================= AFFILIATE ================= */}
        {role === "affiliate" && (
          <>
            <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">
              {loading ? "Loading..." : `$${formattedBalance}`}
            </div>

            <ul className="space-y-2">
              <li><Link to="/stats" className={linkClass("/stats")}>📊 Stats</Link></li>
              <li><Link to="/offers" className={linkClass("/offers")}>🎯 Offers</Link></li>
              <li><Link to="/earnings" className={linkClass("/earnings")}>💰 Earnings</Link></li>
              <li><Link to="/withdraw" className={linkClass("/withdraw")}>💸 Withdraw</Link></li>
              <li><Link to="/profile" className={linkClass("/profile")}>👤 Profile</Link></li>
            </ul>
          </>
        )}

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            <p className="mt-4 mb-2 text-gray-400 text-sm">ADMIN</p>

            <ul className="space-y-2">
              <li><Link to="/admin" className={linkClass("/admin")}>🏠 Dashboard</Link></li>

              {/* 🔥 NEW FIX */}
              <li><Link to="/admin/managers" className={linkClass("/admin/managers")}>
                👨‍💼 Managers
              </Link></li>

              <li><Link to="/admin/affiliates" className={linkClass("/admin/affiliates")}>
                🧑‍💻 Affiliates
              </Link></li>

              <li><Link to="/admin/offers" className={linkClass("/admin/offers")}>
                🎯 Offers
              </Link></li>

              <li><Link to="/leads" className={linkClass("/leads")}>📥 Leads</Link></li>
              <li><Link to="/withdraws" className={linkClass("/withdraws")}>💸 Withdraws</Link></li>
              <li><Link to="/domains" className={linkClass("/domains")}>🌐 Domains</Link></li>
            </ul>
          </>
        )}

        {/* ================= MANAGER ================= */}
        {role === "manager" && (
          <>
            <p className="mt-4 mb-2 text-gray-400 text-sm">MANAGER</p>

            <ul className="space-y-2">
              <li><Link to="/dashboard" className={linkClass("/dashboard")}>📊 Dashboard</Link></li>
              <li><Link to="/stats/manager" className={linkClass("/stats/manager")}>📈 Team Stats</Link></li>
            </ul>
          </>
        )}

        {/* DEBUG */}
        {!role && (
          <p className="text-sm text-red-500">
            ⚠️ No role found (Auth issue)
          </p>
        )}
      </div>

      {/* FOOTER */}
      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          toast.success("Logged out 👋");
          logout?.();
        }}
      >
        🚪 Logout
      </Button>
    </div>
  );
}