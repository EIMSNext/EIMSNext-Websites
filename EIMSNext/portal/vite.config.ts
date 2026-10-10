import vue from "@vitejs/plugin-vue";
import { defineConfig, type ConfigEnv, type UserConfig } from "vite";
import { resolve } from "path";

const pathSrc = resolve(__dirname, "src");

// dev 下 identityUrl 为空串（相对路径），由 proxy 转发到本地 Identity，避免后端 CORS 配置
const devProxy = {
  "/identity": { target: "https://localhost:7777", changeOrigin: true, secure: false },
  "/api": { target: "https://localhost:7777", changeOrigin: true, secure: false },
};

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  return {
    base: "/portal/",
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    plugins: [vue()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "vue-i18n", "axios"],
    },
    server: {
      port: 5174,
      proxy: devProxy,
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // 框架/公共库独立 chunk，跨版本稳定缓存
          manualChunks(id) {
            const normalized = id.replace(/\\/g, "/");
            if (!normalized.includes("/node_modules/")) {
              if (normalized.includes("packages/locale")) return "locale-vendor";
              if (normalized.includes("packages/utils")) return "eims-vendor";
              return;
            }
            const tail = normalized.slice(normalized.indexOf("/node_modules/"));
            if (/\/(vue|vue-router|vue-i18n|@vue|@intlify)\//.test(tail)) return "vue-vendor";
            if (/\/(axios|qs)\//.test(tail)) return "http-vendor";
          },
          entryFileNames: "js/[name].[hash].js",
          chunkFileNames: "js/[name].[hash].js",
          assetFileNames: (assetInfo: { name?: string }) => {
            const name = assetInfo.name || "asset";
            if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) return "img/[name].[hash][extname]";
            if (/\.(woff2?|eot|ttf)$/i.test(name)) return "fonts/[name].[hash][extname]";
            return "assets/[name].[hash][extname]";
          },
        },
      },
    },
  };
});
