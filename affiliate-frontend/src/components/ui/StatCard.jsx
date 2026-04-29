export default function StatCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-400 to-red-400",
    yellow: "from-yellow-400 to-amber-500",
  };

  return (
    <div
      className={`p-5 rounded-2xl text-white shadow-lg hover:shadow-2xl transition bg-gradient-to-r ${colors[color]}`}
    >
      <p className="text-sm opacity-80">
        {icon} {title}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}