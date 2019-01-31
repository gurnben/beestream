const webpack = require('webpack');
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
	plugins: [],
	mode: `${((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'production')) ? process.env.NODE_ENV : 'development'}`
};
