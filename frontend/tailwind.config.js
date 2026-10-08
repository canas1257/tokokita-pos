/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { ink: '#17211f', canvas: '#f4f6f5', brand: { 50: '#effcf8', 100: '#d7f8ed', 500: '#159276', 600: '#0f766e', 700: '#115e59', 900: '#134e4a' } }, boxShadow: { panel: '0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.05)' } } },
  plugins: []
};
