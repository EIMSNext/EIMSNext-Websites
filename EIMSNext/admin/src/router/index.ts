import { UserType } from "@eimsnext/models";
import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

const AppLayout = () => import("@/layout/applayout/index.vue");
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
  { path: "department",  component: () => import("@/views/system/department/index.vue"),  allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "role",        component: () => import("@/views/system/role/index.vue"),        title: "role",        allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "admin",       component: () => import("@/views/system/admin/index.vue"),       title: "admin",       allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "corp-log",    component: () => import("@/views/system/corp-log/index.vue"),    title: "corp-log",    allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
  { path: "flow-manage", component: () => import("@/views/system/flow-manage/index.vue"), title: "flow-manage", allowedUserTypes: [UserType.CorpAdmin] },
  { path: "plugin",      component: () => import("@/views/system/plugin/index.vue"),      title: "plugin",      allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] },
];

interface OpenPlatformRouteDef {
  path: string;
  component: () => Promise<any>;
  title?: string;
}

const openPlatformRoutes: OpenPlatformRouteDef[] = [
  { path: "pluginstore",   component: () => import("@/views/pluginstore/index.vue"),                title: "pluginstore" },
  { path: "plugin-manage", component: () => import("@/views/open-platform/plugin-manage/index.vue"), title: "plugin-manage" },
  { path: "api-key",       component: () => import("@/views/open-platform/api-key/index.vue"),       title: "api-key" },
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
      meta: { title: d.title, keepAlive: true, requiresAuth: true },
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
    name: "workspace",
    path: "/workspace",
    component: () => import("@/views/workspace/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  {
    name: "corp-onboarding",
    path: "/corp-onboarding",
    component: () => import("@/views/corp-onboarding/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  createTodoRoute("/mytasks", "mytasks", () => import("@/views/wftodo/global/mytasks.vue"), "我的待办"),
  createTodoRoute("/mystarted", "mystarted", () => import("@/views/wftodo/global/mystarted.vue"), "我发起的"),
  createTodoRoute("/myapproved", "myapproved", () => import("@/views/wftodo/global/myapproved.vue"), "我审批的"),
  createTodoRoute("/cctome", "cctome", () => import("@/views/wftodo/global/cctome.vue"), "抄送我的"),
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
        component: () => import("@/views/form/index.vue"),
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
          title: "我的待办",
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
          title: "我发起的",
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
          title: "我审批的",
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
          title: "抄送我的",
          affix: false,
          keepAlive: true,
          requiresAuth: true,
          closable: true,
        },
      },
    ],
  },
  // {
  //   path: "/app/:appId",
  //   component: () => import("@/views/app/index.vue"),
  //   meta: { hidden: true, requiresAuth: true },
  // },
  {
    path: "/",
    redirect: "/workspace",
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/profile/index.vue"),
    meta: { title: "个人中心", icon: "user", hidden: true, requiresAuth: true },
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
