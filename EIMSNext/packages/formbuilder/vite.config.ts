import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import DefineOptions from "unplugin-vue-define-options/vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "modules",
    //打包文件目录
    outDir: "dist",
    //压缩
    minify: true,
    //css分离
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
        globals: {
          vue: "vue",
          CodeMirror: "CodeMirror",
          "v-jsoneditor": "v-jsoneditor",
          "element-plus": "element-plus",
          "@element-plus/icons-vue": "@element-plus/icons-vue",
          wangeditor: "wangeditor",
          "@eimsnext/form-render-core": "@eimsnext/form-render-core",
          "@eimsnext/form-render-elplus": "@eimsnext/form-render-elplus",
          "@eimsnext/form-render-vant": "@eimsnext/form-render-vant",
          "@eimsnext/form-designer": "@eimsnext/form-designer",
          "@eimsnext/components": "@eimsnext/components",
          "@eimsnext/models": "@eimsnext/models",
          "@eimsnext/services": "@eimsnext/services",
          "@eimsnext/store": "@eimsnext/store",
          "@eimsnext/utils": "@eimsnext/utils",
        },
      },
    },
    lib: {
      entry: "src/index.ts",
      name: "formbuilder",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
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
