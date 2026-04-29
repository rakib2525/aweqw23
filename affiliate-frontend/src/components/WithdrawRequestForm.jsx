import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const WithdrawRequestForm = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/withdraw/request", { amount });
      toast.success("Withdrawal request submitted successfully");
      setAmount("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-semibold">
          Withdrawal Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        {loading ? "Processing..." : "Request Withdraw"}
      </button>
    </form>
  );
};

export default WithdrawRequestForm;