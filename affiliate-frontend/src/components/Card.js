import React from "react";

export default function Card({
  title,
  value,
  icon = "📊",
  color = "blue"
}) {

  // 🔥 Tailwind safe color mapping
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div
      className="
        flex items-center justify-between 
        p-5 rounded-2xl bg-white shadow-md
        
        hover:shadow-2xl 
        hover:-translate-y-1 
        hover:scale-[1.02]

        transition duration-300 ease-in-out
        cursor-pointer
      "
    >
      {/* LEFT SIDE */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>

      {/* RIGHT ICON */}
      <div
        className={`
          text-3xl p-3 rounded-xl 
          ${colorMap[color] || colorMap.blue}
        `}
      >
        {icon}
      </div>
    </div>
  );
}