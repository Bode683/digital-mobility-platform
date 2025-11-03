// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
        },
      },
    },
  },
]);
