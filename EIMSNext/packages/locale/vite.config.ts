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
      input: ["src/index.ts"],
      output: {
        compact: true,
        exports: "named",
      },
    },
    lib: {
      entry: "src/index.ts",
      name: "locale",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
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
