const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
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
				use: [ 'html-loader' ]
			}
		]
	},
	plugins: [
		new UglifyJsPlugin(),
		new webpack.ContextReplacementPlugin(
			// The (\\|\/) piece accounts for path separators in *nix and Windows
			/angular(\\|\/)core/,
			path.join(__dirname, 'public'), // location of your src
			{ }
		)
	],
	mode: `${((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'production')) ? process.env.NODE_ENV : 'development'}`
};
