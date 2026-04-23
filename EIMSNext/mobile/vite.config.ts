import vue from "@vitejs/plugin-vue";
import { defineConfig, type ConfigEnv, type UserConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";

const pathSrc = resolve(__dirname, "src");

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  return {
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `@use "@/styles/variables.scss" as *;`,
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "pinia", "vue-router"],
        resolvers: [VantResolver()],
        vueTemplate: true,
        dts: false,
      }),
      Components({
        resolvers: [VantResolver()],
        dirs: ["src/components", "src/**/components"],
        dts: false,
      }),
    ],
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia", "axios", "vant"],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: "js/[name].[hash].js",
          chunkFileNames: "js/[name].[hash].js",
          assetFileNames: (assetInfo: { name?: string }) => {
            const name = assetInfo.name || "asset";
            if (/\.(png|jpe?g|gif|svg)$/i.test(name)) return "img/[name].[hash][extname]";
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return "fonts/[name].[hash][extname]";
            return "assets/[name].[hash][extname]";
          },
        },
      },
    },
    server: {
      port: 3000,
    },
    define: {},
  };
});
