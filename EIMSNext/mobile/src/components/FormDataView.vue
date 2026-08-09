<template>
  <MobilePage :title="isAdd ? t('mobile.formData.addTitle') : t('mobile.formData.detailTitle')" @back="goBack">
    <div class="detail-page">
      <div v-if="loading" class="loading-wrap">{{ t("common.loading") }}</div>
      <van-empty v-else-if="loadError" image="error" :description="t('admin.formData.dataNotAvailable')">
        <van-button size="small" @click="goBack">{{ t("common.back") }}</van-button>
      </van-empty>
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
        <van-button block :loading="saving" @click="() => handleSave()">{{ t("common.save") }}</van-button>
        <van-button
          v-if="isAdd && formDef?.usingWorkflow"
          block
          type="primary"
          :loading="saving"
          @click="handleSubmit"
        >{{ t("common.submit") }}</van-button>
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { useI18n } from "vue-i18n";
import { DataAction, type FormData, type FormDef } from "@eimsnext/models";
import FormCreateMobile from "@eimsnext/form-render-vant";
import MobileFormRenderer from "@/components/form/MobileFormRenderer.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataServiceMobile, formServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const formId = route.params.formId as string;
const dataId = route.params.dataId as string | undefined;

const loading = ref(false);
const saving = ref(false);
const editing = ref(true);
const formDef = ref<FormDef>();
const formData = ref<Record<string, unknown>>({});
const currentData = ref<FormData>();
const loadError = ref(false);

const isAdd = computed(() => !dataId || Boolean(route.meta.isAdd));
const renderRule = computed(() => {
  const layout = formDef.value?.content?.layout;
  if (!layout) return [];
  try {
    return reactive(FormCreateMobile.parseJson(layout));
  } catch {
    return [];
  }
});
const renderOption = computed(() => ({
  submitBtn: false,
  resetBtn: false,
  form: { labelPosition: "top" },
}));

const goBack = () => router.back();

const handleSave = async (action = DataAction.Save) => {
  saving.value = true;
  try {
    if (isAdd.value && formDef.value) {
      await formDataServiceMobile.post(formDef.value, formData.value, action);
    } else if (currentData.value) {
      await formDataServiceMobile.put(currentData.value, formData.value);
    }
    showToast(t("common.saveSuccess"));
    router.back();
  } catch {
    showToast(t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
};

const handleSubmit = () => handleSave(DataAction.Submit);

const loadData = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    formDef.value = await formServiceMobile.get(formId);
    if (!formDef.value) throw new Error("Form definition is unavailable");
    if (!isAdd.value && dataId) {
      const data = await formDataServiceMobile.get(dataId);
      if (!data) throw new Error("Form data is unavailable");
      currentData.value = data;
      formData.value = data.data || {};
    }
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
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
