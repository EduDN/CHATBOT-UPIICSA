import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   proxy: {
  //     "/*": {
  //       target: "http://localhost:5173",
  //       changeOrigin: true,
  //     },
  //   },
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST", "PUT", "DELETE"],
  //     allowedHeaders: ["Content-Type", "Authorization"],
  //     credentials: true,
  //   },
  // },
});
