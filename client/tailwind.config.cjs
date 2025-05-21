/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#FF6EC7',
        'neon-blue': '#00ffff',
        'neon-purple': '#b026ff',
        'cyber-black': '#0d0d0d',
        'cyber-gray': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
