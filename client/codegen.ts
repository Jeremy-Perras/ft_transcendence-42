import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // schema: "http://localhost:3000/graphql",
  schema: "../server/src/schema.gql",
  documents: ["src/**/*.tsx"],
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: ["typescript", "typescript-operations"],
      config: {
        scalars: {
          DateTime: "string",
        },
      },
    },
  },
};
export default config;
