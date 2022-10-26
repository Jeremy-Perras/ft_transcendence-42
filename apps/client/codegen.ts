import { CodegenConfig } from "@graphql-codegen/cli";

// const config: CodegenConfig = {
//   schema: "http://localhost:3000/graphql",
//   documents: ["src/**/*.tsx"],
//   ignoreNoDocuments: true,
//   generates: {
//     "./src/gql/": {
//       preset: "client",
//       plugins: ["typescript", "typescript-operations"],
//     },
//   },
// };

const config: CodegenConfig = {
  schema: "../server/src/schema.gql",
  documents: "./src/graphql/*.graphql",
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
        // fetcher: "graphql-request",
      },
    },
  },
};
export default config;
