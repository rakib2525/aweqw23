import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔁 MULTI-TAB SYNC (login/logout)
  useEffect(() => {
    const sync = (e) => {
      if (e.key === "logout") {
        setUser(null);
        window.location.href = "/login";
      }
      if (e.key === "login") {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        setUser(u);
      }
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // 🔁 SILENT REFRESH (every 10 min)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        const res = await api.post("/auth/refresh", { refreshToken });

        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);

      } catch (err) {
        logout(); // refresh fail → logout
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 🚪 LOGOUT (FIXED)
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      // 🔥 backend logout (optional but good)
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.log("Logout API error (ignored)");
    }

    // 🔥 CLEAR ONLY NEEDED
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // 🔥 MULTI TAB SYNC
    localStorage.setItem("logout", Date.now());

    setUser(null);

    window.location.href = "/login";
  };

  useEffect(() => {
    try {
      // Checking user data in localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Safe parsing with try-catch block
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      setUser(null); // In case of error, set user to null
    }
  }, []); // Only run once on component mount

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}