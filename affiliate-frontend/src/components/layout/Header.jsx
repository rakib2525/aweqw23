import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center mb-4 rounded-xl">

      {/* LEFT */}
      <div>
        <h1 className="font-bold text-lg text-gray-800">
          {user?.role === "admin" && "👑 Admin Dashboard"}
          {user?.role === "manager" && "👨‍💼 Manager Dashboard"}
          {user?.role === "affiliate" && "📊 Dashboard"}
        </h1>

        <p className="text-xs text-gray-400">
          Welcome back 👋
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* PROFILE */}
        <Link
          to="/profile"
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition"
        >
          👤 Profile
        </Link>

        {/* USER NAME */}
        <span className="text-sm text-gray-600 font-medium">
          {user?.name || "User"}
        </span>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
        >
          Logout
        </button>

      </div>

    </div>
  );
}