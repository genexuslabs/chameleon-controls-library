module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin,
    "eslint:recommended", // Uses the recommended rules from the eslint,
    "plugin:@stencil/recommended",
    "plugin:prettier/recommended" // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    project: "./tsconfig.json",
    sourceType: "module" // Allows for the use of imports
  },
  rules: {
    "no-unused-vars": "off",
    "no-undef": "off", // Allows defining undefined variables
    "@typescript-eslint/no-use-before-define": ["warn", { functions: false }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto"
      }
    ],

    "@stencil/async-methods": "warn", // This rule catches Stencil public methods that are not async
    "@stencil/decorators-context": "warn", // This rule catches Stencil decorators in bad locations
    "@stencil/decorators-style": [
      "warn",
      {
        prop: "inline",
        state: "inline",
        element: "inline",
        method: "multiline",
        watch: "multiline",
        listen: "multiline"
      }
    ],
    "@stencil/element-type": "warn", // This rule catches Stencil public methods that are not async
    "@stencil/methods-must-be-public": "warn", // This rule catches Stencil Methods marked as private or protected
    "@stencil/no-unused-watch": "warn", // This rule catches Stencil Watchs with non existing Props or States
    "@stencil/own-methods-must-be-private": "warn", // This rule catches own class methods marked as public
    "@stencil/own-props-must-be-private": "warn", // This rule catches own class properties marked as public
    "@stencil/prefer-vdom-listener": "warn", // This rule catches Stencil Listen with vdom events
    "@stencil/props-must-be-public": "warn", // This rule catches Stencil Props marked as private or protected
    "@stencil/props-must-be-readonly": "warn", // This rule catches Stencil Props marked as non readonly, excluding mutable ones
    "@stencil/required-jsdoc": "warn", // This rule catches Stencil Props, Methods and Events to define jsdoc
    "@stencil/required-prefix": ["warn", ["ch-"]], // Ensures that a Component's tag use the "ch-" prefix.
    "@stencil/single-export": "warn", // This rule catches modules that expose more than just the Stencil Component itself
    "@stencil/strict-boolean-conditions": "off",
    "@stencil/strict-mutable": "off" // This rule catches Stencil Prop marked as mutable but not changing value in code
  }
};
