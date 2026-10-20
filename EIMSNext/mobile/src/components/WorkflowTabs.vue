<template>
  <MobilePage v-if="!embedded" :title="t('mobile.workflow.title')" @back="goBack">
    <div class="workflow-page">
      <InnerWorkflowTabs
        :active-tab="activeTab"
        :app-id="appId"
        @change-tab="handleTabChange"
        @open-approval="goToApproval"
        @open-detail="goToDetail"
      />
    </div>
  </MobilePage>

  <div v-else class="workflow-page embedded-workflow">
    <InnerWorkflowTabs
      :active-tab="activeTab"
      :app-id="appId"
      @change-tab="handleTabChange"
      @open-approval="goToApproval"
      @open-detail="goToDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { WorkflowTaskItem } from "@/services/mobileService";
import MobilePage from "@/components/base/MobilePage.vue";
import InnerWorkflowTabs from "@/components/workflow/InnerWorkflowTabs.vue";

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
    appId?: string;
  }>(),
  {
    embedded: false,
    appId: "",
  }
);

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const appId = computed(() => props.appId || (route.params.appId as string) || "");
const activeTab = ref<string>((route.query.tab as string) || "task");

const goBack = () => router.back();
const goToApproval = (item: WorkflowTaskItem) => router.push(`/wftask/${item.id}`);
const goToDetail = (item: WorkflowTaskItem) => router.push(`/app/${item.appId}/form/${item.formId}/${item.dataId}`);
const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  // tab 落 URL query：刷新/分享后仍定位到当前 tab（嵌入 FormList 的页不污染宿主路由）
  if (!props.embedded) {
    router.replace({ path: route.path, query: { ...route.query, tab } });
  }
};

watch(
  () => route.query.tab,
  (value) => {
    if (typeof value === "string" && value) activeTab.value = value;
  }
);

</script>

<style scoped lang="scss">
.workflow-page {
  height: 100%;
}

.embedded-workflow {
  padding-bottom: 16px;
}
</style>
