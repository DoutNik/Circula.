module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  overrides: [
    {
      files: ['public/**/*Worker.js', 'public/firebase-messaging-sw.js'],
      env: { browser: true, serviceworker: true },
      globals: { importScripts: 'readonly', firebase: 'readonly' },
    },
  ],
  rules: {
    // El proyecto es JavaScript sin runtime type-checking; mantener esta regla
    // activa requeriría introducir PropTypes en todos los componentes sin
    // aportar cobertura real. Las validaciones de datos viven en la API.
    'react/prop-types': 'off',
    'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
