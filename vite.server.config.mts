import { builtinModules } from "node:module";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  preview: {
    cors: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/index.ts"),
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    outDir: "build/server",
    copyPublicDir: false,
    rollupOptions: {
      external: [...builtinModules, /^node:/],
    },
  },
});
