module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  plugins: ["@typescript-eslint", "local"],
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:@stencil-community/recommended", // Enables @stencil-community/eslint-plugin.
    "plugin:prettier/recommended" // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    project: "./tsconfig.json",
    sourceType: "module" // Allows for the use of imports
  },
  rules: {
    "no-undef": "off", // Allows defining undefined variables

    // - - - - - - - - - - - -
    // TypeScript ESLint
    // - - - - - - - - - - - -
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { varsIgnorePattern: "^(h)$" }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto"
      }
    ],

    // - - - - - - - - - - - -
    // StencilJS
    // - - - - - - - - - - - -
    "@stencil-community/async-methods": "warn", // This rule catches Stencil public methods that are not async
    "@stencil-community/decorators-context": "warn", // This rule catches Stencil decorators in bad locations
    "@stencil-community/decorators-style": [
      "warn",
      {
        // prop: "inline", // And multiline
        state: "inline",
        element: "inline",
        method: "multiline",
        watch: "multiline",
        listen: "multiline"
      }
    ],
    "@stencil-community/element-type": "warn", // This rule catches Stencil Element decorator have the correct type
    "@stencil-community/methods-must-be-public": "warn", // This rule catches Stencil Methods marked as private or protected
    "@stencil-community/no-unused-watch": "warn", // This rule catches Stencil Watchs with non existing Props or States
    "@stencil-community/own-methods-must-be-private": "warn", // This rule catches own class methods marked as public
    "@stencil-community/own-props-must-be-private": "warn", // This rule catches own class properties marked as public
    "@stencil-community/prefer-vdom-listener": "warn", // This rule catches Stencil Listen with vdom events
    "@stencil-community/props-must-be-public": "warn", // This rule catches Stencil Props marked as private or protected
    "@stencil-community/props-must-be-readonly": "warn", // This rule catches Stencil Props marked as non readonly, excluding mutable ones
    "@stencil-community/required-jsdoc": "warn", // This rule catches Stencil Props, Methods and Events to define jsdoc
    "@stencil-community/required-prefix": ["warn", ["ch-"]], // Ensures that a Component's tag use the "ch-" prefix.
    "@stencil-community/single-export": "warn", // This rule catches modules that expose more than just the Stencil Component itself
    "@stencil-community/strict-boolean-conditions": "off",

    // WA to fix false positive errors
    "@stencil-community/strict-mutable": "warn" // This rule catches Stencil Prop marked as mutable but not changing value in code
  },
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "local/jsx-uses-my-pragma": "error", // These are needed to avoid getting a not used error with imports used in JSX
        "local/jsx-uses-vars": "error"
      }
    }
  ]
};
