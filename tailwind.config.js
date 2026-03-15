/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "brockmann-medium": ["Brockmann-Medium"],
        "integral-bold": ["integralcf-bold"],
      },
      colors: {
        "brand-purple": {
          50: "#f9e6ff",
          100: "#f2ccff",
          200: "#e599ff",
          300: "#d966ff",
          400: "#cc33ff",
          500: "#bf00ff",
          600: "#9900cc",
          700: "#730099",
          800: "#4c0066",
          900: "#260033",
          950: "#130019",
        },
      },
    },
  },
  plugins: [],
};
