import type { RouteRecordRaw } from "vue-router";
import { SysLayout, constantRoutes } from "@/router";
import { store, useAppStoreHook, useContextStoreHook, useFormStore } from "@eimsnext/store";
import router from "@/router";
import { getAppIcon, getFormIcon, getAppIconColor } from "@/utils/common";

import { AppMenu, FormDef, FormType } from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
const modules = import.meta.glob("../../views/**/**.vue");
const AppLayout = () => import("@/layout/applayout/index.vue");

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
  watch([appChanged], async ([newVal]) => {
    // console.log("appChanged", newVal);
    await generateAppMenus();
  });

  const generateAppMenus = async () => {
    appMenus.value = [];
    let menus: RouteRecordRaw[] = [];
    // console.log("perm app id", appId.value);
    if (appId.value) {
      let app = await appStore.get(appId.value);
      if (app) {
        let forms = await formDefService.query<FormDef>(
          `$filter=appid eq '${appId.value}'&appid=${appId.value}`
        );
        app.appMenus.forEach((x: AppMenu) => {
          if (x.menuType == FormType.Group || forms.findIndex((y) => y.id == x.menuId) > -1) {
            generateAppMenu(appId.value, x, forms, menus);
          }
        });

        appMenus.value = menus;
      }
    }
  };
  const generateAppMenu = (
    appId: string,
    x: AppMenu,
    forms: FormDef[],
    menus: RouteRecordRaw[]
  ) => {
    let formRoute: RouteRecordRaw;

    if (x.menuType != FormType.Group) {
      formRoute = {
        path: `/app/${appId}/form/${x.menuId}`,
        redirect: `/app/${appId}/form/${x.menuId}`,
        meta: {
          id: x.menuId,
          title: x.title,
          icon: getFormIcon(x),
          iconColor: getAppIconColor(x),
          isGroup: false,
        },
      };
      menus.push(formRoute);
    } else {
      if (x.menuType == FormType.Group && x.subMenus && x.subMenus.length > 0) {
        var subMenus = x.subMenus.filter((x) => forms.findIndex((y) => y.id == x.menuId) > -1);
        if (subMenus.length > 0) {
          formRoute = {
            path: `#`,
            redirect: `#`,
            meta: {
              id: x.menuId,
              title: x.title,
              icon: getFormIcon(x),
              iconColor: getAppIconColor(x),
              isGroup: true,
              children: [],
            },
          };
          menus.push(formRoute);
          subMenus.forEach((s: AppMenu) => generateAppMenu(appId, s, forms, formRoute.children!));
        }
      }
    }
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
    } else if (tmpRoute.component?.toString() == "SysLayout") {
      tmpRoute.component = SysLayout;
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
