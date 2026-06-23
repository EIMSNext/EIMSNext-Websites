<template>
  <et-card :title="t('admin.workbench.recent')" class="workbench-list-card">
    <div v-if="recent.length" class="workbench-list">
      <div v-for="item in recent" :key="`${item.targetType}:${item.targetId}`" class="workbench-list-item" @click="openItem(item)">
        <div class="workbench-list-icon" :style="{ backgroundColor: item.iconColor || 'var(--et-color-info)' }">
          <et-icon :icon="item.icon || defaultIcon(item.targetType)" />
        </div>
        <div class="workbench-list-main">
          <div class="workbench-list-title">{{ item.title }}</div>
          <div class="workbench-list-time">{{ formatTime(item.lastVisitTime) }}</div>
        </div>
      </div>
    </div>
    <div v-else class="workbench-empty">
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

const defaultIcon = (targetType: WorkbenchTargetType) => {
  if (targetType === "dashboard") return "el-DataAnalysis";
  return "el-document";
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return t("admin.workbench.justVisited");
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    : `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
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
  recent.value = await workbenchRecentVisitService.query<WorkbenchRecentVisit>(
    "$top=10&$orderby=lastVisitTime desc,createTime desc"
  );
};

onMounted(loadRecent);
</script>

<style lang="scss" scoped>
.workbench-list-card {
  height: 100%;

  :deep(.el-card__body) {
    max-height: calc(100% - var(--et-size-56));
    overflow: auto;
  }
}

.workbench-list {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
}

.workbench-list-item {
  align-items: center;
  border-radius: var(--et-radius-6);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-10);
  min-height: var(--et-size-48);
  padding: var(--et-space-8);

  &:hover {
    background: var(--et-bg-page);
  }
}

.workbench-list-icon {
  align-items: center;
  border-radius: var(--et-radius-6);
  color: #fff;
  display: flex;
  flex: 0 0 var(--et-size-32);
  height: var(--et-size-32);
  justify-content: center;
  width: var(--et-size-32);
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

.workbench-list-time {
  color: var(--et-text-tertiary);
  font-size: var(--et-font-size-12);
  margin-top: var(--et-space-2);
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
