module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22d47b', // green accent
        },
        gradientStart: '#23395d', // blue
        gradientEnd: '#5f3cbb', // purple
      },
      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          'Arial',
          'Helvetica',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
