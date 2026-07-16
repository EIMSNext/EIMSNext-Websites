import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { appSetting } from '@eimsnext/utils'

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
    path: '/wftodo',
    name: 'WorkflowTabs',
    component: () => import('@/components/WorkflowTabs.vue'),
    meta: { titleKey: 'mobile.workflow.title', requireAuth: true }
  },
  {
    path: '/wftodo/:taskId',
    name: 'WfApproval',
    component: () => import('@/components/WfApproval.vue'),
    meta: { titleKey: 'mobile.approval.title', requireAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem(appSetting.tokenKey || 'jat')
  if (to.meta.requireAuth && !token) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true
    }
  }
})

export default router
