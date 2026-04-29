import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function AffiliateTable({ onSelect }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/manager/affiliates")
      .then(res => setData(res.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

      {/* 🔥 HEADER */}
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 text-lg">
          👥 My Affiliates
        </h3>

        <span className="text-sm text-gray-400">
          {data.length} total
        </span>
      </div>

      {/* 🔥 TABLE */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Balance</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-6 text-gray-400">
                No affiliates found
              </td>
            </tr>
          )}

          {data.map((a) => (
            <tr
              key={a._id}
              onClick={() => onSelect(a._id)}
              className="border-t hover:bg-gray-50 cursor-pointer transition duration-200"
            >
              <td className="p-4 font-medium text-gray-800">
                {a.name}
              </td>

              <td className="p-4 text-gray-500">
                {a.email}
              </td>

              <td className="p-4 font-semibold text-gray-700">
                ${a.balance}
              </td>

              <td className="p-4">
                <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}