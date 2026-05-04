/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"], // This makes sure Tailwind sees your HTML and your Script
  theme: {
    extend: {
      colors: {
        'gold': '#C5A367',        // Dudley's Signature Gold
        'forest': '#132419',      // Deep modern green
        'forest-dark': '#0b1610', // Darker green for sections
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}