/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maity: "#3B2D82",
        maityDark: "#2B1F6C",
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
