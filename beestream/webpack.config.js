const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
	entry: {
    polyfills: './public/polyfills.ts',
    bootstrap: './public/bootstrap.ts'
	},
  resolve: {
    extensions: ['.ts', '.js', '.json', '.html']
  },
	output: {
		path: path.join(path.join(__dirname, 'public'), 'build'),
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: ['ts-loader']
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
				include: [
					path.resolve('public/app/c3.styles.css'),
					path.resolve('public/app/style.css'),
					path.resolve('public/app/weather-icons.css')
				]
			},
			{
				test: /\.html$/,
				use: [ {
					loader: 'html-loader',
					options: {
						caseSensitive: true
					}
				} ]
			}
		]
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true
			})
		]
	},
	mode: `${((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'production')) ? process.env.NODE_ENV : 'development'}`
};
