import vue from "@vitejs/plugin-vue";
import { defineConfig, type ConfigEnv, type Plugin, type UserConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "path";

const pathSrc = resolve(__dirname, "src");

// 省市区数据的唯一源：admin/public/area/level.json
// mobile 不再各自维护副本：dev 由此中间件直接回源，build 时原样写入 dist/area/level.json。
const AREA_SOURCE = resolve(__dirname, "../admin/public/area/level.json");
const AREA_PUBLIC_URL = "/area/level.json";

const eimsAreaData = (): Plugin => ({
  name: "eims-area-data",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if ((req.url || "").split("?")[0] !== AREA_PUBLIC_URL) return next();
      if (!existsSync(AREA_SOURCE)) {
        res.statusCode = 404;
        res.end("area source not found: admin/public/area/level.json");
        return;
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(readFileSync(AREA_SOURCE));
    });
  },
  generateBundle() {
    if (!existsSync(AREA_SOURCE)) {
      this.error("area source not found: admin/public/area/level.json");
      return;
    }
    this.emitFile({ type: "asset", fileName: "area/level.json", source: readFileSync(AREA_SOURCE) });
  },
});

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
      eimsAreaData(),
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
