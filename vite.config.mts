import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      quoteStyle: "double",
    }),
    tsconfigPaths(),
    Icons({
      compiler: "jsx",
      jsx: "react",
      iconCustomizer(_1, _2, props) {
        props.width = "1.5rem";
        props.height = "1.5rem";
        props.className = "pointer-events-none";
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5174",
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
});
