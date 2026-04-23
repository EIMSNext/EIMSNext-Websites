<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">{{ app?.name || '表单' }}</div>
      <div class="header-right"></div>
    </div>
    <div class="page-main">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="表单列表" name="forms">
          <div class="form-list">
            <van-pull-refresh v-model="refreshing" @refresh="loadForms">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                @load="loadMore"
              >
                <div
                  v-for="form in forms"
                  :key="form.id"
                  class="form-item"
                  @click="goToFormData(form)"
                >
                  <div class="form-icon">
                    <van-icon name="description" size="24" />
                  </div>
                  <div class="form-info">
                    <div class="form-name">{{ form.name }}</div>
                  </div>
                  <van-icon name="arrow" />
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>
        <van-tab title="流程中心" name="workflow">
          <div class="workflow-content">
            <van-tabs v-model:active="workflowTab" @change="onWorkflowTabChange">
              <van-tab title="待办" name="todo">
                <div class="todo-list">
                  <van-list
                    v-model:loading="wfLoading"
                    :finished="wfFinished"
                    @load="loadWorkflowMore"
                  >
                    <div
                      v-for="task in workflowTasks"
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
                  </van-list>
                </div>
              </van-tab>
              <van-tab title="我发起的" name="started">
                <div class="empty-tip">暂无数据</div>
              </van-tab>
              <van-tab title="我已审批" name="approved">
                <div class="empty-tip">暂无数据</div>
              </van-tab>
              <van-tab title="抄送我的" name="cced">
                <div class="empty-tip">暂无数据</div>
              </van-tab>
            </van-tabs>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormDef, App, WfTodo } from '@eimsnext/models'
import { appServiceMobile, formServiceMobile, todoServiceMobile } from '@/services/mobileService'

const router = useRouter()
const route = useRoute()
const appId = route.params.appId as string

const activeTab = ref('forms')
const workflowTab = ref('todo')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const wfLoading = ref(false)
const wfFinished = ref(false)

const app = ref<App>()
const forms = ref<FormDef[]>([])
const workflowTasks = ref<WfTodo[]>([])
const formSkip = ref(0)
const wfSkip = ref(0)

const goBack = () => {
  router.back()
}

const goToFormData = (form: FormDef) => {
  router.push(`/app/${appId}/form/${form.id}`)
}

const goToApproval = (task: WfTodo) => {
  router.push(`/wftodo/${task.id}`)
}

const loadApp = async () => {
  app.value = await appServiceMobile.get(appId)
}

const loadForms = async () => {
  forms.value = await formServiceMobile.query(appId, 0)
  finished.value = true
  refreshing.value = false
}

const loadMore = async () => {
  formSkip.value += 20
  const more = await formServiceMobile.query(appId, formSkip.value)
  forms.value = [...forms.value, ...more]
  if (more.length < 20) finished.value = true
  loading.value = false
}

const loadWorkflowTasks = async () => {
  workflowTasks.value = await todoServiceMobile.query(appId, 0)
  wfFinished.value = true
}

const loadWorkflowMore = async () => {
  wfSkip.value += 10
  const more = await todoServiceMobile.query(appId, wfSkip.value)
  workflowTasks.value = [...workflowTasks.value, ...more]
  if (more.length < 10) wfFinished.value = true
  wfLoading.value = false
}

const onWorkflowTabChange = () => {
  if (workflowTab.value === 'todo') {
    loadWorkflowTasks()
  }
}

onMounted(() => {
  loadApp()
  loadForms()
})
</script>

<style lang="scss" scoped>
.form-list {
  min-height: 300px;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
  gap: 12px;

  .form-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 6px;
    color: #646566;
  }

  .form-info {
    flex: 1;
    overflow: hidden;

    .form-name {
      font-size: 14px;
      color: #323233;
    }
  }
}

.workflow-content {
  min-height: 300px;
}

.todo-list {
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