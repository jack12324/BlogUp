module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    "cypress/globals": true,
  },
  extends: ["plugin:react/recommended", "airbnb", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "jest", "cypress"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-filename-extension": "off",
    "import/no-extraneous-dependencies": "off",
    "max-len": "off",
  },
};
