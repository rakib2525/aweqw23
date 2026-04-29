import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function WithdrawRequest() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // =========================
  // 🔥 FETCH HISTORY (FIXED)
  // =========================
  const fetchHistory = async () => {
    try {
      const res = await api.get("/withdraw/my");

      // 🔥 FIX HERE
      setHistory(res.data?.data || []);

    } catch (err) {
      console.log(err);
      setHistory([]); // fallback
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // =========================
  // 💸 SUBMIT
  // =========================
  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      return toast.error("Enter valid amount ❌");
    }

    if (!account) {
      return toast.error("Enter account details ❌");
    }

    const t = toast.loading("Processing...");
    setLoading(true);

    try {
      await api.post("/withdraw", {
        amount: Number(amount),
        method,
        account
      });

      toast.success("Withdraw request sent 💸", { id: t });

      setAmount("");
      setAccount("");

      fetchHistory();

    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Withdraw failed ❌", { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-xl">

      <h2 className="text-2xl font-bold mb-5">
        Withdraw
      </h2>

      {/* 🔥 FORM */}
      <form
        onSubmit={handleWithdraw}
        className="bg-white p-4 rounded-xl shadow mb-6"
      >

        <input
          type="number"
          placeholder="Amount"
          className="border p-2 w-full mb-3 rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3 rounded"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="bkash">Bkash</option>
          <option value="nagad">Nagad</option>
          <option value="binance">Binance</option>
          <option value="paypal">Paypal</option>
        </select>

        <input
          type="text"
          placeholder="Account (number/email)"
          className="border p-2 w-full mb-3 rounded"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {loading ? "Processing..." : "Request Withdraw"}
        </button>

      </form>

      {/* 🔥 HISTORY */}
      <div className="bg-white p-4 rounded-xl shadow">

        <h3 className="font-semibold mb-3">
          Withdraw History
        </h3>

        {/* 🔥 FIXED SAFE RENDER */}
        {(history || []).length === 0 ? (
          <p className="text-gray-500">
            No withdraw requests
          </p>
        ) : (
          (history || []).map((w) => (
            <div
              key={w._id}
              className="flex justify-between border-b py-2"
            >
              <span>${Number(w.amount || 0).toFixed(2)}</span>

              <span
                className={
                  w.status === "approved"
                    ? "text-green-500"
                    : w.status === "rejected"
                    ? "text-red-500"
                    : "text-yellow-500"
                }
              >
                {w.status}
              </span>
            </div>
          ))
        )}

      </div>

    </div>
  );
}