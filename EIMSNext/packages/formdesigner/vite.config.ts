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
        entryFileNames: "index.js",
      },
    },
    lib: {
      entry: "src/index.js",
      name: "formdesigner",
      formats: ["es"],
      fileName: () => "index.js",
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
