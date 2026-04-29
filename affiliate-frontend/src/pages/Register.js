import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    vertical: "",
    trafficType: "",
    imType: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validation
    if (!form.name || !form.email || !form.password) {
      return alert("All fields are required");
    }

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    if (!form.agree) {
      return alert("You must agree to Terms");
    }

    setLoading(true);

    try {
      // 🔥 backend compatible payload
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,

        // optional (future use)
        vertical: form.vertical,
        trafficType: form.trafficType,
        imType: form.imType,
      });

      alert("Registered successfully ✅");
      navigate("/login");

    } catch (err) {
      console.error(err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        "Registration failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md"
      >
        <h2 className="text-xl mb-4 font-semibold text-center">
          Register
        </h2>

        {/* NAME */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Repeat Password"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* VERTICAL */}
        <input
          type="text"
          name="vertical"
          placeholder="Verticals"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* TRAFFIC TYPE */}
        <input
          type="text"
          name="trafficType"
          placeholder="Traffic Type"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* IM TYPE */}
        <select
          name="imType"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="">Select IM Type</option>
          <option>Telegram</option>
          <option>Whatsapp</option>
          <option>Email</option>
          <option>Microsoft Teams</option>
        </select>

        {/* TERMS */}
        <label className="flex items-center mb-3 text-sm">
          <input
            type="checkbox"
            name="agree"
            onChange={handleChange}
            className="mr-2"
          />
          I agree with Terms And Conditions
        </label>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 font-semibold">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}