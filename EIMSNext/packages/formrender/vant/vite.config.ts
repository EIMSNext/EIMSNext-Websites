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
        "vant",
        "v-jsoneditor",
        "dayjs",
        "@eimsnext/form-render-core",
        "@eimsnext/models",
        "@eimsnext/services",
        "@eimsnext/store",
        "@eimsnext/utils",
      ],
      input: ["src/index.js"],
      output: {
        compact: true,
        exports: "named",
        globals: {
          vue: "vue",
          vant: "vant",
          "v-jsoneditor": "v-jsoneditor",
          dayjs: "dayjs",
          "@eimsnext/form-render-core": "@eimsnext/form-render-core",
          "@eimsnext/models": "@eimsnext/models",
          "@eimsnext/services": "@eimsnext/services",
          "@eimsnext/store": "@eimsnext/store",
          "@eimsnext/utils": "@eimsnext/utils",
        },
      },
    },
    lib: {
      entry: "src/index.js",
      name: "formrendervant",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
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
