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
        scalars: {
          Timestamp: "number",
        },
        exposeQueryKeys: true,
        exposeFetcher: true,
        fetcher: {
          endpoint: "http://localhost:5173/graphql",
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
