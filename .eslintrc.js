module.exports = {
  root: true,
  rules: {
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    camelcase: [
      'error'
    ],
    'id-denylist': 'off',
    'id-length': 'off',
    'no-param-reassign': 'off',
  },
  ignorePatterns: ['!.eslintrc.js', 'test/*.js', 'dist', 'scripts'],
};
