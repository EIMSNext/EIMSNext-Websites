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
    rollupOptions: {
      external: ["@univerjs/core", "@univerjs/engine-render"],
      output: {
        entryFileNames: "index.js",
      },
    },
    lib: {
      entry: "./index.ts",
      name: "printPlugins",
      formats: ["es"],
      fileName: () => "index.js",
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
