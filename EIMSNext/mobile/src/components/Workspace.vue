<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">{{ t('workspace.title') }}</div>
      <div class="header-right"></div>
    </div>
    <div class="page-main">
      <div class="workspace-content">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="todo-card" @click="goToMyTasks">
            <div class="todo-left">
              <div class="todo-icon">
                <van-icon name="clock" size="32" />
              </div>
              <div class="todo-info">
                <div class="todo-title">{{ t('workspace.myTasks') }}</div>
                <div class="todo-count">{{ todoCount }}</div>
              </div>
            </div>
            <van-icon name="arrow" />
          </div>
          
          <div class="quick-actions">
            <div class="action-item" @click="goToMyStarted">
              <van-icon name="orders-o" />
              <span>{{ t('workspace.myStarted') }}</span>
            </div>
            <div class="action-item" @click="goToMyApproved">
              <van-icon name="passed" />
              <span>{{ t('workspace.myApproved') }}</span>
            </div>
            <div class="action-item" @click="goToMyCced">
              <van-icon name="share" />
              <span>{{ t('workspace.cctome') }}</span>
            </div>
          </div>

          <div class="apps-section">
            <div class="section-title">{{ t('workspace.myApps') }}</div>
            <div class="apps-grid">
              <div
                v-for="app in apps"
                :key="app.id"
                class="app-item"
                @click="gotoApp(app)"
              >
                <div class="app-icon">
                  <img v-if="app.icon" :src="app.icon" alt="" />
                  <van-icon v-else name="app-o" size="28" />
                </div>
                <div class="app-name">{{ app.name }}</div>
              </div>
            </div>
          </div>
        </van-pull-refresh>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { App } from '@eimsnext/models'
import { appServiceMobile, todoServiceMobile } from '@/services/mobileService'

const router = useRouter()

const t = (key: string) => {
  const translations: Record<string, string> = {
    'workspace.title': '工作台',
    'workspace.myTasks': '待办',
    'workspace.myStarted': '我发起的',
    'workspace.myApproved': '我已审批',
    'workspace.cctome': '抄送我的',
    'workspace.myApps': '我的应用'
  }
  return translations[key] || key
}

const refreshing = ref(false)
const todoCount = ref(0)
const apps = ref<App[]>([])

const goBack = () => {
  router.back()
}

const goToMyTasks = () => {
  router.push('/wftodo')
}

const goToMyStarted = () => {
  router.push('/wftodo?tab=started')
}

const goToMyApproved = () => {
  router.push('/wftodo?tab=approved')
}

const goToMyCced = () => {
  router.push('/wftodo?tab=cced')
}

const gotoApp = (app: App) => {
  router.push(`/app/${app.id}`)
}

const onRefresh = async () => {
  await Promise.all([loadTodoCount(), loadApps()])
  refreshing.value = false
}

const loadTodoCount = async () => {
  todoCount.value = await todoServiceMobile.getCount()
}

const loadApps = async () => {
  apps.value = await appServiceMobile.getMyApps()
}

onMounted(() => {
  loadTodoCount()
  loadApps()
})
</script>

<style lang="scss" scoped>
.workspace-content {
  padding: 12px;
}

.todo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;

  .todo-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .todo-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e7f3ff;
    border-radius: 8px;
    color: #1989fa;
  }

  .todo-info {
    .todo-title {
      font-size: 14px;
      color: #646566;
      margin-bottom: 4px;
    }

    .todo-count {
      font-size: 24px;
      font-weight: 600;
      color: #323233;
    }
  }
}

.quick-actions {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 12px 0;

  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #646566;
  }
}

.apps-section {
  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 12px;
  }

  .apps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;

    .app-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .app-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .app-name {
        font-size: 12px;
        color: #323233;
        text-align: center;
        word-break: break-word;
      }
    }
  }
}
</style>