/** @type {import('tailwindcss').Config} */
// basic_02 — Minimal & Modern: beyaz zemin, koyu metin, amber vurgu
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#ffffff",
        sand: "#f4f4f5",
        coffee: "#18181b",
        terra: "#d97706",
        terradark: "#b45309",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
