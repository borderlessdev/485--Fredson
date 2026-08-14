/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gamma: {
          DEFAULT: '#0BD5BB',
          strong: '#00BFA8',
          soft: '#E8FBF8',
          pale: '#F4FCFB',
          text: '#383A3A',
          secondary: '#667173',
          muted: '#8C9698',
          bg: '#F7F9F9',
          surface: '#FFFFFF',
          border: '#E3E9E8',
          'border-strong': '#D3DCDA',
          success: '#16866F',
          warning: '#B77A18',
          danger: '#C44E56',
          info: '#39738F',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gamma: '0 1px 2px rgba(25,42,40,.05)',
        'gamma-md': '0 12px 36px rgba(25,42,40,.10)',
        'gamma-focus': '0 0 0 3px rgba(11,213,187,.16)',
      },
      borderRadius: {
        gamma: '8px',
        'gamma-card': '12px',
        'gamma-drawer': '14px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
