/**
 * Mainly used for running files through babel directly to see output.
 */
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
  ]
};
