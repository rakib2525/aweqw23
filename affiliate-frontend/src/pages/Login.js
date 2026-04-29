import { useState, useContext } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please fill all fields ⚠️");
    }

    const t = toast.loading("Logging in...");

    try {
      setLoading(true);

      // Send login request
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // Checking response
      if (res.data.success) {
        // ✅ Save tokens in localStorage
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));

        setUser(res.data.data.user);

        toast.success("Login successful 🚀", { id: t });

        // Role-based redirect
        const role = res.data.data.user?.role;
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "manager") {
          navigate("/manager");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res.data.message || "Login failed ❌", { id: t });
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed ❌", { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={login}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-3 mb-3 w-full rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 mb-4 w-full rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 font-semibold">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}