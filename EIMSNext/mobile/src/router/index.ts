import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { appSetting } from '@eimsnext/utils'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('@/components/Workspace.vue'),
    meta: { title: '工作台', requireAuth: true }
  },
  {
    path: '/app/:appId',
    name: 'FormList',
    component: () => import('@/components/FormList.vue'),
    meta: { title: '表单', requireAuth: true }
  },
  {
    path: '/app/:appId/form/:formId',
    name: 'FormDataList',
    component: () => import('@/components/FormDataList.vue'),
    meta: { title: '数据', requireAuth: true }
  },
  {
    path: '/app/:appId/form/:formId/add',
    name: 'FormDataAdd',
    component: () => import('@/components/FormDataView.vue'),
    meta: { title: '新增', requireAuth: true, isAdd: true }
  },
  {
    path: '/app/:appId/form/:formId/:dataId',
    name: 'FormDataView',
    component: () => import('@/components/FormDataView.vue'),
    meta: { title: '详情', requireAuth: true }
  },
  {
    path: '/wftodo',
    name: 'WorkflowTabs',
    component: () => import('@/components/WorkflowTabs.vue'),
    meta: { title: '流程中心', requireAuth: true }
  },
  {
    path: '/wftodo/:taskId',
    name: 'WfApproval',
    component: () => import('@/components/WfApproval.vue'),
    meta: { title: '审批', requireAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem(appSetting.tokenKey || 'jat')
  if (to.meta.requireAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
