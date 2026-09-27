<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('admin.apiKeyMgmt.appSelectDialog.title')"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <div class="app-select-dialog">
      <el-input
        v-model="search"
        :placeholder="t('admin.apiKeyMgmt.appSelectDialog.search')"
        clearable
        style="margin-bottom: 12px"
      >
        <template #prefix>
          <et-icon icon="el-Search" />
        </template>
      </el-input>

      <el-checkbox
        v-model="selectAll"
        class="select-all"
        :indeterminate="indeterminate"
        @change="onSelectAll"
      >
        {{ t("admin.apiKeyMgmt.appSelectDialog.selectAll") }}
      </el-checkbox>

      <div v-if="loading" class="loading-area">{{ t("common.loading") }}</div>
      <el-checkbox-group v-else v-model="selectedIds" class="app-list">
        <el-checkbox
          v-for="app in filteredApps"
          :key="app.id"
          :value="app.id"
          :label="app.id"
          class="app-row"
        >
          <div class="app-cell">
            <et-icon icon="el-Grid" />
            <span>{{ app.name }}</span>
          </div>
        </el-checkbox>
      </el-checkbox-group>

      <div v-if="selectedIds.length > 0" class="selected-row">
        <el-tag
          v-for="id in selectedIds"
          :key="id"
          closable
          @close="removeId(id)"
        >{{ id }}</el-tag>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">{{ t("common.cancel") }}</el-button>
      <el-button type="primary" @click="confirm">
        {{ t("common.confirm") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { appDefService } from "@eimsnext/services";
import type { AppDef } from "@eimsnext/models";

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  value: string[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "update:value", v: string[]): void;
}>();

const search = ref("");
const selectedIds = ref<string[]>([...props.value]);
const allApps = ref<AppDef[]>([]);
const loading = ref(false);

// 同步外部 value 变化
watch(
  () => props.value,
  (v) => {
    selectedIds.value = [...v];
  },
);

onMounted(async () => {
  loading.value = true;
  try {
    allApps.value = await appDefService.query<AppDef>("$orderby=sortIndex asc");
  } catch (e) {
    console.error("Failed to load apps", e);
  } finally {
    loading.value = false;
  }
});

const filteredApps = computed(() => {
  const k = search.value.trim().toLowerCase();
  if (!k) return allApps.value;
  return allApps.value.filter(
    (a) => a.id?.toLowerCase().includes(k) || a.name?.toLowerCase().includes(k),
  );
});

const selectAll = computed({
  get: () => filteredApps.value.length > 0 && filteredApps.value.every((a) => selectedIds.value.includes(a.id)),
  set: () => {},
});

const indeterminate = computed(() => {
  const inFiltered = filteredApps.value.filter((a) => selectedIds.value.includes(a.id)).length;
  return inFiltered > 0 && inFiltered < filteredApps.value.length;
});

function onSelectAll(checked: boolean | string | number) {
  const ids = filteredApps.value.map((a) => a.id);
  if (checked) {
    const set = new Set([...selectedIds.value, ...ids]);
    selectedIds.value = Array.from(set);
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
  }
}

function removeId(id: string) {
  selectedIds.value = selectedIds.value.filter((x) => x !== id);
}

function confirm() {
  emit("update:value", [...selectedIds.value]);
  emit("update:modelValue", false);
}
</script>

<style scoped lang="scss">
.app-select-dialog {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-area {
  padding: 24px;
  text-align: center;
  color: var(--et-text-secondary);
}

.select-all {
  padding: 6px 0;
  border-bottom: 1px solid var(--et-border-color-light);
  margin-bottom: 4px;
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-row {
  margin-right: 0;
  width: 100%;
  :deep(.el-checkbox__label) {
    width: 100%;
  }
}

.app-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--et-text-primary);
}

.selected-row {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  border: 1px dashed var(--et-border-color-light);
  border-radius: 6px;
  min-height: 32px;
  background: color-mix(in srgb, var(--et-fill-color-light) 60%, transparent);
}
</style>
