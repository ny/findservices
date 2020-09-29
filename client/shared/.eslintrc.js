const path = require("path");

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2017: true,
    jest: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true,
    },
    ecmaVersion: 2019,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
        moduleDirectory: ["node_modules", "src"],
      },
    },
  },
  plugins: [
    "i18next",
    "i18n-json",
    "import",
    "jest",
    "jsx-a11y",
    "react",
    "react-hooks",
  ],
  extends: [
    "react-app",
    "eslint:recommended",
    "plugin:i18n-json/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/react",
  ],
  rules: {
    // Compare each translation file's key structure with a reference
    // translation file to ensure consistency. Useful once the product is a bit
    // more mature and we're actively translating.
    "i18n-json/identical-keys": [
      0,
      {
        filePath: path.resolve("./public/locales/en/translation.json"),
      },
    ],
    // Default ICU Message syntax validation (using intl-messageformat-parser).
    // Unfortunately i18next doesn't use this syntax by default, so this rule
    // doesn't help us right now.
    "i18n-json/valid-message-syntax": [0],
    // Avoid developers to display literal string to users in those projects
    // which need to support multi-language.
    "i18next/no-literal-string": [
      2,
      {
        onlyAttribute: ["aria-label", "alt", "placeholder"],
      },
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  root: true,
};
