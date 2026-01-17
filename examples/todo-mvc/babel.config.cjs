module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          useControllers: true,
          useStubs: true,
          useMethods: true
        }
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        modules: false
      }
    ]
  ]
};
