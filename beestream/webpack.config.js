const webpack = require('webpack');
<<<<<<< HEAD
const TerserPlugin = require('terser-webpack-plugin');
=======
>>>>>>> d032f7f6bea05550771ac8885eae3e6c1754a71c
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
				use: [ 'style-loader', 'css-loader' ]
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
<<<<<<< HEAD
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true
			})
		]
	},
=======
>>>>>>> d032f7f6bea05550771ac8885eae3e6c1754a71c
	mode: `${((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'production')) ? process.env.NODE_ENV : 'development'}`
};
