/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', '"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'bg-base': '#050810',
        'bg-mid': '#0a0f1e',
        'aurora-1': '#0d47a1',
        'aurora-2': '#1a237e',
        'aurora-3': '#00acc1',
        'aurora-4': '#4a148c',
        'accent-primary': '#00e5ff',
        'accent-secondary': '#7c4dff',
        'accent-warm': '#ff6d00',
        'text-primary': '#f0f4ff',
      },
      animation: {
        'aurora-1': 'aurora1 25s ease-in-out infinite',
        'aurora-2': 'aurora2 32s ease-in-out infinite',
        'aurora-3': 'aurora3 20s ease-in-out infinite',
        'particle-drift': 'particleDrift 8s linear infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'count-up': 'countUp 1.5s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        swing: 'swing 0.5s ease-in-out',
        shake: 'shake 0.4s ease-in-out',
      },
      keyframes: {
        aurora1: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(5%, -8%) scale(1.1)' },
          '66%': { transform: 'translate(-3%, 5%) scale(0.95)' },
        },
        aurora2: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(-8%, 10%) scale(1.15)' },
        },
        aurora3: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(10%, 5%) scale(0.9)' },
          '66%': { transform: 'translate(-5%, -8%) scale(1.05)' },
        },
        particleDrift: {
          '0%': { transform: 'translateY(0px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh)', opacity: '0' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        swing: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-15deg)' },
          '75%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
