import vue from "@vitejs/plugin-vue";
import DefineOptions from "unplugin-vue-define-options/vite";
import { type UserConfig, type ConfigEnv, loadEnv, defineConfig } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { visualizer } from "rollup-plugin-visualizer";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

import UnoCSS from "unocss/vite";
import { resolve } from "path";

const pathSrc = resolve(__dirname, "src");

const scssAdditionalData = `
  @use "@/styles/variables.scss" as *;
`;

const autoImportPackages: Array<"vue" | "@vueuse/core" | "pinia" | "vue-router"> = [
  "vue",
  "@vueuse/core",
  "pinia",
  "vue-router",
];

const componentDirs = ["src/components", "src/**/components"];

const baseOptimizeDeps = [
  "vue",
  "vue-router",
  "element-plus",
  "pinia",
  "axios",
  "lodash-es",
  "@vueuse/core",
  "sortablejs",
  "exceljs",
  "path-to-regexp",
  "echarts",
  "@wangeditor/editor",
  "@wangeditor/editor-for-vue",
  "path-browserify",
];

const elementPlusStyleDeps = [
  "element-plus/es/components/form/style/css",
  "element-plus/es/components/form-item/style/css",
  "element-plus/es/components/button/style/css",
  "element-plus/es/components/input/style/css",
  "element-plus/es/components/input-number/style/css",
  "element-plus/es/components/switch/style/css",
  "element-plus/es/components/upload/style/css",
  "element-plus/es/components/menu/style/css",
  "element-plus/es/components/col/style/css",
  "element-plus/es/components/icon/style/css",
  "element-plus/es/components/row/style/css",
  "element-plus/es/components/tag/style/css",
  "element-plus/es/components/dialog/style/css",
  "element-plus/es/components/loading/style/css",
  "element-plus/es/components/radio/style/css",
  "element-plus/es/components/radio-group/style/css",
  "element-plus/es/components/popover/style/css",
  "element-plus/es/components/scrollbar/style/css",
  "element-plus/es/components/tooltip/style/css",
  "element-plus/es/components/dropdown/style/css",
  "element-plus/es/components/dropdown-menu/style/css",
  "element-plus/es/components/dropdown-item/style/css",
  "element-plus/es/components/sub-menu/style/css",
  "element-plus/es/components/menu-item/style/css",
  "element-plus/es/components/divider/style/css",
  "element-plus/es/components/card/style/css",
  "element-plus/es/components/link/style/css",
  "element-plus/es/components/breadcrumb/style/css",
  "element-plus/es/components/breadcrumb-item/style/css",
  "element-plus/es/components/table/style/css",
  "element-plus/es/components/tree-select/style/css",
  "element-plus/es/components/table-column/style/css",
  "element-plus/es/components/select/style/css",
  "element-plus/es/components/option/style/css",
  "element-plus/es/components/pagination/style/css",
  "element-plus/es/components/tree/style/css",
  "element-plus/es/components/alert/style/css",
  "element-plus/es/components/radio-button/style/css",
  "element-plus/es/components/checkbox-group/style/css",
  "element-plus/es/components/checkbox/style/css",
  "element-plus/es/components/tabs/style/css",
  "element-plus/es/components/tab-pane/style/css",
  "element-plus/es/components/rate/style/css",
  "element-plus/es/components/date-picker/style/css",
  "element-plus/es/components/notification/style/css",
  "element-plus/es/components/image/style/css",
  "element-plus/es/components/statistic/style/css",
  "element-plus/es/components/watermark/style/css",
  "element-plus/es/components/config-provider/style/css",
  "element-plus/es/components/text/style/css",
  "element-plus/es/components/drawer/style/css",
  "element-plus/es/components/color-picker/style/css",
  "element-plus/es/components/backtop/style/css",
  "element-plus/es/components/message-box/style/css",
  "element-plus/es/components/skeleton/style/css",
  "element-plus/es/components/skeleton/style/css",
  "element-plus/es/components/skeleton-item/style/css",
  "element-plus/es/components/badge/style/css",
  "element-plus/es/components/steps/style/css",
  "element-plus/es/components/step/style/css",
  "element-plus/es/components/avatar/style/css",
  "element-plus/es/components/descriptions/style/css",
  "element-plus/es/components/descriptions-item/style/css",
  "element-plus/es/components/checkbox-group/style/css",
  "element-plus/es/components/progress/style/css",
  "element-plus/es/components/image-viewer/style/css",
  "element-plus/es/components/empty/style/css",
];

const optimizeDepIncludes = [...baseOptimizeDeps, ...elementPlusStyleDeps];

const workspacePackageAliases: Record<string, string> = {
  "formrender/el-plus": "@eimsnext/form-render-elplus",
  "formrender/core": "@eimsnext/form-render-core",
  "formrender/vant": "@eimsnext/form-render-vant",
  formdesigner: "@eimsnext/form-designer",
  formbuilder: "@eimsnext/form-builder",
  "print-plugins": "@eimsnext/print-plugins",
};

const packageChunkGroups = [
  {
    chunk: "element-plus",
    packages: ["element-plus", "@element-plus/"],
  },
  {
    chunk: "vue-vendor",
    packages: ["vue", "@vue/", "vue-router", "pinia", "vue-i18n", "@vueuse/"],
  },
  {
    chunk: "vant-vendor",
    packages: ["vant", "@vant/", "@popperjs/", "@sxzz/"],
  },
  {
    chunk: "react-vendor",
    packages: [
      "react",
      "react-dom",
      "scheduler",
      "sonner",
      "@radix-ui/",
      "@floating-ui/",
      "react-remove-scroll",
      "react-remove-scroll-bar",
      "react-style-singleton",
      "use-callback-ref",
      "use-sidecar",
      "aria-hidden",
      "prop-types",
    ],
  },
  {
    chunk: "pdf-vendor",
    packages: ["vue-pdf-embed"],
  },
  {
    chunk: "excel-vendor",
    packages: ["exceljs"],
  },
  {
    chunk: "drag-vendor",
    packages: ["vuedraggable", "sortablejs", "vue-grid-layout-v3"],
  },
  {
    chunk: "app-vendor",
    packages: [
      "echarts",
      "zrender",
      "dayjs",
      "axios",
      "odata-query",
      "qs",
      "path-browserify",
      "lodash-es",
      "lodash",
      "side-channel",
      "side-channel-list",
      "side-channel-map",
      "side-channel-weakmap",
      "object-inspect",
      "get-intrinsic",
      "get-proto",
      "call-bind-apply-helpers",
      "call-bound",
      "function-bind",
      "has-symbols",
      "hasown",
      "gopd",
      "es-object-atoms",
      "es-errors",
      "es-define-property",
      "math-intrinsics",
      "dunder-proto",
    ],
  },
  {
    chunk: "editor-vendor",
    packages: ["codemirror", "codemirror-editor-vue3", "@wangeditor/", "wangeditor"],
  },
] as const;

function getPackageName(normalizedId: string) {
  const packagePath = normalizedId.split("node_modules/").pop();

  if (!packagePath) return;

  return packagePath.startsWith("@")
    ? packagePath.split("/").slice(0, 2).join("/")
    : packagePath.split("/")[0];
}

function getWorkspacePackageName(normalizedId: string) {
  const match = normalizedId.match(/\/packages\/(.+?)\/dist\//);

  if (!match) return;

  const packagePath = match[1];

  return workspacePackageAliases[packagePath] ?? `@eimsnext/${packagePath.replace(/\//g, "-")}`;
}

function toChunkName(packageName: string) {
  return packageName
    .replace(/^@/, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "_");
}

function matchesPackageName(packageName: string | undefined, packages: readonly string[]) {
  if (!packageName) return false;

  return packages.some((pkg) =>
    pkg.endsWith("/") ? packageName.startsWith(pkg) : packageName === pkg
  );
}

function getGroupedChunkName(packageName: string | undefined) {
  const group = packageChunkGroups.find(({ packages }) =>
    matchesPackageName(packageName, packages)
  );

  return group?.chunk;
}

const skippedManualChunkPackages = new Set([
  "lodash-unified",
  "vue-demi",
  "@stomp/stompjs",
  "detect-node-es",
]);
// Vite配置  https://cn.vitejs.dev/config
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      preprocessorOptions: {
        // 定义全局 SCSS 变量
        scss: {
          // javascriptEnabled: true,
          api: "modern-compiler",
          additionalData: scssAdditionalData,
        },
      },
    },
    plugins: [
      vue(),
      visualizer({
        filename: "./dist/stats.html",
        open: mode === "production", // 构建后自动打开
      }),
      DefineOptions(),
      UnoCSS({
        configFile: resolve(__dirname, "../uno.config.ts"),
        hmrTopLevelAwait: false,
      }),
      // 自动导入配置 https://github.com/sxzz/element-plus-best-practices/blob/main/vite.config.ts
      AutoImport({
        // 导入 Vue 函数，如：ref, reactive, toRef 等
        imports: autoImportPackages,
        resolvers: [
          // 导入 Element Plus函数，如：ElMessage, ElMessageBox 等
          ElementPlusResolver(),
        ],
        eslintrc: {
          enabled: false,
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
        vueTemplate: true,
        // 导入函数类型声明文件路径 (false:关闭自动生成)
        dts: false,
        // dts: "src/types/auto-imports.d.ts",
      }),
      Components({
        resolvers: [
          // 导入 Element Plus 组件
          ElementPlusResolver(),
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: componentDirs,
        // 导入组件类型声明文件路径 (false:关闭自动生成)
        // dts: false,
        dts: "src/types/components.d.ts",
      }),
      createSvgIconsPlugin({
        // 缓存图标位置
        iconDirs: [resolve(pathSrc, "assets/icons")],
        symbolId: "icon-[dir]-[name]",
      }),
    ],
    // 预加载项目必需的组件
    optimizeDeps: {
      include: optimizeDepIncludes,
    },
    // 构建配置
    build: {
      chunkSizeWarningLimit: 2000,
      minify: "terser", // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      sourcemap: false,
      terserOptions: {
        compress: {
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          drop_console: true, // 生产环境去除 console
          drop_debugger: true, // 生产环境去除 debugger
        },
        format: {
          comments: false, // 删除注释
        },
      },
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" &&
            warning.message.includes('"use client"')
          ) {
            return;
          }

          warn(warning);
        },
        output: {
          experimentalMinChunkSize: 500 * 1024,
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, "/");
            const packageName = getPackageName(normalizedId);
            const workspacePackageName = getWorkspacePackageName(normalizedId);
            const groupedChunkName = getGroupedChunkName(packageName);

            if (id.includes("@eimsnext/form-designer")) {
              return "form-designer"; // 单独拆成 vendor-formdesigner.js
            }

            if (workspacePackageName) {
              return toChunkName(workspacePackageName);
            }

            if (!normalizedId.includes("/node_modules/")) {
              return;
            }

            if (packageName && skippedManualChunkPackages.has(packageName)) {
              return;
            }

            if (packageName === "@univerjs/engine-render") {
              if (normalizedId.endsWith("/lib/es/index.js")) {
                return "univer-engine-render";
              }

              return;
            }

            if (packageName?.startsWith("@univerjs/")) {
              return `univer-${toChunkName(packageName.replace("@univerjs/", ""))}`;
            }

            if (packageName === "pdfjs-dist") {
              if (normalizedId.includes("/legacy/build/pdf.worker.mjs")) {
                return "pdf-worker";
              }

              if (
                normalizedId.includes("/legacy/build/") ||
                normalizedId.includes("/legacy/web/")
              ) {
                return "pdf-vendor";
              }

              return;
            }

            if (groupedChunkName) return groupedChunkName;

            return packageName ? toChunkName(packageName) : undefined;
          },
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: (assetInfo: any) => {
            const info = assetInfo.name.split(".");
            let extType = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "media";
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = "img";
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "fonts";
            }
            return `${extType}/[name].[hash].[ext]`;
          },
        },
      },
    },
    define: {},
  };
});
