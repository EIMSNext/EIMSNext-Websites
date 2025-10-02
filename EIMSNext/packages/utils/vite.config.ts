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
    //cssCodeSplit: true,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: ["axios", "qs", "lodash", "nanoid"],
      input: ["index.ts"],
      output: {
        compact: true,
        exports: "named",
        // 为不同格式生成相应的全局变量
        globals: {
          axios: "axios",
          qs: "qs",
          lodash: "lodash",
          nanoid: "nanoid",
        },
      },
    },
    lib: {
      entry: "./index.ts",
      name: "utils",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
