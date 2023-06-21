const rules = require("./webpack.rules");

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "postcss-loader" },
  ],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  target: "electron-renderer",
  externals: {
    electron: "commonjs electron",
  },
};
