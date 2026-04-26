import type { RouteRecordRaw } from "vue-router";
import { SysLayout, constantRoutes } from "@/router";
import {
  store,
  useAppStoreHook,
  useContextStoreHook,
  useFormStore,
  useUserStoreHook,
} from "@eimsnext/store";
import router from "@/router";
import { AppMenu, FormType } from "@eimsnext/models";
import { systemService } from "@eimsnext/services";

const getMenuType = (menuType: FormType | number | undefined): FormType => {
  if (menuType === undefined) return FormType.Form;
  if (typeof menuType === 'string') return menuType as FormType;
  return String(menuType) as FormType;
};

const modules = import.meta.glob("../../views/**/**.vue");
const AppLayout = () => import("@/layout/applayout/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  interface IAppMenuPerm {
    id: string;
    type: FormType;
  }

  // 所有路由，包括静态和动态路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 表单动态菜单
  const appMenus = ref<AppMenu[]>([]);
  // 路由是否已加载
  const isRoutesLoaded = ref(false);

  const appStore = useAppStoreHook();
  const contextStore = useContextStoreHook();
  const userStore = useUserStoreHook();
  const { appId, appChanged } = storeToRefs(contextStore);

  watch([appChanged], async ([newVal]) => {
    await generateAppMenus();
  });

  const generateAppMenus = async () => {
    appMenus.value = [];
    if (appId.value) {
      let app = await appStore.get(appId.value);
      if (app) {
        let appMenuPerms: IAppMenuPerm[] = [];
        if (!userStore.isAppAdmin())
          appMenuPerms = await systemService.getAppMenuPerms(appId.value);

        appMenus.value = filterAppMenus(app.appMenus, appMenuPerms);
      }
    }
  };
  const filterAppMenus = (menus: AppMenu[], perms?: IAppMenuPerm[]): AppMenu[] => {
    return menus
      .map((menu) => {
        const menuType = getMenuType(menu.menuType);
        if (menuType === FormType.Group) {
          const subMenus = filterAppMenus(menu.subMenus || [], perms);
        return {
          ...menu,
          subMenus,
        };
      }

        return { ...menu };
      })
      .filter((menu) => {
        const menuType = getMenuType(menu.menuType);
        if (menuType === FormType.Group) {
          return userStore.isAppAdmin() || (menu.subMenus?.length || 0) > 0;
        }

        return hasMenuPerm(menu.menuId, perms);
      });
  };
  const hasMenuPerm = (menuId: string, menuPerms?: IAppMenuPerm[]) => {
    if (userStore.isAppAdmin()) return true;
    if (!menuPerms || menuPerms.length == 0) return false;
    return menuPerms.findIndex((m) => m.id == menuId) > -1;
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
