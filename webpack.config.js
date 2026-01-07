const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  const repoName = "se_project_spots";

  return {
    entry: {
      main: "./src/pages/index.js",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js",
      publicPath: isProd ? `/${repoName}/` : "/",
    },

    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "inline-source-map",
    stats: "errors-only",
    devServer: {
      static: path.resolve(__dirname, "./dist"),
      compress: true,
      port: 8080,
      open: true,
      liveReload: true,
      hot: false,
    },
    target: ["web", "es5"],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: "/node_modules/",
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|webp|gif|woff(2)?|eot|ttf|otf)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        favicon: "./src/images/favicon.ico",
      }),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin(),
    ],
  };
};
