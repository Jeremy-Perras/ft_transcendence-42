import { defineConfig } from "vite";
import path from "path";
import typescript from "@rollup/plugin-typescript";

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
  build: {
    lib: {
      entry: resolvePath("./src/index.ts"),
      name: "index",
      fileName: "index",
    },
    rollupOptions: {
      cache: false,
      plugins: [
        typescript({
          target: "es2020",
          rootDir: resolvePath("./src"),
          declaration: true,
          exclude: resolvePath("../node_modules/**"),
          allowSyntheticDefaultImports: true,
        }),
      ],
    },
  },
});
