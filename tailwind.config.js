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
        navy: {
          50: '#eef3ff',
          100: '#d9e4ff',
          800: '#1a2a4a',
          900: '#0f1e3d',
        },
        brand: {
          blue: '#1a4fc4',
          green: '#5aaa28',
          orange: '#e07a00',
          pink: '#be185d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
