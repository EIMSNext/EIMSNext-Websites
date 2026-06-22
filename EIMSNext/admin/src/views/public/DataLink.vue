<template>
  <div class="public-page">
    <component :is="renderToolbar" />

    <div v-if="loading" class="public-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("common.loading") }}</span>
    </div>

    <div v-else-if="accessCodeGate" class="access-code-gate">
      <el-card class="access-code-card">
        <h3>{{ t("publicpublish.accessCodeGateTitle") }}</h3>
        <el-input
          v-model="accessCodeInput"
          type="password"
          :placeholder="t('publicpublish.accessCodePlaceholder')"
          @keyup.enter="submitAccessCode"
        />
        <el-button type="primary" :loading="accessCodeSubmitting" @click="submitAccessCode">
          {{ t("common.confirm") }}
        </el-button>
        <p v-if="accessCodeError" class="access-code-error">{{ t("publicpublish.accessCodeInvalid") }}</p>
      </el-card>
    </div>

    <PublicNotFound v-else-if="!formId || !dataId" :description="t('publicpublish.dataNotAvailable')" />

    <PublicDataView
      v-else
      :key="`${formId}:${dataId}`"
      mode="page"
      :form-id="formId"
      :data-id="dataId"
    />
  </div>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import { PublicScope } from "@eimsnext/models";
import { PublicNotFound, bootstrapWithToken, renderPrintFullscreenToolbar, toAccessCodeError, usePublicHttp } from "./shared";
import PublicDataView from "./PublicDataView.vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "DataLinkView" });

const route = useRoute();
const { t } = useI18n();
const formId = computed(() => route.params.formId?.toString() || "");
const dataId = computed(() => route.params.dataId?.toString() || "");

const loading = ref(false);
const accessCodeGate = ref(false);
const accessCodeInput = ref("");
const accessCodeSubmitting = ref(false);
const accessCodeError = ref(false);

const publicHttp = usePublicHttp();

const renderToolbar = () => renderPrintFullscreenToolbar();

watch(
  [formId, dataId],
  async ([fid, did]) => {
    if (!fid || !did) return;
    await bootstrap();
  },
  { immediate: true },
);

async function bootstrap(accessCode?: string) {
  loading.value = true;
  accessCodeError.value = false;
  try {
    if (!publicHttp.token.value) {
      await bootstrapWithToken(publicHttp, formId.value, PublicScope.DataLink, accessCode);
    }
    accessCodeGate.value = false;
  } catch (err: any) {
    if (toAccessCodeError(err)) {
      accessCodeGate.value = true;
      accessCodeError.value = !!accessCode;
    }
  } finally {
    loading.value = false;
  }
}

async function submitAccessCode() {
  if (!accessCodeInput.value) return;
  accessCodeSubmitting.value = true;
  try {
    await bootstrap(accessCodeInput.value);
  } finally {
    accessCodeSubmitting.value = false;
  }
}
</script>

<style scoped lang="scss"></style>
