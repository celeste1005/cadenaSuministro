const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'node_modules/@tremor/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#2563EB",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        background: "#F8FAFC",
        "bi-dark": "#1e2a78",
        "bi-blue": "#243c9b",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      boxShadow: {
        'kpi': '0 4px 20px rgba(0,0,0,0.05)',
        'kpi-hover': '0 12px 32px rgba(0,0,0,0.10)',
        'header': '0 1px 8px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'kpi': '18px',
      }
    },
  },
  plugins: [],
};
