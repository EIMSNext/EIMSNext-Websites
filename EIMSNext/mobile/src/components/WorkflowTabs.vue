<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">流程中心</div>
      <div class="header-right"></div>
    </div>
    <div class="page-main">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="待办" name="todo">
          <div class="todo-list">
            <van-pull-refresh v-model="refreshing" @refresh="loadTodo">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                @load="loadMore"
              >
                <div
                  v-for="task in tasks"
                  :key="task.id"
                  class="task-item"
                  @click="goToApproval(task)"
                >
                  <div class="task-header">
                    <div class="task-form-name">{{ task.formName }}</div>
                    <div class="task-node">{{ task.approveNodeName }}</div>
                  </div>
                  <div class="task-content">
                    <div class="task-creator">{{ task.starter?.label }}</div>
                    <div class="task-time">{{ task.approveNodeStartTime }}</div>
                  </div>
                  <div class="task-brief">
                    <div
                      v-for="item in task.dataBrief?.slice(0, 3)"
                      :key="item.field"
                      class="brief-item"
                    >
                      {{ item.title }}: {{ item.value }}
                    </div>
                  </div>
                </div>
                <div v-if="tasks.length === 0 && !loading" class="empty-tip">
                  暂无待办
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>
        <van-tab title="我发起的" name="started">
          <div class="todo-list">
            <van-list
              v-model:loading="loadingStarted"
              :finished="finishedStarted"
              @load="loadStartedMore"
            >
              <div
                v-for="task in startedTasks"
                :key="task.id"
                class="task-item"
                @click="goToDetail(task)"
              >
                <div class="task-header">
                  <div class="task-form-name">{{ task.formName }}</div>
                </div>
                <div class="task-content">
                  <div class="task-time">{{ task.createTime }}</div>
                </div>
              </div>
              <div v-if="startedTasks.length === 0 && !loadingStarted" class="empty-tip">
                暂无数据
              </div>
            </van-list>
          </div>
        </van-tab>
        <van-tab title="我已审批" name="approved">
          <div class="todo-list">
            <van-list
              v-model:loading="loadingApproved"
              :finished="finishedApproved"
              @load="loadApprovedMore"
            >
              <div
                v-for="task in approvedTasks"
                :key="task.id"
                class="task-item"
                @click="goToDetail(task)"
              >
                <div class="task-header">
                  <div class="task-form-name">{{ task.formName }}</div>
                </div>
                <div class="task-content">
                  <div class="task-time">{{ (task as any).approveTime }}</div>
                </div>
              </div>
              <div v-if="approvedTasks.length === 0 && !loadingApproved" class="empty-tip">
                暂无数据
              </div>
            </van-list>
          </div>
        </van-tab>
        <van-tab title="抄送我的" name="cced">
          <div class="todo-list">
            <van-list
              v-model:loading="loadingCced"
              :finished="finishedCced"
              @load="loadCcedMore"
            >
              <div
                v-for="task in ccedTasks"
                :key="task.id"
                class="task-item"
                @click="goToDetail(task)"
              >
                <div class="task-header">
                  <div class="task-form-name">{{ task.formName }}</div>
                </div>
                <div class="task-content">
                  <div class="task-time">{{ task.createTime }}</div>
                </div>
              </div>
              <div v-if="ccedTasks.length === 0 && !loadingCced" class="empty-tip">
                暂无数据
              </div>
            </van-list>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { WfTodo } from '@eimsnext/models'
import { todoServiceMobile, workflowServiceMobile } from '@/services/mobileService'

const router = useRouter()
const route = useRoute()
const appId = route.params.appId as string

const activeTab = ref('todo')
const refreshing = ref(false)
const loading = ref(false)
const loadingStarted = ref(false)
const loadingApproved = ref(false)
const loadingCced = ref(false)
const finished = ref(false)
const finishedStarted = ref(false)
const finishedApproved = ref(false)
const finishedCced = ref(false)

const tasks = ref<WfTodo[]>([])
const startedTasks = ref<WfTodo[]>([])
const approvedTasks = ref<WfTodo[]>([])
const ccedTasks = ref<WfTodo[]>([])

const skip = ref(0)
const startedSkip = ref(0)
const approvedSkip = ref(0)
const ccedSkip = ref(0)

const goBack = () => {
  router.back()
}

const goToApproval = (task: WfTodo) => {
  router.push(`/wftodo/${task.id}`)
}

const goToDetail = (task: WfTodo) => {
  router.push(`/app/${task.appId}/form/${task.formId}/${task.id}`)
}

const onTabChange = () => {
  if (activeTab.value === 'todo') {
    loadTodo()
  } else if (activeTab.value === 'started') {
    loadStarted()
  } else if (activeTab.value === 'approved') {
    loadApproved()
  } else if (activeTab.value === 'cced') {
    loadCced()
  }
}

const loadTodo = async () => {
  loading.value = true
  skip.value = 0
  tasks.value = await todoServiceMobile.query(appId || '', 0)
  finished.value = true
  loading.value = false
  refreshing.value = false
}

const loadMore = async () => {
  skip.value += 10
  const more = await todoServiceMobile.query(appId || '', skip.value)
  tasks.value = [...tasks.value, ...more]
  if (more.length < 10) finished.value = true
  loading.value = false
}

const loadStarted = async () => {
  loadingStarted.value = true
  startedSkip.value = 0
  startedTasks.value = await workflowServiceMobile.getMyStarted(0)
  finishedStarted.value = true
  loadingStarted.value = false
}

const loadStartedMore = async () => {
  startedSkip.value += 10
  const more = await workflowServiceMobile.getMyStarted(startedSkip.value)
  startedTasks.value = [...startedTasks.value, ...more]
  if (more.length < 10) finishedStarted.value = true
  loadingStarted.value = false
}

const loadApproved = async () => {
  loadingApproved.value = true
  approvedSkip.value = 0
  approvedTasks.value = await workflowServiceMobile.getApproved(0)
  finishedApproved.value = true
  loadingApproved.value = false
}

const loadApprovedMore = async () => {
  approvedSkip.value += 10
  const more = await workflowServiceMobile.getApproved(approvedSkip.value)
  approvedTasks.value = [...approvedTasks.value, ...more]
  if (more.length < 10) finishedApproved.value = true
  loadingApproved.value = false
}

const loadCced = async () => {
  loadingCced.value = true
  ccedSkip.value = 0
  ccedTasks.value = await workflowServiceMobile.getCced(0)
  finishedCced.value = true
  loadingCced.value = false
}

const loadCcedMore = async () => {
  ccedSkip.value += 10
  const more = await workflowServiceMobile.getCced(ccedSkip.value)
  ccedTasks.value = [...ccedTasks.value, ...more]
  if (more.length < 10) finishedCced.value = true
  loadingCced.value = false
}

onMounted(() => {
  loadTodo()
})
</script>

<style lang="scss" scoped>
.todo-list {
  min-height: 300px;
  padding: 12px;
}

.task-item {
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;

  .task-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .task-form-name {
      font-size: 14px;
      font-weight: 500;
      color: #323233;
    }

    .task-node {
      font-size: 12px;
      color: #969799;
    }
  }

  .task-content {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #969799;
    margin-bottom: 8px;
  }

  .task-brief {
    font-size: 12px;
    color: #646566;

    .brief-item {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.empty-tip {
  padding: 40px 0;
  text-align: center;
  color: #969799;
}
</style>