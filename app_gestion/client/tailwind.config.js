/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "navy-sider": "#1a2f4a",
        "navy-trigger": "#2d4563",
        "navy-sub": "#3d5577",
        "brand-primary": "#10b981",
      },
    },
  },
  plugins: [],
};
