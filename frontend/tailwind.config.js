module.exports = {
  purge: ['./src/**/*.{html,ts}'],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Use Montserrat as the primary font
      },
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#ffed4a',
      },
      boxShadow: {
        '2xl': '0 10px 20px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      },
      borderRadius: {
        'custom': '0px 30px 30px 0px',
      },
      colors: {
        'custom-bg': '#f3f4f6',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
