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
          useMethods: true,
          useParts: true,
          useStubs: true
        }
      }
    ],
    "@babel/plugin-syntax-jsx"
  ]
};
