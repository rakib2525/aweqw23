import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("accessToken");
  let user = null;

  try {
    user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  } catch (err) {
    console.error("Error parsing user from localStorage:", err);
  }

  // ❌ Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Access allowed
  return children;
}