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
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e40af', // Blue brand
          600: '#1d4ed8',
          700: '#1e3a8a',
          orange: '#f97316', // Chốt lương orange accent
          dark: '#0f172a',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 60%)',
        'radial-brand': 'radial-gradient(circle at 50% 20%, #1e40af 0%, #1e1b4b 45%, #0f172a 80%, #020617 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #c2410c 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1e40af 0%, #4338ca 50%, #312e81 100%)',
      }
    },
  },
  plugins: [],
}

