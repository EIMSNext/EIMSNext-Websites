<template>
  <et-dialog
    :model-value="modelValue"
    :title="t('admin.formListView.scopeTitle')"
    width="610px"
    destroy-on-close
    @ok="save"
    @cancel="cancel"
  >
    <div class="view-scope-dialog">
      <div class="selected-panel">
        <el-tag
          v-for="group in selectedGroups"
          :key="group.id"
          closable
          @close="toggleGroup(group.id, false)"
        >
          <el-icon><Lock /></el-icon>
          <span>{{ group.name }}</span>
        </el-tag>
      </div>
      <div class="scope-list-panel">
        <div class="scope-list-toolbar">
          <div class="scope-list-title">{{ t("admin.formListView.authGroups") }}</div>
          <el-input v-model="keyword" class="scope-search" :placeholder="t('common.search')" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="scope-row select-all" @click="selectAll">
          <span>{{ t("common.selectAll") }}</span>
          <el-checkbox :model-value="isAllSelected" @click.stop @change="selectAll" />
        </div>
        <div
          v-for="group in filteredGroups"
          :key="group.id"
          class="scope-row"
          @click="toggleGroup(group.id, !selectedIds.includes(group.id))"
        >
          <span>{{ group.name }}</span>
          <el-checkbox
            :model-value="selectedIds.includes(group.id)"
            @click.stop
            @change="(value) => toggleGroup(group.id, value === true)"
          />
        </div>
      </div>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Lock, Search } from "@element-plus/icons-vue";
import { AuthGroup, FormListView } from "@eimsnext/models";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: boolean;
  view: FormListView;
  authGroups: AuthGroup[];
}>();

const emit = defineEmits(["update:modelValue", "ok", "cancel"]);
const { t } = useI18n();
const selectedIds = ref<string[]>([]);
const keyword = ref("");

watch(
  () => props.view,
  () => {
    selectedIds.value = [...(props.view.authGroupIds || [])];
  },
  { immediate: true },
);

const filteredGroups = computed(() => {
  const key = keyword.value.trim();
  if (!key) return props.authGroups;
  return props.authGroups.filter((group) => group.name.includes(key));
});

const selectedGroups = computed(() => props.authGroups.filter((group) => selectedIds.value.includes(group.id)));
const isAllSelected = computed(() => props.authGroups.length > 0 && props.authGroups.every((group) => selectedIds.value.includes(group.id)));

const toggleGroup = (id: string, checked: boolean) => {
  selectedIds.value = checked
    ? Array.from(new Set([...selectedIds.value, id]))
    : selectedIds.value.filter((item) => item !== id);
};

const selectAll = () => {
  selectedIds.value = isAllSelected.value ? [] : props.authGroups.map((group) => group.id);
};

const save = () => {
  emit("ok", selectedIds.value);
};

const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
</script>

<style lang="scss" scoped>
.view-scope-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
  padding: var(--et-space-10);
}

.selected-panel {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--et-space-8);
  min-height: 78px;
  padding: var(--et-space-8);
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
}

.scope-list-panel {
  height: 300px;
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
  overflow: auto;
}

.scope-list-toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 var(--et-space-8);
  border-bottom: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
}

.scope-list-title {
  color: var(--et-color-primary);
  font-weight: 600;
  border-bottom: 2px solid var(--et-color-primary);
  line-height: 38px;
}

.scope-search {
  width: 110px;
}

.scope-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 0 var(--et-space-10);
  color: var(--et-text-primary);
  cursor: pointer;

  &:hover {
    background: var(--et-bg-hover);
  }
}

.select-all {
  color: var(--et-color-primary);
}
</style>
