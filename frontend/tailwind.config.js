/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9DFF3D',
          hover: '#8AE632',
          light: '#B2FA5B',
        },
        secondary: {
          DEFAULT: '#FF4D4D',
          hover: '#E63E3E',
          light: '#FF7373',
        },
        accent: {
          DEFAULT: '#FF4D4D',
        },
        background: {
          dark: '#050505',
          light: '#FAF9F6',
        },
        surface: {
          dark: '#121214',
          darkCard: '#18181B',
          darkBorder: '#27272A',
          light: '#FFFFFF',
          lightCard: '#FFFFFF',
          lightBorder: '#E4E4E7',
        },
        text: {
          darkPrimary: '#FFFFFF',
          darkSecondary: '#A1A1AA',
          lightPrimary: '#09090B',
          lightSecondary: '#71717A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
