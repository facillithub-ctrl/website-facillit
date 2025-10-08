import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'royal-blue': '#2e14ed', // azul violeta elétrico
        'dark-purple-blue': '#190894', // azul roxo escuro
        'lavender-blue': '#5e55f9', // azul lavanda
        'light-lavender': '#dfdefe', // lavanda clara
        'light-gray': '#e0e0e2', // cinza claro
        'graphite-black': '#111114', // preto grafite
        'dark-text': '#111114',
        'white-text': '#f8f9fa',
        'white': '#ffffff',
        'background-light': '#e0e0e2',
        'text-muted': '#555',
        'dark-background': '#111114',
        'dark-card': '#1A1A1D',
        'dark-border': '#2c2c31',
        'dark-text-muted': '#a0a0a0',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config