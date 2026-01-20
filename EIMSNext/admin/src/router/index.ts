import { UserType } from "@eimsnext/models";
import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const AppLayout = () => import("@/layout/applayout/index.vue");
export const SysLayout = () => import("@/layout/syslayout/index.vue");
export const TodoLayout = () => import("@/layout/todolayout/index.vue");

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
    name: "workspace",
    path: "/workspace",
    component: () => import("@/views/workspace/index.vue"),
    meta: { hidden: true, requiresAuth: true },
  },
  {
    path: "/mytasks",
    component: TodoLayout,
    children: [
      {
        path: "",
        name: "mytasks-global",
        component: () => import("@/views/wftodo/global/mytasks.vue"),
        meta: { title: "我的待办", affix: false, keepAlive: true, requiresAuth: true, closable: true },
      },
    ],
  },
  {
    path: "/mystarted",
    component: TodoLayout,
    children: [
      {
        path: "",
        name: "mystarted-global",
        component: () => import("@/views/wftodo/global/mystarted.vue"),
        meta: { title: "我发起的", affix: false, keepAlive: true, requiresAuth: true, closable: true },
      },
    ],
  },
  {
    path: "/myapproved",
    component: TodoLayout,
    children: [
      {
        path: "",
        name: "myapproved-global",
        component: () => import("@/views/wftodo/global/myapproved.vue"),
        meta: { title: "我审批的", affix: false, keepAlive: true, requiresAuth: true, closable: true },
      },
    ],
  },
  {
    path: "/cctome",
    component: TodoLayout,
    children: [
      {
        path: "",
        name: "cctome-global",
        component: () => import("@/views/wftodo/global/cctome.vue"),
        meta: { title: "抄送我的", affix: false, keepAlive: true, requiresAuth: true, closable: true },
      },
    ],
  },
  {
    path: "/system/department",
    component: SysLayout,
    children: [
      {
        path: "",
        component: () => import("@/views/system/department/index.vue"),
        meta: {
          title: "",
          icon: "collection",
          keepAlive: true,
          requiresAuth: true,
          allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] 
        },
      },
    ],
  },
  {
    path: "/system/role",
    component: SysLayout,
    children: [
      {
        path: "",
        component: () => import("@/views/system/role/index.vue"),
        meta: {
          title: "role",
          icon: "collection",
          keepAlive: true,
          requiresAuth: true,
          allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] 
        },
      },
    ],
  },
  {
    path: "/system/admin",
    component: SysLayout,
    children: [
      {
        path: "",
        component: () => import("@/views/system/admin/index.vue"),
        meta: {
          title: "admin",
          icon: "collection",
          keepAlive: true,
          requiresAuth: true,
          allowedUserTypes: [UserType.CorpOwmer, UserType.CorpAdmin] 
        },
      },
    ],
  },
  {
    path: "/system/:formId",
    component: SysLayout,
    redirect: "/system/$route.params.formId",
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
    path: "/app/:appId/form/:formId",
    component: AppLayout,
    redirect: "/app/$route.params.appId/form/$route.params.formId",
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
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人中心", icon: "user", hidden: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "/app/:appId/mytasks",
    component: AppLayout,
    redirect: "/app/$route.params.appId/mytasks",
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
    redirect: "/app/$route.params.appId/mystarted",
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
    redirect: "/app/$route.params.appId/myapproved",
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
    redirect: "/app/$route.params.appId/cctome",
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