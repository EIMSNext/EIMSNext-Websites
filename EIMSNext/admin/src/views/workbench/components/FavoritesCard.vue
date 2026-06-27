<template>
  <et-card :title="t('admin.workbench.favorites')" class="workbench-list-card">
    <template v-if="editable" #action>
      <el-button link type="primary" @click.stop="$emit('add')">{{ t("admin.workbench.addFavorite") }}</el-button>
    </template>
    <div v-if="favorites.length" class="workbench-list">
      <div v-for="item in favorites" :key="`${item.targetType}:${item.targetId}`" class="workbench-list-item" @click="openItem(item)">
        <div class="workbench-list-icon" :style="{ backgroundColor: item.iconColor || 'var(--et-color-primary)' }">
          <et-icon :icon="item.icon || defaultIcon(item.targetType)" />
        </div>
        <div class="workbench-list-main">
          <div class="workbench-list-title">{{ item.title }}</div>
          <div class="workbench-list-type">{{ typeText(item.targetType) }}</div>
        </div>
        <el-button
          v-if="editable"
          class="workbench-list-action"
          link
          type="danger"
          @click.stop="removeItem(item)"
        >
          {{ t("common.delete") }}
        </el-button>
      </div>
    </div>
    <div v-else class="workbench-empty">
      <div>{{ t("admin.workbench.favoritesEmpty") }}</div>
      <el-button v-if="editable" class="mt-3" type="primary" link @click.stop="$emit('add')">{{ t("admin.workbench.addFavorite") }}</el-button>
    </div>
  </et-card>
</template>

<script setup lang="ts">
import type { WorkbenchFavorite, WorkbenchTargetType } from "@eimsnext/models";
import { useContextStore } from "@eimsnext/store";
import { workbenchFavoriteService } from "@eimsnext/services";
import {
  useWorkbenchStore,
  WORKBENCH_FAVORITES_CHANGED_EVENT,
} from "@/store";
import { useAppStore } from "@eimsnext/store";
import { resolveAppEntryPath } from "@/utils/appEntry";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "WorkbenchFavoritesCard",
});

defineProps<{
  editable?: boolean;
}>();

defineEmits<{
  (e: "add"): void;
}>();

const router = useRouter();
const { t } = useI18n();
const contextStore = useContextStore();
const appStore = useAppStore();
const workbenchStore = useWorkbenchStore();
const favorites = ref<WorkbenchFavorite[]>([]);

const defaultIcon = (targetType: WorkbenchTargetType) => {
  if (targetType === "app") return "icon-appdefault";
  if (targetType === "dashboard") return "el-DataAnalysis";
  return "el-document";
};

const typeText = (targetType: WorkbenchTargetType) => {
  if (targetType === "app") return t("common.app");
  if (targetType === "dashboard") return t("common.dashboard");
  return t("common.form");
};

const openItem = async (item: WorkbenchFavorite) => {
  if (item.appId) {
    await contextStore.setAppId(item.appId);
  }

  if (item.targetType === "app") {
    const app = await appStore.get(item.targetId);
    router.push(app ? resolveAppEntryPath(app) : `/app/${item.targetId}/mytasks`);
    return;
  }

  if (item.targetType === "dashboard") {
    router.push(`/app/${item.appId}/dash/${item.targetId}`);
    return;
  }

  router.push(`/app/${item.appId}/form/${item.targetId}`);
};

const removeItem = async (item: WorkbenchFavorite) => {
  await workbenchFavoriteService.delete(item.id);
  await loadFavorites();
  await workbenchStore.loadFavorites(true);
};

const loadFavorites = async () => {
  favorites.value = await workbenchFavoriteService.query<WorkbenchFavorite>(
    "$orderby=sortIndex asc,createTime desc"
  );
};

onMounted(() => {
  loadFavorites();
  window.addEventListener(WORKBENCH_FAVORITES_CHANGED_EVENT, loadFavorites);
});

onBeforeUnmount(() => {
  window.removeEventListener(WORKBENCH_FAVORITES_CHANGED_EVENT, loadFavorites);
});
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

    .workbench-list-action {
      opacity: 1;
    }
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

.workbench-list-type {
  color: var(--et-text-tertiary);
  font-size: var(--et-font-size-12);
  margin-top: var(--et-space-2);
}

.workbench-list-action {
  opacity: 0;
}

.workbench-empty {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  flex-direction: column;
  font-size: var(--et-font-size-14);
  justify-content: center;
  min-height: var(--et-size-120);
  padding: var(--et-space-16);
  text-align: center;
}
</style>
