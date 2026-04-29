import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white shadow-sm px-6 py-3">
          <Header />
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>

      </div>

    </div>
  );
}