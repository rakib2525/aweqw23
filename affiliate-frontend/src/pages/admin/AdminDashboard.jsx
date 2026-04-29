import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="card">Total Users</div>
        <div className="card">Total Revenue</div>
        <div className="card">Total Clicks</div>
        <div className="card">Pending Withdraw</div>
      </div>
    </div>
  );
}