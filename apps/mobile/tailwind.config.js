/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        glacier: {
          primary: "#32B2CB",
          primaryDark: "#1F9DB7",
          primaryLight: "#8EDBE6",
          soft: "#DDF5F8",
          background: "#F7FBFD",
          card: "#FFFFFF",
          cardSoft: "#F1FAFC",
          textPrimary: "#0F172A",
          textSecondary: "#64748B",
          textMuted: "#94A3B8",
          border: "#E6EEF3",
          success: "#14B8A6",
          warning: "#F59E0B",
          error: "#EF4444"
        }
      }
    }
  },
  plugins: []
};
