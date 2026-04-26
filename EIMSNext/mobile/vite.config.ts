import vue from "@vitejs/plugin-vue";
import { defineConfig, type ConfigEnv, type UserConfig } from "vite";
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
      Components({
        resolvers: [VantResolver()],
        dirs: ["src/components", "src/**/components"],
        dts: false,
      }),
    ],
    optimizeDeps: {
      include: ["vue", "vue-router", "axios"],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("@eimsnext/form-render-vant") || id.includes("packages/formrender")) {
              return "form-render";
            }
            if (id.includes("vant")) {
              return "vant-vendor";
            }
            if (id.includes("vue-router") || id.includes("node_modules/vue/") || id.includes("@vue/shared")) {
              return "vue-vendor";
            }
            if (
              id.includes("@eimsnext/utils") ||
              id.includes("@eimsnext/models") ||
              id.includes("@eimsnext/services") ||
              id.includes("packages/utils") ||
              id.includes("packages/models") ||
              id.includes("packages/services")
            ) {
              return "eims-vendor";
            }
          },
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
