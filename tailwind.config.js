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
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        "fg-muted": "rgb(var(--fg-muted) / <alpha-value>)",
        outline: "rgb(var(--outline) / <alpha-value>)",
        "outline-subtle": "rgb(var(--outline-subtle) / <alpha-value>)",
        "outline-strong": "rgb(var(--outline-strong) / <alpha-value>)",
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
