import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
// import commonjs from "@rollup/plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/graphql": "http://localhost:3000",
      "^/auth/.*": "http://localhost:3000",
      "^/upload/.*": "http://localhost:3000",
      "/socket.io": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
  // define: { "process.env.NODE_ENV": '"production"' },
  build: {
    sourcemap: true,
    // commonjsOptions: {
    //   requireReturnsDefault: "auto",
    // },
  },
  plugins: [
    react(),
    svgr({
      include: "../node_modules/**/*.svg",
    }),
    // commonjs(),
  ],
});
