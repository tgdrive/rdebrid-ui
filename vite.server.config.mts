import { builtinModules } from "node:module";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: ["server/deno.ts"],
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "build/server",
    copyPublicDir: false,
    rollupOptions: {
      external: [...builtinModules, /^node:/],
    },
  },
});
