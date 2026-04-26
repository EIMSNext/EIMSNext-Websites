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
      external: [
        "vue",
        "CodeMirror",
        "v-jsoneditor",
        "element-plus",
        "@element-plus/icons-vue",
        "wangeditor",
        "@eimsnext/form-render-core",
        "@eimsnext/form-render-elplus",
        "@eimsnext/form-render-vant",
        "@eimsnext/form-designer",
        "@eimsnext/form-designer/dist/index.css",
        "@eimsnext/components",
        "@eimsnext/models",
        "@eimsnext/services",
        "@eimsnext/store",
        "@eimsnext/utils",
      ],
      input: ["src/index.ts"],
      output: {
        compact: true,
        exports: "named",
        entryFileNames: "index.js",
      },
    },
    lib: {
      entry: "src/index.ts",
      name: "formbuilder",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
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
});
