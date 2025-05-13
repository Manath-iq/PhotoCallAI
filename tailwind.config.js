/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00b96b',
        'primary-dark': '#008148',
        'primary-light': '#4cdf9b',
        'secondary': '#4caf50',
        'light-bg': '#f0f9f4',
        'dark-green': '#005a32',
        'accent': '#009f5f',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'btn': '0 2px 4px rgba(0, 185, 107, 0.2)',
      },
    },
  },
  plugins: [],
  // Добавляем поддержку для антд классов
  corePlugins: {
    preflight: false, // Отключаем preflight, чтобы не конфликтовать с Ant Design
  },
} 