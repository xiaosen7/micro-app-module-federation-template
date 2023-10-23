module.exports = require("eslint-define-config").defineConfig({
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["react", "@typescript-eslint", "react-hooks", "unused-imports"],
  parser: "@typescript-eslint/parser",
  rules: {
    complexity: ["error", 30],
    "no-duplicate-imports": "off",

    // react
    "react/react-in-jsx-scope": "off",

    // ts
    "@typescript-eslint/no-explicit-any": ["error"],
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { disallowTypeAnnotations: false },
    ],
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: "variable",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: ["function"],
        format: ["camelCase", "PascalCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: ["class"],
        format: ["PascalCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: ["classProperty"],
        format: ["PascalCase", "camelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: ["interface"],
        format: ["PascalCase"],
        prefix: ["I"],
      },
      {
        selector: ["enum"],
        format: ["PascalCase"],
        prefix: ["E"],
      },
      {
        selector: ["enumMember"],
        format: ["PascalCase", "camelCase"],
      },
    ],

    // unused-imports
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    // import
    "import/no-unresolved": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "unknown",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "react-dom/**",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "antd",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "@micro/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@apps/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@shared/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
            position: "before",
          },
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
});
