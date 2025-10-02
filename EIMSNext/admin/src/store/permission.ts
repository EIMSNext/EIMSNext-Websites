import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store, useAppStoreHook, useContextStoreHook } from "@eimsnext/store";
import router from "@/router";
import { getAppIcon, getFormIcon, getAppIconColor } from "@/utils/common";

import { AppMenu, FormType } from "@eimsnext/models";
const modules = import.meta.glob("../../views/**/**.vue");
const AppLayout = () => import("@/applayout/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 所有路由，包括静态和动态路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 表单动态菜单
  const appMenus = ref<RouteRecordRaw[]>([]);
  // 路由是否已加载
  const isRoutesLoaded = ref(false);

  const appStore = useAppStoreHook();
  const contextStore = useContextStoreHook();
  const { appId, appChanged } = storeToRefs(contextStore);
  watch([appChanged], ([newVal]) => {
    // console.log("appChanged", newVal);
    generateAppMenus();
  });

  const generateAppMenus = () => {
    appMenus.value = [];
    // console.log("perm app id", appId.value);
    if (appId.value) {
      appStore.get(appId.value, false).then((app) => {
        // console.log("perm app", app);
        if (app) {
          app.appMenus.forEach((x: AppMenu) => {
            appMenus.value.push(generateAppMenu(appId.value, x));
          });
        }
      });
    }
  };
  const generateAppMenu = (appId: string, x: AppMenu) => {
    let formRoute: RouteRecordRaw = {
      path: `/app/${appId}/form/${x.menuId}`,
      redirect: `/app/${appId}/form/${x.menuId}`,
      meta: {
        id: x.menuId,
        title: x.title,
        icon: getFormIcon(x),
        iconColor: getAppIconColor(x),
        isGroup: x.menuType == FormType.Group,
      },
    };
    // console.log("form menu", formRoute);
    if (x.subMenus) {
      formRoute.children = [];
      x.subMenus.forEach((s: AppMenu) => formRoute.children?.push(generateAppMenu(appId, s)));
    }

    return formRoute;
  };
  /**
   * 生成动态路由
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      const dynamicRoutes = transformRoutes([]);
      // routes.value = constantRoutes.concat(dynamicRoutes);
      isRoutesLoaded.value = true;
      resolve(dynamicRoutes);

      // MenuAPI.getRoutes()
      //   .then((data) => {
      //     //暂不需要动态路由
      //     const dynamicRoutes = transformRoutes([]);
      //     // routes.value = constantRoutes.concat(dynamicRoutes);
      //     isRoutesLoaded.value = true;
      //     resolve(dynamicRoutes);
      //   })
      //   .catch((error) => {
      //     reject(error);
      //   });
    });
  }

  /**
   * 重置路由
   */
  const resetRouter = () => {
    // 删除动态路由，保留静态路由
    routes.value.forEach((route) => {
      if (route.name && !constantRoutes.find((r) => r.name === route.name)) {
        // 从 router 实例中移除动态路由
        router.removeRoute(route.name);
      }
    });

    routes.value = [];
    appMenus.value = [];
    isRoutesLoaded.value = false;
  };

  return {
    routes,
    generateRoutes,
    appMenus,
    generateAppMenus,
    isRoutesLoaded,
    resetRouter,
  };
});

/**
 * 转换路由数据为组件
 */
const transformRoutes = (routes: RouteViewModel[]) => {
  const asyncRoutes: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    const tmpRoute = { ...route } as RouteRecordRaw;
    // 顶级目录，替换为 Layout 组件
    if (tmpRoute.component?.toString() == "AppLayout") {
      tmpRoute.component = AppLayout;
    } else {
      // 其他菜单，根据组件路径动态加载组件
      const component = modules[`../../views/${tmpRoute.component}.vue`];
      if (component) {
        tmpRoute.component = component;
      } else {
        tmpRoute.component = modules["../../views/error-page/404.vue"];
      }
    }

    if (tmpRoute.children) {
      tmpRoute.children = transformRoutes(route.children);
    }

    asyncRoutes.push(tmpRoute);
  });

  return asyncRoutes;
};

/**
 * 在组件外使用 Pinia store 实例 @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}

export interface RouteViewModel {
  /** 子路由列表 */
  children: RouteViewModel[];
  /** 组件路径 */
  component?: string;
  /** 路由属性 */
  meta?: RouteMeta;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 跳转链接 */
  redirect?: string;
}

/** Meta，路由属性 */
export interface RouteMeta {
  /** 【目录】只有一个子路由是否始终显示 */
  alwaysShow?: boolean;
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由title */
  title?: string;
}