import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
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
      //忽略打包vue文件
      external: ["vue", "pinia", "@vueuse/core", "@eimsnext/utils", "@eimsnext/models", "@eimsnext/services"],
      input: ["index.ts"],
      output: {
        compact: true,
        exports: "named",
        // 为不同格式生成相应的全局变量
        globals: {
          vue: "vue",
          pinia: "pinia",
          "@vueuse/core": "@vueuse/core",
          "@eimsnext/utils": "@eimsnext/utils",
          "@eimsnext/models": "@eimsnext/models",
          "@eimsnext/services": "@eimsnext/services"
        },
      },
    },
    lib: {
      entry: "./index.ts",
      name: "stores",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  // esbuild: {
  //   drop: ["console", "debugger"]
  // },
  plugins: [
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
