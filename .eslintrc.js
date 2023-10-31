module.exports = {
  plugins: [
    "@typescript-eslint",
    "node",
    "prettier"
  ],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "./tsconfig.json"
  },
  rules: {
    "quotes": ["error", "single", { "avoidEscape": true }],
    "eqeqeq": [
      "error",
      "smart"
    ],
    "prefer-rest-params": "off",
    "no-console": "error",
    "no-process-env": "error",
    "node/no-deprecated-api": ["warn"],
    'prettier/prettier': [
      'error',
      {
        arrowParens: 'avoid',
        printWidth: 120,
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'none',
        bracketSpacing: true,
        parser: 'typescript'
      }
    ]
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "memberLike",
            "modifiers": ["private", "protected"],
            "format": ["camelCase"],
            "leadingUnderscore": "require"
          }
        ],
        "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_", "args": "after-used"}],
        "@typescript-eslint/no-inferrable-types": ["error", { ignoreProperties: true }],
        "@typescript-eslint/no-empty-function": ["off"],
        "@typescript-eslint/ban-types": ["warn", {
          "types": {
            "Function": null,
          }
        }],
        "@typescript-eslint/no-shadow": ["warn"],
      }
    },
    {
      files: ["test/**/*.ts"],
      rules: {
        "no-empty": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-shadow": ["off"],
        "@typescript-eslint/no-floating-promises": ["off"],
        "@typescript-eslint/no-non-null-assertion": ["off"],
        "@typescript-eslint/explicit-module-boundary-types": ["off"]
      }
    }
  ]
};
