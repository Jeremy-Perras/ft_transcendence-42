import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/graphql", // TODO: use env var
  documents: ["src/**/*.tsx"],
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: ["typescript", "typescript-operations"],
      config: {
        scalars: {
          Timestamp: "number",
        },
      },
    },
  },
};
export default config;
