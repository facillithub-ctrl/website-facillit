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
        'royal-blue': '#2E14ED',
        'dark-text': '#212529',
        'white-text': '#f8f9fa',
        'white': '#ffffff',
        'header-border': '#e0e0e0',
        'card-bg': '#ffffff',
        'card-border': '#e9ecef',
        'card-hover-shadow': 'rgba(46, 20, 237, 0.1)',
        'background-light': '#f0f2f5',
        'text-muted': '#555',
        // Cores aprimoradas para Dark Mode
        'dark-background': '#121212',
        'dark-card': '#1E1E1E',
        'dark-border': '#2f2f2f',
        'dark-text-muted': '#a0a0a0',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config