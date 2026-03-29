module.exports = (options, webpack) => {
  return {
    ...options,
    entry: {
      main: options.entry,
      serverless: './src/serverless.ts',
    },
    output: {
      ...options.output,
      filename: '[name].js',
      libraryTarget: 'commonjs2',
    },
  };
};
