import React from "react";

export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="card">My Affiliates</div>
        <div className="card">Clicks</div>
        <div className="card">Revenue</div>
      </div>
    </div>
  );
}