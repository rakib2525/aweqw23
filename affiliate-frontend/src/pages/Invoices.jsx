import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Invoices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔥 FETCH INVOICES
  // =========================
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const res = await api.get("/invoice/my");

      // ✅ SAFE DATA FIX
      setData(res.data?.data || []);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load invoices ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="p-5">

      <h2 className="text-2xl font-bold mb-6">
        🧾 My Invoices
      </h2>

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="bg-white p-4 rounded-xl shadow">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 rounded mb-2 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full text-sm">

            {/* ================= HEADER (FIXED) ================= */}
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Download</th> {/* 🔥 NEW */}
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                data.map((i) => (
                  <tr
                    key={i._id}
                    className="border-t hover:bg-blue-50 transition"
                  >

                    <td className="p-3 font-medium">
                      {i.invoiceId || i._id}
                    </td>

                    <td className="p-3 font-semibold">
                      ${Number(i.amount || 0).toFixed(2)}
                    </td>

                    <td className="p-3">
                      {i.method || "-"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold
                          ${i.status === "paid" && "bg-green-100 text-green-600"}
                          ${i.status === "pending" && "bg-yellow-100 text-yellow-600"}
                          ${i.status === "failed" && "bg-red-100 text-red-600"}
                        `}
                      >
                        {i.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {new Date(i.createdAt).toLocaleDateString()}
                    </td>

                    {/* 🔥 DOWNLOAD BUTTON */}
                    <td className="p-3">
                      <a
                        href={`/api/invoice/${i._id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-500 hover:bg-blue-600 transition text-white px-3 py-1 rounded text-xs"
                      >
                        Download
                      </a>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}