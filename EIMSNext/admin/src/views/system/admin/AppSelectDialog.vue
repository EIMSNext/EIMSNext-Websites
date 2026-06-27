<template>
  <et-dialog
    :model-value="modelValue"
    :title="t('admin.appSelect.title')"
    width="680px"
    destroy-on-close
    @cancel="cancel"
    @ok="save"
  >
    <div class="app-select">
      <div class="app-select-left">
        <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable :placeholder="t('common.search')" />
        <div class="select-all-row">
          <el-checkbox :model-value="allFilteredChecked" :indeterminate="isIndeterminate" @change="toggleAll">
            {{ t("common.selectAll") }}
          </el-checkbox>
        </div>
        <div class="app-list">
          <template v-for="group in groupedApps" :key="group.name">
            <div class="group-title">{{ group.name }}</div>
            <label v-for="app in group.apps" :key="app.id" class="app-row">
              <el-checkbox :model-value="selectedIds.includes(app.id)" @change="(checked) => toggleApp(app.id, checked === true)" />
              <span class="app-icon" :style="{ backgroundColor: getAppIconColor(app) }">
                <et-icon :icon="getAppIcon(app)" color="#fff" size="13px" />
              </span>
              <span class="app-name">{{ app.name }}</span>
            </label>
          </template>
        </div>
      </div>
      <div class="app-select-right">
        <el-tag
          v-for="app in selectedApps"
          :key="app.id"
          closable
          class="selected-app"
          @close="toggleApp(app.id, false)"
        >
          <span class="app-icon" :style="{ backgroundColor: getAppIconColor(app) }">
            <et-icon :icon="getAppIcon(app)" color="#fff" size="12px" />
          </span>
          {{ app.name }}
        </el-tag>
      </div>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import { getAppIcon, getAppIconColor } from "@/utils/common";
import { AppDef } from "@eimsnext/models";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "AdminAppSelectDialog",
});

const props = defineProps<{
  modelValue: boolean;
  apps: AppDef[];
  selectedIds: string[];
}>();

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const { t } = useI18n();
const keyword = ref("");
const selectedIds = ref<string[]>([]);

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      selectedIds.value = [...props.selectedIds];
      keyword.value = "";
    }
  },
  { immediate: true },
);

const availableApps = computed(() =>
  props.apps
    .filter((app) => app.id !== "system")
    .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0)),
);

const filteredApps = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return availableApps.value;
  return availableApps.value.filter((app) => app.name.includes(kw));
});

const groupedApps = computed(() => {
  const map = new Map<string, AppDef[]>();
  filteredApps.value.forEach((app) => {
    const groupName = app.groupId || t("common.other");
    if (!map.has(groupName)) map.set(groupName, []);
    map.get(groupName)!.push(app);
  });

  return [...map.entries()].map(([name, apps]) => ({ name, apps }));
});

const selectedApps = computed(() => {
  const appMap = new Map(availableApps.value.map((app) => [app.id, app]));
  return selectedIds.value.map((id) => appMap.get(id)).filter((app): app is AppDef => !!app);
});

const allFilteredChecked = computed(() => {
  const ids = filteredApps.value.map((app) => app.id);
  return ids.length > 0 && ids.every((id) => selectedIds.value.includes(id));
});

const isIndeterminate = computed(() => {
  const ids = filteredApps.value.map((app) => app.id);
  const checkedCount = ids.filter((id) => selectedIds.value.includes(id)).length;
  return checkedCount > 0 && checkedCount < ids.length;
});

const toggleApp = (id: string, checked: boolean) => {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id);
  } else {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  }
};

const toggleAll = (checked: unknown) => {
  const ids = filteredApps.value.map((app) => app.id);
  if (checked === true) {
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])];
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
  }
};

const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const save = () => {
  emit("ok", [...selectedIds.value]);
  emit("update:modelValue", false);
};
</script>

<style scoped lang="scss">
.app-select {
  border: 1px solid var(--el-border-color);
  border-radius: var(--et-radius-4);
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 482px;
  overflow: hidden;
}

.app-select-left,
.app-select-right {
  min-width: 0;
}

.app-select-left {
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  padding: var(--et-space-12);
}

.app-select-right {
  align-content: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: var(--et-space-8);
  overflow: auto;
  padding: var(--et-space-12);
}

.search-input {
  margin-bottom: var(--et-space-8);
}

.select-all-row {
  color: var(--et-color-primary);
  margin-bottom: var(--et-space-8);
}

.app-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.group-title {
  color: var(--et-text-tertiary);
  font-size: var(--et-font-size-13);
  line-height: 28px;
}

.app-row {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: var(--et-space-8);
  height: 32px;
  min-width: 0;
}

.app-icon {
  align-items: center;
  border-radius: var(--et-radius-4);
  display: inline-flex;
  flex: 0 0 18px;
  height: 18px;
  justify-content: center;
  width: 18px;
}

.app-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-app {
  max-width: 100%;

  :deep(.el-tag__content) {
    align-items: center;
    display: inline-flex;
    gap: var(--et-space-6);
    min-width: 0;
  }
}
</style>
