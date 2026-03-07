/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        display: ['Michroma', 'sans-serif'],
      },
      colors: {
        brand: {
          400: '#5cea4e',
          500: '#2ADD1B',
          600: '#22b515',
          800: '#187a10',
          900: '#104f0b',
          glow: 'rgba(42, 221, 27, 0.15)',
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'border-spin': 'borderSpin 3s linear infinite',
        'shimmer': 'shimmer 4s linear infinite',
        'text-shine': 'textShine 6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
        },
        borderSpin: {
          'to': { '--gradient-angle': '360deg' },
        },
        shimmer: {
          'to': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        textShine: {
          'to': { 'background-position': '-200% center' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(42, 221, 27, 0.4)',
        'glow-brand': '0 0 15px rgba(42, 221, 27, 0.3)',
      },
    },
  },
  plugins: [],
}
