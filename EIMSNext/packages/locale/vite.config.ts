import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import DefineOptions from "unplugin-vue-define-options/vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "modules",
    outDir: "dist",
    minify: "esbuild",
    cssCodeSplit: true,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: ["src/index.ts"],
      output: {
        compact: true,
        exports: "named",
        entryFileNames: "index.js",
      },
    },
    lib: {
      entry: "src/index.ts",
      name: "locale",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  plugins: [
    vue(),
    DefineOptions(),
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
