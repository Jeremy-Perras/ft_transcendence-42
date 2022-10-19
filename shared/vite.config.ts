import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "main.ts"),
      name: "shared",
      fileName: "shared",
    },
  },
  plugins: [dts()],
});
