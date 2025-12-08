const path = require("path");

const config = {
  entry: "./src/index.jsx",
  devServer: {
    static: "./",
    hot: true,
    historyApiFallback: true
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        /*
        Ensures we process the wallace package, but not others in node_modules.
        Note that this will not take effect if your babel config is in
        package.json or .babelrc - it must be in here or in babel.config.cjs,
        and the latter is better as it allos you to inspect files by running them
        through `npx babel` in the terminal.
        */
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
  } else {
    config.devtool = "eval-source-map";
    // config.devtool = "inline-source-map";
  }
  return config;
};
