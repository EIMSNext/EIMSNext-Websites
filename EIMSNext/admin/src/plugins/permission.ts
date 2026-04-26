import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import { accessToken } from "@eimsnext/utils";
import router from "@/router";
import { usePermissionStore } from "@/store";
import { useUserStore, useAppStore } from "@eimsnext/store";
import { AppMenu } from "@eimsnext/models";

export function setupPermission() {
  router.beforeEach(async (to, from, next) => {
    if (!to.meta?.requiresAuth) {
      next();
    } else {
      const isLogin = !!accessToken.isLoggedIn(); // 判断是否登录
      if (isLogin) {
        //从链接进来的地址，可能还没有初始化用户信息
        const userStore = useUserStore();
        await userStore.initialize();

        let allowed = true;
        if (to.meta.allowedUserTypes && to.meta.allowedUserTypes.length > 0) {
          allowed =
            to.meta.allowedUserTypes.findIndex((x) => x == userStore.currentUser.userType) > -1;
        }
        if (!allowed) {
          next("/401");
        } else {
          if (to.path === "/login") {
            // 已登录，访问登录页，跳转到首页
            next({ path: "/" });
          } else {
            const permissionStore = usePermissionStore();
            // 判断路由是否加载完成
            if (permissionStore.isRoutesLoaded) {
              if (to.matched.length === 0) {
                // 路由未匹配，跳转到404
                next("/404");
              } else {
                // 动态设置页面标题
                let title = (to.params.title as string) || (to.query.title as string);
                if (
                  (!title || title == "form" || title == "dash") &&
                  (to.params.formId || to.params.dashId)
                ) {
                  const appStore = useAppStore();
                  const app = await appStore.get(to.params.appId as string);
                  const menuId = to.params.formId || to.params.dashId;
                  if (menuId) {
                    const form = findMenu(app?.appMenus || [], menuId as string);
                    if (form?.title) title = form.title;
                  }
                }
                if (title) {
                  to.meta.title = title;
                }
                next();
              }
            } else {
              try {
                // 生成动态路由
                const dynamicRoutes = await permissionStore.generateRoutes();
                dynamicRoutes.forEach((route: RouteRecordRaw) => router.addRoute(route));
                next({ ...to, replace: true });
              } catch (error) {
                console.error(error);
                // 路由加载失败，重置 token 并重定向到登录页
                accessToken.clear();
                redirectToLogin(to, next);
              }
            }
          }
        }
      } else {
        // 不在白名单，重定向到登录页
        redirectToLogin(to, next);
      }
    }
  });

  // 后置守卫，保证每次路由跳转结束时关闭进度条
  router.afterEach(() => {});
}

function findMenu(menus: AppMenu[], menuId: string): AppMenu | undefined {
  for (const menu of menus) {
    if (menu.menuId === menuId) {
      return menu;
    }

    if (menu.subMenus?.length) {
      const matched = findMenu(menu.subMenus, menuId);
      if (matched) {
        return matched;
      }
    }
  }

  return undefined;
}

// 重定向到登录页
function redirectToLogin(to: RouteLocationNormalized, next: NavigationGuardNext) {
  const params = new URLSearchParams(to.query as Record<string, string>);
  const queryString = params.toString();
  const redirect = queryString ? `${to.path}?${queryString}` : to.path;
  next(`/login?redirect=${encodeURIComponent(redirect)}`);
}

/** 判断是否有权限 */
export function hasAuth(value: string | string[], type: "button" | "role" = "button") {
  const { roles, perms } = useUserStore().currentUser;

  // 超级管理员 拥有所有权限
  if (type === "button" && roles.includes("ROOT")) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}
