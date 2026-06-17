/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './partials/*.html'],
  theme: {
    extend: {
      colors: {
        'dark-navy':    '#0E1825',
        'arctic-navy':  '#1E2A39',
        'steel-blue':   '#5C7386',
        'glacier-blue': '#9DB4C6',
        'silver-mist':  '#D6DEE6',
        'ice-white':    '#F5F8FA',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        '6xl': '72rem',
      },
    },
  },
  plugins: [],
}
