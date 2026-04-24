/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        km: {
          green: "#1D9E75",
          "green-dark": "#0F6E56",
          "green-darker": "#085041",
          "green-light": "#E1F5EE",
          amber: "#BA7517",
          "amber-light": "#FAEEDA",
          red: "#A32D2D",
          "red-light": "#FCEBEB",
          gray: "#888780",
          "gray-light": "#F1EFE8",
        }
      }
    },
  },
  plugins: [],
}
