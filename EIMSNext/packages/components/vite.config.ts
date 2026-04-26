import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import DefineOptions from "unplugin-vue-define-options/vite";

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
        "element-plus",
        "lodash",
        "@element-plus/icons-vue",
        "@eimsnext/utils",
        "@eimsnext/models",
        "@eimsnext/services",
        "@eimsnext/store",
      ],
      input: ["index.ts"],
      output: {
        compact: true,
        exports: "named",
        entryFileNames: "index.js",
      },
    },
    lib: {
      entry: "./src/index.ts",
      name: "components",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
  //TODO: 正式发布时需要移除 调试与输出
  // esbuild: {
  //   drop: ["console", "debugger"]
  // },
  plugins: [
    vue(),
    DefineOptions(),
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
