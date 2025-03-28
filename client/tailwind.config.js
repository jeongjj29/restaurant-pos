/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121212", // Primary background color
        surface: "#1E1E1E", // Elevated surfaces
        text: {
          primary: "#E5E7EB", // High-emphasis text
          secondary: "#9CA3AF", // Medium-emphasis text
          disabled: "#6B7280", // Disabled text
        },
        border: "#374151", // Dividers and borders
        accent: "#3B82F6", // Primary accent color
        error: "#EF4444", // Error color
        hover: "#2A2A2A", // For row or button hover states
        success: "#10B981", // green-500
        warning: "#F59E0B", // amber-500
      },
      width: {
        iconw: "100px",
      },
    },
  },
  plugins: [],
};
