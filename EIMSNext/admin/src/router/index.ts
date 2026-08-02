import { UserType } from "@eimsnext/models";
import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

const AppLayout = () => import("@/layout/applayout/index.vue");
const AppAdminLayout = () => import("@/layout/appadminlayout/index.vue");
export const SysLayout = () => import("@/layout/syslayout/index.vue");
const TodoLayout = () => import("@/layout/todolayout/index.vue");
const OpenPlatformLayout = () => import("@/layout/openplatform/index.vue");

interface SystemRouteDef {
  path: string;
  component: () => Promise<any>;
  title?: string;
  allowedUserTypes?: UserType[];
}

const systemRoutes: SystemRouteDef[] = [
  { path: "department",  component: () => import("@/views/system/department/index.vue"),  allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin, UserType.AppAdmin] },
  { path: "role",        component: () => import("@/views/system/role/index.vue"),        title: "role",        allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin, UserType.AppAdmin] },
  { path: "admin",       component: () => import("@/views/system/admin/index.vue"),       title: "admin",       allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "corp-log",    component: () => import("@/views/system/corp-log/index.vue"),    title: "corp-log",    allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "flow-manage", component: () => import("@/views/system/flow-manage/index.vue"), title: "flow-manage", allowedUserTypes: [UserType.CorpAdmin] },
  { path: "plugin",      component: () => import("@/views/system/plugin/index.vue"),      title: "plugin",      allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
];

interface OpenPlatformRouteDef {
  path: string;
  component: () => Promise<any>;
  title?: string;
  allowedUserTypes?: UserType[];
}

const openPlatformRoutes: OpenPlatformRouteDef[] = [
  { path: "pluginstore",   component: () => import("@/views/pluginstore/index.vue"),                title: "pluginstore" },
  { path: "plugin-manage", component: () => import("@/views/open-platform/plugin-manage/index.vue"), title: "plugin-manage" },
  { path: "api-key",       component: () => import("@/views/open-platform/api-key/index.vue"),       title: "api-key", allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "api-log",       component: () => import("@/views/open-platform/api-log/index.vue"),       title: "api-log" },
  { path: "docs",          component: () => import("@/views/open-platform/docs/index.vue"),          title: "open-platform-docs" },
];

type RouteMeta<R> = R extends { meta: infer M } ? M : never;

function createSysRoutes(defs: SystemRouteDef[]): RouteRecordRaw[] {
  return defs.map((d) => ({
    path: `/system/${d.path}`,
    component: SysLayout,
    children: [{
      path: "",
      component: d.component,
      meta: { title: d.title ?? "", icon: "collection", keepAlive: true, requiresAuth: true, allowedUserTypes: d.allowedUserTypes },
    }],
  }));
}

function createOpenPlatformRoutes(defs: OpenPlatformRouteDef[]): RouteRecordRaw[] {
  return defs.map((d) => ({
    path: `/open-platform/${d.path}`,
    component: OpenPlatformLayout,
    children: [{
      path: "",
      component: d.component,
      meta: { title: d.title, keepAlive: true, requiresAuth: true, allowedUserTypes: d.allowedUserTypes },
    }],
  }));
}

function createTodoRoute(path: string, name: string, component: () => Promise<any>, title: string): RouteRecordRaw {
  return {
    path,
    component: TodoLayout,
    children: [{
      path: "",
      name: `${name}-global`,
      component,
      meta: { title, affix: false, keepAlive: true, requiresAuth: true, closable: true },
    }],
  };
}

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/401",
    component: () => import("@/views/error/401.vue"),
    meta: { hidden: true },
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
    meta: { hidden: true },
  },
  {
    name: "login",
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },
  {
    name: "forget-password",
    path: "/forget-password",
    component: () => import("@/views/login/forget-password.vue"),
    meta: { hidden: true },
  },
  {
    name: "register",
    path: "/register",
    component: () => import("@/views/register/index.vue"),
    meta: { hidden: true },
  },
  {
    name: "appstore",
    path: "/appstore",
    component: () => import("@/views/appstore/index.vue"),
    meta: { hidden: true },
  },
  {
    name: "pluginstore",
    path: "/pluginstore",
    component: () => import("@/views/pluginstore/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  {
    name: "workbench-customize",
    path: "/workbench/customize",
    component: () => import("@/views/workbench/customize.vue"),
    meta: {
      hidden: true,
      requiresAuth: true,
      allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin],
    },
  },
  {
    name: "workbench",
    path: "/workbench",
    component: () => import("@/views/workbench/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  {
    name: "corp-onboarding",
    path: "/corp-onboarding",
    component: () => import("@/views/corp-onboarding/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  {
    path: "/platform-admin",
    component: SysLayout,
    children: [
      {
        path: "",
        name: "platform-admin",
        component: () => import("@/views/platform-admin/index.vue"),
        meta: {
          title: "admin.platformAdmin.title",
          hidden: true,
          requiresAuth: true,
          allowedUserTypes: [UserType.PlatAdmin],
        },
      },
    ],
  },
  createTodoRoute("/mytasks", "mytasks", () => import("@/views/wftodo/global/mytasks.vue"), "common.wfProcess.mytasks"),
  createTodoRoute("/mystarted", "mystarted", () => import("@/views/wftodo/global/mystarted.vue"), "common.wfProcess.mystarted"),
  createTodoRoute("/myapproved", "myapproved", () => import("@/views/wftodo/global/myapproved.vue"), "common.wfProcess.myapproved"),
  createTodoRoute("/cctome", "cctome", () => import("@/views/wftodo/global/cctome.vue"), "common.wfProcess.cctome"),
  ...createSysRoutes(systemRoutes),
  ...createOpenPlatformRoutes(openPlatformRoutes),
  {
    path: "/system/:formId",
    component: SysLayout,
    redirect: (to) => ({ path: `/system/${to.params.formId}` }),
    children: [
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
  {
    path: "/app/:appId",
    component: () => import("@/views/app/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  {
    path: "/app/:appId/admin",
    component: AppAdminLayout,
    redirect: (to) => ({ path: `/app/${to.params.appId}/admin/permissions` }),
    children: [
      {
        path: "permissions",
        component: () => import("@/views/app-admin/permissions.vue"),
        meta: { hidden: true, requiresAuth: true },
      },
      {
        path: "cross-binding",
        component: () => import("@/views/app-admin/cross-binding.vue"),
        meta: { hidden: true, requiresAuth: true },
      },
      {
        path: "settings",
        component: () => import("@/views/app-admin/settings.vue"),
        meta: { hidden: true, requiresAuth: true },
      },
      {
        path: "aggregate",
        component: () => import("@/views/app-admin/aggregate.vue"),
        meta: { hidden: true, requiresAuth: true },
      },
      {
        path: "assistant",
        component: () => import("@/views/app-admin/assistant.vue"),
        meta: { hidden: true, requiresAuth: true },
      },
      {
        path: "webhook",
        component: () => import("@/views/app-admin/webhook.vue"),
        meta: { hidden: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "/app/:appId/dash/:dashId",
    component: AppLayout,
    children: [
      {
        path: "/app/:appId/dash/:dashId",
        component: () => import("@/views/dash/index.vue"),
        // name: "form",
        meta: {
          title: "dash",
          icon: "collection",
          // affix: true,
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
  {
    path: "/app/:appId/form/:formId/data/:dataId",
    component: () => import("@/views/form/data/index.vue"),
    meta: {
      title: "form",
      icon: "collection",
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: "/app/:appId/form/:formId",
    component: AppLayout,
    children: [
      {
        path: "/app/:appId/form/:formId",
        component: () => import("@/views/form/FormListPage.vue"),
        // name: "form",
        meta: {
          title: "form",
          icon: "collection",
          // affix: true,
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
  {
    path: "/app/:appId/mytasks",
    component: AppLayout,
    children: [
      {
        path: "/app/:appId/mytasks",
        component: () => import("@/views/wftodo/app/tasks.vue"),
        name: "mytasks",
        meta: {
          title: "common.wfProcess.mytasks",
          affix: false,
          keepAlive: true,
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/app/:appId/mystarted",
    component: AppLayout,
    children: [
      {
        path: "/app/:appId/mystarted",
        component: () => import("@/views/wftodo/app/started.vue"),
        name: "mystarted",
        meta: {
          title: "common.wfProcess.mystarted",
          affix: false,
          keepAlive: true,
          requiresAuth: true,
          closable: true,
        },
      },
    ],
  },
  {
    path: "/app/:appId/myapproved",
    component: AppLayout,
    children: [
      {
        path: "/app/:appId/myapproved",
        component: () => import("@/views/wftodo/app/approved.vue"),
        name: "myapproved",
        meta: {
          title: "common.wfProcess.myapproved",
          affix: false,
          keepAlive: true,
          requiresAuth: true,
          closable: true,
        },
      },
    ],
  },
  {
    path: "/app/:appId/cctome",
    component: AppLayout,
    children: [
      {
        path: "/app/:appId/cctome",
        component: () => import("@/views/wftodo/app/cctome.vue"),
        name: "cctome",
        meta: {
          title: "common.wfProcess.cctome",
          affix: false,
          keepAlive: true,
          requiresAuth: true,
          closable: true,
        },
      },
    ],
  },
  {
    path: "/public/dash/:dashboardId",
    component: () => import("@/views/public/DashLink.vue"),
    meta: { hidden: true },
  },
  {
    path: "/public/form/:formId/submit",
    component: () => import("@/views/public/FormLink.vue"),
    meta: { hidden: true },
  },
  {
    path: "/public/form/:formId/query",
    component: () => import("@/views/public/QueryLink.vue"),
    meta: { hidden: true },
  },
  {
    path: "/public/form/:formId/data/:dataId",
    component: () => import("@/views/public/DataLink.vue"),
    meta: { hidden: true },
  },
  {
    path: "/",
    redirect: "/workbench",
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/profile/index.vue"),
    meta: { title: "navbar.profile", icon: "user", hidden: true, requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    meta: { hidden: true },
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
