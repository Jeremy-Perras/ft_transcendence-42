import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

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
  plugins: [
    react(),
    svgr({
      include: "../node_modules/**/*.svg",
    }),
  ],
});
