import type { App } from "vue";

import { setupRouter } from "@/router";
import { setupStore } from "@eimsnext/store";
import { setupElIcons } from "./icons";
import { setupPermission } from "./permission";
import webSocketManager from "@/utils/websocket";
import { InstallCodeMirror } from "codemirror-editor-vue3";
import ELEMENT from "element-plus";
import formCreate from "@eimsnext/form-render-elplus";
import EtPlus from "@eimsnext/components";
import setupHttp from "../utils/http";
import { createI18n } from "vue-i18n";
import { useSystemStoreHook } from "@/store";
import print from "vue3-print-nb";

export default {
  install(app: App<Element>) {
    const systemStore = useSystemStoreHook();
    const i18n = createI18n({
      locale: systemStore.language,
      messages: systemStore.locales,
      legacy: false, // Vue3 推荐开启
    });
    app.use(i18n);

    //http初始化
    app.use(setupHttp);
    // 路由(router)
    setupRouter(app);
    // Element-plus图标
    setupElIcons(app);
    // 状态管理(store)
    setupStore(app);
    // 路由守卫
    setupPermission();
    // 初始化 WebSocket
    webSocketManager.setupWebSocket();
    // 注册 CodeMirror
    app.use(InstallCodeMirror);

    app.use(ELEMENT);
    app.use(EtPlus);
    app.use(formCreate);
    // FcDesigner(form-designer)体积大且仅表单设计器页面需要，由 FormBuilder 在 mounted 时按需异步加载，不在此全局注册
    app.use(print);
  },
};
