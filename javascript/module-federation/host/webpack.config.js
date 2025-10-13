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
    port: 3000,
    historyApiFallback: true
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
      name: "host",
      remotes: {
        // aponta para o remoteEntry do remote1
        remote1: "remote1@http://localhost:3001/remoteEntry.js"
      },
      shared: {}
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ]
};
