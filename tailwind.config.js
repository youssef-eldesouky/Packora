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
          50: '#f0f4ff',
          100: '#dce8ff',
          200: '#bdd2ff',
          300: '#90b3ff',
          400: '#5f8aff',
          500: '#3563fa',
          600: '#1e46ef',
          700: '#1633dc',
          800: '#182bb2',
          900: '#1a2b8c',
          950: '#141c5e',
        },
        surface: {
          900: '#0f1117',
          800: '#161b27',
          700: '#1e2535',
          600: '#252d3f',
          500: '#2d3650',
          400: '#3c4a68',
        },
        accent: '#5f8aff',
      }
    },
  },
  plugins: [],
}
