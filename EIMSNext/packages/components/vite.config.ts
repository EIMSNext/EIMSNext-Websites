import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import DefineOptions from "unplugin-vue-define-options/vite";

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
      //忽略打包vue文件
      external: [
        "vue",
        "element-plus",
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
        // 为不同格式生成相应的全局变量
        globals: {
          vue: "vue",
          "element-plus": "element-plus",
          "@element-plus/icons-vue": "@element-plus/icons-vue",
          "@eimsnext/utils": "@eimsnext/utils",
          "@eimsnext/models": "@eimsnext/models",
          "@eimsnext/services": "@eimsnext/services",
          "@eimsnext/store": "@eimsnext/store",
        },
      },
    },
    lib: {
      entry: "./src/index.ts",
      name: "components",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
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
