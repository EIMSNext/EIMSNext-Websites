import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  build: {
    target: "modules",
    //打包文件目录
    outDir: "dist",
    //压缩
    minify: "terser",
    //css分离
    //cssCodeSplit: true,
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: "./index.ts",
      name: "models",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
        dead_code: false,
        unused: false,
      },
      format: { comments: false },
      mangle: {
        reserved: ["h"], // 强制保留 h 不被重命名
      },
    },
    rollupOptions: {
      output: {
        plugins: [
          terser({
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log"],
              dead_code: false,
              unused: false,
            },
            format: { comments: false },
            mangle: {
              reserved: ["h"], // 强制保留 h 不被重命名
            },
          }),
        ],
      },
    },
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
