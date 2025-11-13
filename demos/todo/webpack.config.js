const path = require("path");

const config = {
  entry: "./src/index.tsx",
  devServer: {
    static: "./",
    hot: true,
    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        /* 
        Ensures we process the wallace package, but not others in node_modules.
        Note that this will not take effect if your babel config is in
        package.json or .babelrc - it must be in here or in babel.config.cjs
        */
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
            loader: "babel-loader",
            // options: {
            //   presets: ["@babel/preset-env"],
            // },
          },
        ],
      },
    ],
  },
};

module.exports = function () {
  config.mode = process.env.NODE_ENV || "development";
  if (config.mode === "production") {
    config.optimization = {
      minimize: true,
    };
  } else {
    config.devtool = "eval-source-map";
    // config.devtool = "inline-source-map";
  }
  return config;
};
