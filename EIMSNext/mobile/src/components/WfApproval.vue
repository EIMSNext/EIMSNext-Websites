<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">{{ task?.formName || '审批' }}</div>
      <div class="header-right"></div>
    </div>
    <div class="page-main">
      <van-loading v-if="loading" class="loading" />
      <template v-else-if="task">
        <div class="task-info">
          <div class="info-item">
            <span class="label">当前节点：</span>
            <span class="value">{{ task.approveNodeName }}</span>
          </div>
          <div class="info-item">
            <span class="label">提交人：</span>
            <span class="value">{{ task.starter?.label }}</span>
          </div>
          <div class="info-item">
            <span class="label">提交时间：</span>
            <span class="value">{{ task.approveNodeStartTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">表单数据：</span>
            <span class="value">{{ JSON.stringify(task.data || {}) }}</span>
          </div>
        </div>
      </template>
    </div>
    <div class="page-footer">
      <van-button block type="danger" :loading="approving" @click="handleReject">
        拒绝
      </van-button>
      <van-button block type="primary" :loading="approving" @click="handleApprove">
        同意
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import type { WfTodo } from '@eimsnext/models'
import { todoServiceMobile } from '@/services/mobileService'

const router = useRouter()
const route = useRoute()
const taskId = route.params.taskId as string

const loading = ref(false)
const approving = ref(false)

const task = ref<WfTodo & { data?: any }>()

const goBack = () => {
  router.back()
}

const handleApprove = async () => {
  approving.value = true
  try {
    await todoServiceMobile.approve(taskId, 'approve', '')
    showToast('审批通过')
    router.back()
  } catch {
    showToast('操作失败')
  } finally {
    approving.value = false
  }
}

const handleReject = async () => {
  approving.value = true
  try {
    await todoServiceMobile.approve(taskId, 'reject', '')
    showToast('已拒绝')
    router.back()
  } catch {
    showToast('操作失败')
  } finally {
    approving.value = false
  }
}

const loadTask = async () => {
  loading.value = true
  try {
    task.value = await todoServiceMobile.get(taskId) as unknown as WfTodo & { data?: any }
  } catch {
    task.value = undefined
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTask()
})
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.task-info {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;

  .info-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 14px;

    .label {
      color: #646566;
      margin-right: 8px;
    }

    .value {
      color: #323233;
      flex: 1;
      word-break: break-all;
    }
  }
}

.page-footer {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;
}
</style>