/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Color 1: Warm Ivory
        ivory: {
          light: "#FAF8F5",
          DEFAULT: "#EAE6DE",
          border: "#DAD3C6",
          dark: "#5B5245",
        },
        // Color 2: Deep Editorial Blue
        editorial: {
          light: "#3884BE",
          DEFAULT: "#226192",
          dark: "#133857",
          soft: "#E9F2F8",
        },
        // Color 3: Sage Green
        sage: {
          light: "#C3CFAB",
          DEFAULT: "#A9B887",
          dark: "#6F804F",
          soft: "#F1F5EB",
        },
        brand: {
          50: "#FAF8F5",
          100: "#EAE6DE",
          200: "#DAD3C6",
          500: "#226192",
          600: "#1B4F77",
          700: "#133857",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      }
    },
  },
  plugins: [],
}
