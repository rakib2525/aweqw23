import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout & Auth
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// ================= PAGES =================
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Offers from "./pages/Offers";
import Earnings from "./pages/Earnings";
import WithdrawRequest from "./pages/WithdrawRequest";
import Withdraws from "./pages/Withdraws";
import Smartlink from "./pages/Smartlink";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Domains from "./pages/Domains";
import Stats from "./pages/Stats";
import GenerateLink from "./pages/GenerateLink";
import Profile from "./pages/Profile";

// ================= ADMIN =================
import AdminMembers from "./pages/AdminMembers";
import Managers from "./pages/admin/Managers";
import Affiliates from "./pages/admin/Affiliates";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminDashboard from "./pages/admin/AdminDashboard"; // ✅ NEW

// ================= MANAGER =================
import ManagerStats from "./pages/manager/ManagerStats";
import ManagerDashboard from "./pages/manager/ManagerDashboard"; // ✅ NEW

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ================= AFFILIATE ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />

        {/* ================= COMMON ================= */}
        <Route path="/stats" element={<ProtectedRoute><Layout><Stats /></Layout></ProtectedRoute>} />
        <Route path="/offers" element={<ProtectedRoute><Layout><Offers /></Layout></ProtectedRoute>} />
        <Route path="/smartlink" element={<ProtectedRoute><Layout><Smartlink /></Layout></ProtectedRoute>} />
        <Route path="/generate-link" element={<ProtectedRoute><Layout><GenerateLink /></Layout></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><Layout><WithdrawRequest /></Layout></ProtectedRoute>} />
        <Route path="/earnings" element={<ProtectedRoute><Layout><Earnings /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/leads" element={<ProtectedRoute role="admin"><Layout><Leads /></Layout></ProtectedRoute>} />
        <Route path="/withdraws" element={<ProtectedRoute role="admin"><Layout><Withdraws /></Layout></ProtectedRoute>} />
        <Route path="/domains" element={<ProtectedRoute role="admin"><Layout><Domains /></Layout></ProtectedRoute>} />
        <Route path="/admin/members" element={<ProtectedRoute role="admin"><Layout><AdminMembers /></Layout></ProtectedRoute>} />
        <Route path="/admin/managers" element={<ProtectedRoute role="admin"><Layout><Managers /></Layout></ProtectedRoute>} />
        <Route path="/admin/affiliates" element={<ProtectedRoute role="admin"><Layout><Affiliates /></Layout></ProtectedRoute>} />
        <Route path="/admin/offers" element={<ProtectedRoute role="admin"><Layout><AdminOffers /></Layout></ProtectedRoute>} />

        {/* ================= MANAGER ================= */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="manager">
              <Layout><ManagerDashboard /></Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/stats/manager" element={<ProtectedRoute role="manager"><Layout><ManagerStats /></Layout></ProtectedRoute>} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>
  );
}

export default App;