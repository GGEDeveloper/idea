/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        secondary: '#1f2937', // gray-800
        'text-base': '#1f2937', // gray-800
        'text-alt': '#374151', // gray-700
        'text-muted': '#6b7280', // gray-500
        'bg-base': '#f9fafb', // gray-50
        'bg-alt': '#ffffff', // white
        'border-base': '#e5e7eb', // gray-200
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
};
