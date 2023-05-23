const production = !process.env.ROLLUP_WATCH;

module.exports = {
  content: ['./public/index.html', './src/**/*.svelte'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('@catppuccin/tailwindcss')({
      prefix: 'ctp',
      defaultFlavour: 'mocha'
    }),
  ],
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
};
