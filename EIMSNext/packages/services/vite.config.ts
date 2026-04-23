import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "modules",
    outDir: "dist",
    minify: "esbuild",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: ["vue", "@eimsnext/utils", "@eimsnext/models"],
      input: ["index.ts"],
      output: {
        compact: true,
        exports: "named",
        entryFileNames: "index.js",
      },
    },

    lib: {
      entry: "./index.ts",
      name: "services",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
    keepNames: true,
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
