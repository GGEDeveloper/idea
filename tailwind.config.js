/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        'text-base': 'var(--color-text-base)',
        'text-muted': 'var(--color-text-muted)',
        'bg-base': 'var(--color-bg-base)',
        'bg-alt': 'var(--color-bg-alt)',
        'border-base': 'var(--color-border-base)',
      },
    },
  },
  plugins: [],
};
