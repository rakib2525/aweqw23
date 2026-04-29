/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  
  safelist: [
    "bg-blue-100", "text-blue-600",
    "bg-purple-100", "text-purple-600",
    "bg-yellow-100", "text-yellow-600",
    "bg-green-100", "text-green-600",
    "bg-emerald-100", "text-emerald-600"
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}