const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'index.ts'),
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'tabtalk.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    }
};