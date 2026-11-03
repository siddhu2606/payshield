/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#00E5A3",
          dark: "#080C14",
          card: "#0F172A",
          purple: "#A78BFA",
          held: "#FF4D6D"
        }
      }
    },
  },
  plugins: [],
}
