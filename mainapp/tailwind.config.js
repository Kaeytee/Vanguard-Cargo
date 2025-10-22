/** @type {import('tailwindcss').Config} */
export default {
content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      fontFamily: {
        // Use the CSS variable so the font stack can be changed at runtime via --font-sans
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
}