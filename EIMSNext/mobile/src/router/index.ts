import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { appSetting } from '@eimsnext/utils'
import { useUserStoreHook } from '@eimsnext/store'
import { applyCorpThemeIfNeeded } from '@/theme'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
    meta: { titleKey: 'mobile.login.title' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('@/components/Workbench.vue'),
    meta: { titleKey: 'mobile.workbench.title', requireAuth: true }
  },
  {
    path: '/app/:appId',
    name: 'FormList',
    component: () => import('@/components/FormList.vue'),
    meta: { titleKey: 'mobile.formList.fallbackTitle', requireAuth: true }
  },
  {
    path: '/app/:appId/form/:formId',
    name: 'FormDataList',
    component: () => import('@/components/FormDataList.vue'),
    meta: { titleKey: 'admin.formListView.dataList', requireAuth: true }
  },
  {
    path: '/app/:appId/form/:formId/add',
    name: 'FormDataAdd',
    component: () => import('@/components/FormDataView.vue'),
    meta: { titleKey: 'mobile.formData.addTitle', requireAuth: true, isAdd: true }
  },
  {
    path: '/app/:appId/form/:formId/:dataId',
    name: 'FormDataView',
    component: () => import('@/components/FormDataView.vue'),
    meta: { titleKey: 'mobile.formData.detailTitle', requireAuth: true }
  },
  {
    path: '/wftask',
    name: 'WorkflowTabs',
    component: () => import('@/components/WorkflowTabs.vue'),
    meta: { titleKey: 'mobile.workflow.title', requireAuth: true }
  },
  {
    path: '/wftask/:taskId',
    name: 'WfApproval',
    component: () => import('@/components/WfApproval.vue'),
    meta: { titleKey: 'mobile.approval.title', requireAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/NotFound.vue'),
    meta: { titleKey: 'mobile.notFound.title' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 每个登录会话只读取一次企业主题色
let corpThemeApplied = false
// 每个登录会话只校验一次登录态（token 过期时服务端会返回 401）
let sessionChecked = false

const toLogin = (redirect: string) => ({
  path: '/login',
  query: { redirect },
  replace: true
})

router.beforeEach(async (to) => {
  const token = localStorage.getItem(appSetting.tokenKey || 'jat')

  if (to.path === '/login') {
    corpThemeApplied = false
    sessionChecked = false
  }

  if (to.meta.requireAuth && !token) {
    corpThemeApplied = false
    sessionChecked = false
    return toLogin(to.fullPath)
  }

  // token 可能已过期，进入受保护页面前用一次 getCurrentUser 校验有效性，
  // 与 PC 端登录后 userStore.initialize() 的机制保持一致
  if (token && to.meta.requireAuth && !sessionChecked) {
    try {
      await useUserStoreHook().initialize(true)
      sessionChecked = true
    } catch {
      localStorage.removeItem(appSetting.tokenKey || 'jat')
      corpThemeApplied = false
      sessionChecked = false
      return toLogin(to.fullPath)
    }
  }

  if (token && to.meta.requireAuth && !corpThemeApplied) {
    corpThemeApplied = true
    await applyCorpThemeIfNeeded()
  }
})

export default router
