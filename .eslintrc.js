module.exports = {
  parser: "babel-eslint",
  extends: ["standard", "prettier", "plugin:react/recommended"],
  plugins: ["jest", "babel", "react"],
  parserOptions: {
    ecmaVersion: 9
  },
  env: {
    "jest/globals": true
  }
};
