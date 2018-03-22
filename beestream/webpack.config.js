const webpack = require('webpack');

module.exports = {
	entry: {
    polyfills: './public/polyfills.ts',
    vendor: './public/vendor.ts',
    bootstrap: './public/bootstrap.ts',
    app: './public/app/app.module.ts'
	},
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
	output: {
		path: '/home/gurnben/Projects/beestream/beestream/public/build',
		filename: '[name].js',
	},
	module: {
		rules: [{
			test: /\.ts$/,
			use: ['awesome-typescript-loader']
		}]
	},
	plugins: [],
  mode: 'development'
};
