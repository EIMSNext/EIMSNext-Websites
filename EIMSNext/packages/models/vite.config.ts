import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
export default defineConfig({
  build: {
    target: "modules",
    outDir: "dist",
    minify: false,
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: "./index.ts",
      name: "models",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
      },
    },
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
