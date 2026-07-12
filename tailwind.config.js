/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        secondary: '#f1f3f4',
        success: '#34a853',
        danger: '#ea4335',
        warning: '#fbbc04',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}
