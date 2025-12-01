module.exports = {
  roots: ["./tests"],
  testEnvironment: "jest-fixed-jsdom",
  testTimeout: 10 * 1000,
  reporters: ["default", "jest-summary-reporter"],
  testPathIgnorePatterns: ["/node_modules/", "/old/", "/tests/utils.js"],
  workerIdleMemoryLimit: "500K",
  transform: {
    "\\.[jt]sx?$": [
      "babel-jest",
      {
        configFile: "./test.babel.config.cjs"
      }
    ]
  }
};
