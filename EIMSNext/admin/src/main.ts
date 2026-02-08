import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";
import "element-plus/dist/index.css";
import "@/assets/iconfont/iconfont.css";
import "@eimsnext/components/dist/index.css";
import "@eimsnext/form-render-elplus/dist/index.css"
// 本地SVG图标
import "virtual:svg-icons-register";
// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "@/styles/workflow.scss";
import "uno.css";
import "animate.css";
import "vant/lib/index.css";

const app = createApp(App);

// 注册插件
app.use(setupPlugins);
app.mount("#app");
