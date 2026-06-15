/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./script.js",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#C5A367",
        forest: "#132419",
        "forest-dark": "#0b1610",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};