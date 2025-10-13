const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true
  },
  devServer: {
    port: 3001,
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" }
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "remote1",
      filename: "remoteEntry.js",
      exposes: {
        "./math": "./src/math.ts"
      },
      shared: {}
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ]
};
