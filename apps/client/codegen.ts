import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/graphql",
  documents: "./src/graphql/*.graphql",
  hooks: { afterAllFileWrite: ["npx prettier -w"] },
  generates: {
    "./src/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
      ],
      config: {
        fetcher: {
          endpoint: "http://localhost:3000/graphql",
          fetchParams: {
            headers: {
              "Content-Type": "application/json",
            },
          },
        },
      },
    },
  },
};
export default config;
