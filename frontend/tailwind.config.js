/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        orange: {
          50: '#fffcf7',
          100: '#ffeeda',
          200: '#ffdcb4',
          300: '#ffc181',
          400: '#ffa04e',
          500: '#fc8019', // Swiggy Orange
          600: '#e16b0d',
          700: '#bc5207',
          800: '#953f04',
          900: '#7a3203',
        },
      },
    },
  },
  plugins: [],
};
