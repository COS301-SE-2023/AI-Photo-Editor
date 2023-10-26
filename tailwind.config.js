const production = !process.env.ROLLUP_WATCH;

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

module.exports = {
  content: ["./public/index.html", "./src/**/*.svelte"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: withOpacity("--color-primary-50"),
          100: withOpacity("--color-primary-100"),
          200: withOpacity("--color-primary-200"),
          300: withOpacity("--color-primary-300"),
          400: withOpacity("--color-primary-400"),
          500: withOpacity("--color-primary-500"),
          600: withOpacity("--color-primary-600"),
          700: withOpacity("--color-primary-700"),
          800: withOpacity("--color-primary-800"),
          900: withOpacity("--color-primary-900"),
          950: withOpacity("--color-primary-950"),
        },
      },
    },
  },
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
};
