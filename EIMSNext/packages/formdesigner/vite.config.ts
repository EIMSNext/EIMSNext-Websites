import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vue from "@vitejs/plugin-vue";

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
        "v-jsoneditor",
        "element-plus",
        "@element-plus/icons-vue",
        "wangeditor",
        "@eimsnext/form-render-core",
        "@eimsnext/form-render-elplus",
        "@eimsnext/form-render-vant",
        "@eimsnext/components",
        "@eimsnext/models",
        "@eimsnext/services",
        "@eimsnext/store",
        "@eimsnext/utils",
        "jsbarcode",
        "loadjs",
        "qr-code-styling",
        "signature_pad",
        "snowflake-id",
        "vant",
      ],
      input: ["src/index.js"],
      output: {
        compact: true,
        exports: "named",
        globals: {
          vue: "vue",
          "v-jsoneditor": "v-jsoneditor",
          "element-plus": "element-plus",
          "@element-plus/icons-vue": "@element-plus/icons-vue",
          wangeditor: "wangeditor",
          "@eimsnext/form-render-core": "@eimsnext/form-render-core",
          "@eimsnext/form-render-elplus": "@eimsnext/form-render-elplus",
          "@eimsnext/form-render-vant": "@eimsnext/form-render-vant",
          "@eimsnext/components": "@eimsnext/components",
          "@eimsnext/models": "@eimsnext/models",
          "@eimsnext/services": "@eimsnext/services",
          "@eimsnext/store": "@eimsnext/store",
          "@eimsnext/utils": "@eimsnext/utils",
          jsbarcode: "jsbarcode",
          loadjs: "loadjs",
          "qr-code-styling": "qr-code-styling",
          signature_pad: "signature_pad",
          "snowflake-id": "snowflake-id",
          vant: "vant",
        },
      },
    },
    lib: {
      entry: "src/index.js",
      name: "formdesigner",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  // esbuild: {
  //   drop: ["console", "debugger"]
  // },
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
