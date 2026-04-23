<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">{{ isAdd ? '新增' : '详情' }}</div>
      <div class="header-right">
        <van-button
          v-if="!isAdd && canEdit"
          size="small"
          type="primary"
          @click="handleEdit"
        >
          编辑
        </van-button>
      </div>
    </div>
    <div class="page-main">
      <van-loading v-if="loading" class="form-loading" />
      <div v-else-if="formDef" class="form-content">
        <div class="form-title">{{ formDef.name }}</div>
        <div class="form-data">{{ JSON.stringify(formData) }}</div>
      </div>
    </div>
    <div v-if="isAdd || editing" class="page-footer">
      <van-button block type="primary" :loading="saving" @click="handleSave">
        保存
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import type { FormDef } from '@eimsnext/models'
import { formServiceMobile, formDataServiceMobile } from '@/services/mobileService'

const router = useRouter()
const route = useRoute()
const formId = route.params.formId as string
const dataId = route.params.dataId as string

const loading = ref(false)
const saving = ref(false)
const editing = ref(false)

const isAdd = computed(() => !dataId || route.meta.isAdd)

const formDef = ref<FormDef>()
const formData = ref<Record<string, any>>({})
const canEdit = ref(true)

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  editing.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (isAdd.value) {
      await formDataServiceMobile.post(formId, formData.value)
    } else {
      await formDataServiceMobile.put(dataId, formData.value)
    }
    showToast('保存成功')
    router.back()
  } catch {
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

const loadForm = async () => {
  loading.value = true
  try {
    formDef.value = await formServiceMobile.get(formId)
  } catch {
    formDef.value = undefined
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  if (isAdd.value) return
  loading.value = true
  try {
    const data = await formDataServiceMobile.get(dataId)
    formData.value = data.data || {}
  } catch {
    formData.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadForm()
  if (!isAdd.value) {
    await loadData()
  }
})
</script>

<style lang="scss" scoped>
.form-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.form-content {
  padding: 16px;
  background: #fff;

  .form-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .form-data {
    font-size: 12px;
    color: #666;
    word-break: break-all;
  }
}
</style>