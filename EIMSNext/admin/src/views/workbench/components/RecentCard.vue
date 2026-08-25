<template>
  <et-card :title="t('admin.workbench.recent')" class="workbench-list-card" data-workbench-card-root>
    <template #header>
      <div class="workbench-card-header" :class="{ 'design-header': designMode }" @mousedown.stop>
        <span class="workbench-card-title">{{ t("admin.workbench.recent") }}</span>
        <button v-if="designMode && removable" type="button" class="workbench-card-delete no-drag" :title="t('common.delete')" @click.stop="$emit('remove')"><et-icon icon="el-delete" size="16px" /></button>
      </div>
    </template>
    <div v-if="designMode" class="workbench-empty design-empty" data-workbench-height-content>{{ t("admin.workbench.recentEmpty") }}</div>
    <div v-else-if="recent.length" class="workbench-list" data-workbench-height-content>
      <div v-for="item in recent" :key="`${item.targetType}:${item.targetId}`" class="workbench-list-item" @click="openItem(item)">
        <div class="workbench-list-icon" :style="{ backgroundColor: item.iconColor || 'var(--et-color-info)' }">
          <et-icon :icon="item.icon || defaultIcon(item.targetType)" />
        </div>
        <div class="workbench-list-main">
          <div class="workbench-list-title" :title="item.title">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div v-else class="workbench-empty" data-workbench-height-content>
      {{ t("admin.workbench.recentEmpty") }}
    </div>
  </et-card>
</template>

<script setup lang="ts">
import type { WorkbenchRecentVisit, WorkbenchTargetType } from "@eimsnext/models";
import { useContextStore } from "@eimsnext/store";
import { workbenchRecentVisitService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "WorkbenchRecentCard",
});

const router = useRouter();
const { t } = useI18n();
const contextStore = useContextStore();
const recent = ref<WorkbenchRecentVisit[]>([]);
const props = withDefaults(defineProps<{ designMode?: boolean; removable?: boolean }>(), { designMode: false, removable: false });
defineEmits<{ (e: "remove"): void }>();

const defaultIcon = (targetType: WorkbenchTargetType) => {
  if (targetType === "dashboard") return "el-DataAnalysis";
  return "el-document";
};

const openItem = async (item: WorkbenchRecentVisit) => {
  if (item.appId) {
    await contextStore.setAppId(item.appId);
  }

  if (item.targetType === "dashboard") {
    router.push(`/app/${item.appId}/dash/${item.targetId}`);
    return;
  }

  router.push(`/app/${item.appId}/form/${item.targetId}`);
};

const loadRecent = async () => {
  if (props.designMode) return;
  recent.value = await workbenchRecentVisitService.query<WorkbenchRecentVisit>(
    "$top=10&$orderby=lastVisitTime desc,createTime desc"
  );
};

onMounted(() => { if (!props.designMode) loadRecent(); });
</script>

<style lang="scss" scoped>
.workbench-list-card {
  height: auto;
}

.workbench-card-header {
  align-items: center;
  display: flex;
  gap: var(--et-space-10);
  width: 100%;
  padding-top: var(--et-space-12);
  padding-bottom: var(--et-space-4);
  pointer-events: auto;
}

.workbench-card-title {
  color: var(--et-text-primary);
  font-weight: 700;
  font-size: var(--et-font-size-16);
}

.workbench-list {
  display: flex;
  flex-direction: column;
}

.workbench-list-item {
  align-items: center;
  border-radius: var(--et-radius-6);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-10);
  min-height: var(--et-size-40);
  padding: var(--et-space-8);

  &:hover {
    background: var(--et-bg-page);
  }
}

.workbench-list-icon {
  align-items: center;
  border-radius: var(--et-radius-6);
  color: var(--el-color-white, #fff);
  display: flex;
  flex: 0 0 var(--et-size-24);
  height: var(--et-size-24);
  justify-content: center;
  width: var(--et-size-24);
}

.workbench-list-main {
  flex: 1;
  min-width: 0;
}

.workbench-list-title {
  color: var(--et-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workbench-empty {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  font-size: var(--et-font-size-14);
  justify-content: center;
  min-height: var(--et-size-120);
  padding: var(--et-space-16);
  text-align: center;
}
</style>
<style lang="scss" scoped>
.workbench-card-delete { background: transparent; border: 0; color: var(--et-color-danger); cursor: pointer; display: inline-flex; margin-left: auto; opacity: 0; padding: var(--et-space-2); pointer-events: none; }
.design-header:hover .workbench-card-delete { opacity: 1; pointer-events: auto; }
.design-empty { min-height: var(--et-size-120); }
</style>
