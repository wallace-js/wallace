module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
      },
    ],
  ],
};
