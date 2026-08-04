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
import type { WfTodo } from "@eimsnext/models";
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
const activeTab = ref<string>((route.query.tab as string) || "todo");

const goBack = () => router.back();
const goToApproval = (task: WfTodo) => router.push(`/wftodo/${task.id}`);
const goToDetail = (task: WfTodo) => router.push(`/app/${task.appId}/form/${task.formId}/${task.dataId}`);
const handleTabChange = (tab: string) => {
  activeTab.value = tab;
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

.workflow-list-wrap {
  padding: 12px;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workflow-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.workflow-form-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--mobile-text-primary);
}

.workflow-time,
.workflow-node,
.workflow-starter,
.workflow-brief {
  font-size: 12px;
  color: var(--mobile-text-secondary);
}

.workflow-node {
  margin-bottom: 6px;
}

.workflow-starter {
  margin-bottom: 6px;
}

.workflow-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
}
</style>
