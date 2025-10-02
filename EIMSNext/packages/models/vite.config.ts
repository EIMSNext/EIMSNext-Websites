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
      input: ["index.ts"],
      output: {
        compact: true,
        exports: "named",
      },
    },

    lib: {
      entry: "./index.ts",
      name: "models",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
    keepNames: true
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, "./dist"),
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
    }),
  ],
});
