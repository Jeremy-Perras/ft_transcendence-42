module.export = {
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
  ],
  plugins: ["react", "react-hooks"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      processor: "@graphql-eslint/graphql",
    },
    {
      files: ["*.graphql"],
      extends: "plugin:@graphql-eslint/operations-recommended",
      rules: {
        "@graphql-eslint/known-type-names": "error",
        "prettier/prettier": "error",
      },
      parserOptions: {
        schema: "http://localhost:3000/graphql", // TODO use env variable
      },
    },
  ],
};
