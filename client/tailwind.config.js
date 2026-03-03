/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0f766e",
        ink: "#0f172a",
        warm: "#f97316",
      },
    },
  },
  plugins: [],
};