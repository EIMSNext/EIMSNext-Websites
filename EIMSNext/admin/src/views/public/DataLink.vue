<template>
  <div class="public-page">
    <component :is="renderToolbar" />

    <div v-if="loading" class="public-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("common.loading") }}</span>
    </div>

    <PublicNotFound
      v-else-if="!formId || !dataId"
      :description="t('publicpublish.dataNotAvailable')"
    />

    <PublicDataView
      v-else
      :key="`${formId}:${dataId}`"
      mode="page"
      :form-id="formId"
      :data-id="dataId"
      :public-http="publicHttp"
    />
  </div>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import { PublicScope } from "@eimsnext/models";
import {
  PublicNotFound,
  bootstrapWithToken,
  renderPrintFullscreenToolbar,
  usePublicHttp,
} from "./shared";
import PublicDataView from "./PublicDataView.vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "DataLinkView" });

const route = useRoute();
const { t } = useI18n();
const formId = computed(() => route.params.formId?.toString() || "");
const dataId = computed(() => route.params.dataId?.toString() || "");

const loading = ref(false);
const publicHttp = usePublicHttp();

const renderToolbar = () => renderPrintFullscreenToolbar();

watch(
  [formId, dataId],
  async ([fid, did]) => {
    if (!fid || !did) return;
    await bootstrap();
  },
  { immediate: true }
);

async function bootstrap() {
  loading.value = true;

  try {
    if (!publicHttp.token.value) {
      await bootstrapWithToken(publicHttp, formId.value, PublicScope.DataLink);
    }
  } catch (err: any) {
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss"></style>
