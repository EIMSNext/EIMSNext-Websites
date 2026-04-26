import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  build: {
    target: "modules",
    outDir: "dist",
    minify: "esbuild",
    cssCodeSplit: true,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [
        "vue",
        "@eimsnext/models",
        "@eimsnext/services",
        "@eimsnext/store",
        "@eimsnext/utils",
      ],
      input: ["src/index.js"],
      output: {
        compact: true,
        exports: "named",
        entryFileNames: "index.js",
      },
    },
    lib: {
      entry: "src/index.js",
      name: "formrendercore",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
  esbuild: {
    // drop: ["console", "debugger"]
  },
  plugins: [
    vue(),
    vueJsx(),
    // dts({
    //   outDir: resolve(__dirname, "./dist"),
    //   tsconfigPath: "./tsconfig.json",
    //   rollupTypes: true,
    // }),
  ],
});
