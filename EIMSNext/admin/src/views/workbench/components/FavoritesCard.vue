<template>
  <et-card :title="t('admin.workbench.favorites')" class="workbench-list-card" data-workbench-card-root>
    <template #header>
      <div class="workbench-card-header" :class="{ 'design-header': designMode }" @mousedown.stop>
        <span class="workbench-card-title">{{ t("admin.workbench.favorites") }}</span>
        <button v-if="designMode && removable" type="button" class="workbench-card-delete no-drag" :title="t('common.delete')" @click.stop="$emit('remove')"><et-icon icon="el-delete" size="16px" /></button>
        <el-button v-if="allowManage" link type="primary" @click.stop="$emit('add')">
          <et-icon icon="el-plus" />
          {{ t("common.add") }}
        </el-button>
      </div>
    </template>
    <div v-if="designMode" class="workbench-empty design-empty" data-workbench-height-content>{{ t("admin.workbench.favoritesEmpty") }}</div>
    <div v-else-if="favorites.length" class="workbench-list" data-workbench-height-content>
      <div v-for="item in favorites" :key="`${item.targetType}:${item.targetId}`" class="workbench-list-item" @click="openItem(item)">
        <div class="workbench-list-icon" :style="{ backgroundColor: item.iconColor || 'var(--et-color-primary)' }">
          <et-icon :icon="item.icon || defaultIcon(item.targetType)" />
        </div>
        <div class="workbench-list-main">
          <div class="workbench-list-title" :title="item.title">{{ item.title }}</div>
        </div>
        <el-tooltip v-if="allowManage" :content="t('admin.workbench.removeFavorite')" placement="top">
          <el-button class="workbench-list-action" link @click.stop="removeItem(item)">
            <et-icon icon="el-star" />
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div
      v-else
      class="workbench-empty"
      :class="{ 'runtime-empty': allowManage }"
      data-workbench-height-content
    >
      <template v-if="allowManage">
        <span>{{ t("common.noData") }}</span>
        <el-button link type="primary" @click.stop="$emit('add')">
          {{ t("common.add") }}
        </el-button>
      </template>
      <div v-else>{{ t("admin.workbench.favoritesEmpty") }}</div>
    </div>
  </et-card>
</template>

<script setup lang="ts">
import type { WorkbenchFavorite, WorkbenchTargetType } from "@eimsnext/models";
import { useContextStore } from "@eimsnext/store";
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

const props = withDefaults(defineProps<{
  allowManage?: boolean;
  designMode?: boolean;
  removable?: boolean;
}>(), {
  allowManage: false,
  designMode: false,
  removable: false,
});

defineEmits<{
  (e: "add"): void;
  (e: "remove"): void;
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
    if (!item.appId) {
      ElMessage.error(t("admin.workbench.invalidFavorite"));
      return;
    }
    router.push(`/app/${item.appId}/dash/${item.targetId}`);
    return;
  }

  if (!item.appId) {
    ElMessage.error(t("admin.workbench.invalidFavorite"));
    return;
  }
  router.push(`/app/${item.appId}/form/${item.targetId}`);
};

const removeItem = async (item: WorkbenchFavorite) => {
  if (!props.allowManage) return;
  await workbenchStore.removeFavorite({ targetType: item.targetType, targetId: item.targetId });
};

const loadFavorites = async () => {
  if (props.designMode) return;
  await workbenchStore.refreshFavorites();
  favorites.value = workbenchStore.favorites;
};

onMounted(() => {
  if (props.designMode) return;
  loadFavorites();
  window.addEventListener(WORKBENCH_FAVORITES_CHANGED_EVENT, loadFavorites);
});

onBeforeUnmount(() => {
  window.removeEventListener(WORKBENCH_FAVORITES_CHANGED_EVENT, loadFavorites);
});
</script>

<style lang="scss" scoped>
.workbench-list-card {
  height: auto;

  :deep(.el-card__body) {
    max-height: calc(
      var(--et-size-40) * 10 + var(--et-space-10)
    );
    overflow-x: hidden;
    overflow-y: auto;
  }
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

    .workbench-list-action {
      opacity: 1;
    }
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

.workbench-list-action {
  color: var(--et-color-primary);
  flex: 0 0 auto;
  opacity: 0;
  transition: opacity 0.2s ease;
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

  &.runtime-empty {
    flex-direction: row;
    gap: var(--et-space-8);
  }
}
</style>
<style lang="scss" scoped>
.workbench-card-delete { background: transparent; border: 0; color: var(--et-color-danger); cursor: pointer; display: inline-flex; margin-left: auto; opacity: 0; padding: var(--et-space-2); pointer-events: none; }
.design-header:hover .workbench-card-delete { opacity: 1; pointer-events: auto; }
.design-empty { min-height: var(--et-size-120); }
</style>
