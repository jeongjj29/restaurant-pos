/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        surface: "#1E1E1E",
        text: {
          primary: "#E5E7EB",
          secondary: "#9CA3AF",
        },
        border: "#374151",
      },
      width: {
        iconw: "100px",
      },
    },
  },
  plugins: [],
};
