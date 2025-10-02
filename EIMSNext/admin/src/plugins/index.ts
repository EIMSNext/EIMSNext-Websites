import type { App } from "vue";

import { setupDirective } from "@/directive";
import { setupRouter } from "@/router";
import { setupStore } from "@eimsnext/store";
import { setupElIcons } from "./icons";
import { setupPermission } from "./permission";
import webSocketManager from "@/utils/websocket";
import { InstallCodeMirror } from "codemirror-editor-vue3";
import ELEMENT from "element-plus";
import vant from "vant";
import formCreate from "@eimsnext/form-render-elplus";
import FcDesigner from "@eimsnext/form-designer";
import EtPlus from "@eimsnext/components";
import setupHttp from "../utils/http";

export default {
  install(app: App<Element>) {
    // 自定义指令(directive)
    setupDirective(app);
    // 路由(router)
    setupRouter(app);
    // Element-plus图标
    setupElIcons(app);
    //http初始化
    app.use(setupHttp);
    // 状态管理(store)
    setupStore(app);
    // 路由守卫
    setupPermission();
    // 初始化 WebSocket
    webSocketManager.setupWebSocket();
    // 注册 CodeMirror
    app.use(InstallCodeMirror);

    app.use(ELEMENT);
    app.use(vant);
    app.use(EtPlus);
    app.use(formCreate);
    app.use(FcDesigner);
    FcDesigner.setFormula([
      {
        menu: "math",
        name: "test",
        info: "test",
        example: "test(val) == !!val",
        handle(val: any) {
          return !!val;
        },
      },
    ]);
  },
};
