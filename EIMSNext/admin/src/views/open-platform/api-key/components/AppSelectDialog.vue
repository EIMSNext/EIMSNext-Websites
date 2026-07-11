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

      <div v-for="group in groupedApps" :key="group.key" class="group-block">
        <div class="group-title">{{ group.title }}</div>
        <el-checkbox-group v-model="selectedIds" class="app-list">
          <el-checkbox
            v-for="app in group.items"
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
      </div>

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

const { t } = useI18n();

interface AppItem {
  id: string;
  name: string;
  group: string;
}

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

// 同步外部 value 变化
watch(
  () => props.value,
  (v) => {
    selectedIds.value = [...v];
  },
);

// 简化版 mock 数据：实际项目里应通过 appDefService 拉真实 App 列表
const allApps = computed<AppItem[]>(() => [
  { id: "app-001", name: "关联字段应用", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyContacts") },
  { id: "app-002", name: "采购供应链_拷贝", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyContacts") },
  { id: "app-003", name: "门店营运管理", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyContacts") },
  { id: "app-004", name: "e签宝电子签章-次数版_模板", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyContacts") },
  { id: "app-005", name: "企业信息查询", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
  { id: "app-006", name: "印章及证照管理", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
  { id: "app-007", name: "印章及证照管理_拷贝", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
  { id: "app-008", name: "MRP（多计划合并版）", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
  { id: "app-009", name: "e签宝电子签章-年费版-模板", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
  { id: "app-010", name: "上上签电子签章", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
  { id: "app-011", name: "开具数电发票插件-demo", group: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers") },
]);

const filteredApps = computed(() => {
  const k = search.value.trim().toLowerCase();
  if (!k) return allApps.value;
  return allApps.value.filter(
    (a) => a.id.toLowerCase().includes(k) || a.name.toLowerCase().includes(k),
  );
});

const groupedApps = computed(() => {
  const groups: Record<string, AppItem[]> = {};
  for (const a of filteredApps.value) {
    if (!groups[a.group]) groups[a.group] = [];
    groups[a.group].push(a);
  }
  return [
    { key: t("admin.apiKeyMgmt.appSelectDialog.groupKeyContacts"), title: t("admin.apiKeyMgmt.appSelectDialog.groupTitleContacts"), items: groups[t("admin.apiKeyMgmt.appSelectDialog.groupKeyContacts")] ?? [] },
    { key: t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers"),   title: t("admin.apiKeyMgmt.appSelectDialog.groupTitleOthers"),   items: groups[t("admin.apiKeyMgmt.appSelectDialog.groupKeyOthers")]   ?? [] },
  ];
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

.select-all {
  padding: 6px 0;
  border-bottom: 1px solid var(--et-border-color-light);
  margin-bottom: 4px;
}

.group-block + .group-block {
  margin-top: 8px;
}

.group-title {
  font-size: 12px;
  color: var(--et-text-secondary);
  font-weight: 600;
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
