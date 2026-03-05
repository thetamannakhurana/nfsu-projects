/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nfsu: {
          navy: '#003366',
          blue: '#0057A8',
          lightblue: '#1a7fd4',
          gold: '#C8972A',
          amber: '#E8A820',
          white: '#FFFFFF',
          offwhite: '#F5F7FA',
          gray: '#6B7280',
          darkgray: '#374151',
          red: '#B91C1C',
        }
      },
      fontFamily: {
        heading: ['Georgia', 'Times New Roman', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'nfsu-gradient': 'linear-gradient(135deg, #003366 0%, #0057A8 50%, #1a7fd4 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C8972A 0%, #E8A820 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
