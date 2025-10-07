import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  optimizeDeps: {
    exclude: ["element-plus"], // 防止Element Plus被预构建
  },
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
        },
      },
    },
    lib: {
      entry: "src/index.js",
      name: "formrenderelplus",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  // esbuild: {
  //   drop: ["console", "debugger"],
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
