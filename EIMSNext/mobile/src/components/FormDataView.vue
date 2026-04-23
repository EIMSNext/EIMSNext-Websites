<template>
  <MobilePage :title="isAdd ? '新增数据' : '数据详情'" @back="goBack">
    <div class="detail-page">
      <div v-if="loading" class="loading-wrap">加载中...</div>
      <div v-else class="detail-card mobile-card">
        <div class="detail-title">{{ formDef?.name }}</div>

        <MobileFormRenderer
          v-if="renderRule.length > 0"
          v-model="formData"
          :rule="renderRule"
          :option="renderOption"
        />

        <div v-else class="json-fallback">{{ JSON.stringify(formData, null, 2) }}</div>
      </div>
    </div>

    <template #footer>
      <div v-if="isAdd || editing" class="detail-footer-actions">
        <van-button block type="primary" :loading="saving" @click="handleSave">保存</van-button>
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import type { FormDef } from "@eimsnext/models";
import MobileFormRenderer from "@/components/form/MobileFormRenderer.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataServiceMobile, formServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const formId = route.params.formId as string;
const dataId = route.params.dataId as string | undefined;

const loading = ref(false);
const saving = ref(false);
const editing = ref(true);
const formDef = ref<FormDef>();
const formData = ref<Record<string, unknown>>({});

const isAdd = computed(() => !dataId || Boolean(route.meta.isAdd));
const renderRule = computed(() => formDef.value?.content?.items || []);
const renderOption = computed(() => ({
  submitBtn: false,
  resetBtn: false,
  form: { labelPosition: "top" },
}));

const goBack = () => router.back();

const handleSave = async () => {
  saving.value = true;
  try {
    if (isAdd.value) {
      await formDataServiceMobile.post(formId, formData.value);
    } else if (dataId) {
      await formDataServiceMobile.put(dataId, formData.value);
    }
    showToast("保存成功");
    router.back();
  } catch {
    showToast("保存失败");
  } finally {
    saving.value = false;
  }
};

const loadData = async () => {
  loading.value = true;
  formDef.value = await formServiceMobile.get(formId);
  if (!isAdd.value && dataId) {
    const data = await formDataServiceMobile.get(dataId);
    formData.value = data.data || {};
  }
  loading.value = false;
};

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.detail-page {
  padding: 12px;
}

.loading-wrap {
  padding: 40px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
}

.detail-card {
  padding: 16px;
}

.detail-title {
  margin-bottom: 12px;
  color: var(--mobile-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.json-fallback {
  color: var(--mobile-text-secondary);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-footer-actions {
  padding: 12px 16px;
}
</style>
