import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";
// EP 全量样式必须全局导入：et-card/form-render 等预编译包内部的 EP 组件不走 admin 的 resolver 自动导样式
import "element-plus/dist/index.css";
import "@/assets/iconfont/iconfont.css";
import "@eimsnext/components/dist/index.css";
import "@eimsnext/form-render-elplus/dist/index.css";
// 本地SVG图标
import "virtual:svg-icons-register";
// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "uno.css";
import "animate.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "@/styles/public.scss";
import "@/styles/workflow.scss";

const app = createApp(App);

// 注册插件
app.use(setupPlugins);
app.mount("#app");
