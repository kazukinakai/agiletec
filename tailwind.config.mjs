/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Agile Technology brand colors (斜線用カラーパレット)
        primary: {
          blue: '#3B82F6',
          red: '#EF4444', 
          green: '#10B981',
          yellow: '#F59E0B',
          orange: '#F97316',
        }
      },
      animation: {
        'diagonal-move': 'diagonal-move 20s linear infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.8s ease-out',
      },
      keyframes: {
        'diagonal-move': {
          '0%': { transform: 'translate3d(-100px, -100px, 0)' },
          '100%': { transform: 'translate3d(100vw, 100vh, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
