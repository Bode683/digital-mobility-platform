module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@/src': './src',
            '@/features': './src/features',
            '@/assets': './assets',
            '@/components': ['./src/components', './components'],
            '@/constants': ['./src/constants', './constants'],
            '@/hooks': './src/hooks',
            '@/lib': ['./src/lib', './lib'],
            '@/api': './src/api',
            '@/context': './src/context',
            '@/app': './app',
          },
        },
      ],
    ],
  };
};
