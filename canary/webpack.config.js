const path = require("path");

const config = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  }
};

module.exports = function () {
  config.mode = process.env.NODE_ENV || "development";
  if (config.mode === "production") {
    config.optimization = {
      minimize: true
    };
  }
  return config;
};
