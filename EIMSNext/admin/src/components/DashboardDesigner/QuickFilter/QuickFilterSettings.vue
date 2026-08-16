<template>
  <el-dialog v-model="visible" :title="t('admin.dashboardDesigner.quickFilterSettings')" width="760px" :close-on-click-modal="false" @closed="emit('close')">
    <el-form label-position="top">
      <el-form-item :label="t('admin.dashboardFilterDesigner.name')">
        <el-input v-model="draft.name" />
      </el-form-item>
      <el-checkbox v-model="draft.showTitle">{{ t('admin.dashboardDesigner.showTitle') }}</el-checkbox>
    </el-form>

    <div class="quick-filter-settings-body">
      <section class="option-panel">
        <div class="panel-title">{{ t('admin.dashboardDesigner.quickFilterOptions') }}</div>
        <el-button link type="primary" @click="addOption"><et-icon icon="el-plus" />{{ t('admin.dashboardDesigner.addQuickFilterOption') }}</el-button>
        <el-radio-group v-model="activeOptionId" class="option-list">
          <div v-for="option in draft.options" :key="option.id" class="option-row">
            <el-radio :value="option.id" />
            <el-input v-model="option.name" :placeholder="t('admin.dashboardDesigner.quickFilterOptionName')" />
            <el-button link :title="t('common.delete')" @click="removeOption(option.id)"><et-icon icon="el-delete" /></el-button>
          </div>
        </el-radio-group>
      </section>

      <section class="condition-panel">
        <div class="panel-title">{{ t('admin.dashboardDesigner.quickFilterConditions') }}</div>
        <template v-if="activeOption">
          <el-button link type="primary" @click="addCondition"><et-icon icon="el-plus" />{{ t('admin.dashboardDesigner.addFilterCondition') }}</el-button>
          <el-empty v-if="!activeOption.conditions.length" :description="t('admin.dashboardDesigner.noFilterCondition')" :image-size="70" />
          <div v-else class="condition-list">
            <div v-for="(condition, index) in activeOption.conditions" :key="`${condition.name}_${index}`" class="condition-row">
              <span>{{ condition.name || t('admin.dashboardDesigner.filterCondition') }}</span>
              <div>
                <el-button link :title="t('common.edit')" @click="editCondition(index)"><et-icon icon="el-editPen" /></el-button>
                <el-button link :title="t('common.delete')" @click="activeOption.conditions.splice(index, 1)"><et-icon icon="el-delete" /></el-button>
              </div>
            </div>
          </div>
        </template>
        <el-empty v-else :description="t('admin.dashboardDesigner.selectQuickFilterOption')" :image-size="70" />
      </section>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="save">{{ t('common.ok') }}</el-button>
    </template>
  </el-dialog>

  <FilterDesigner
    v-if="editingCondition"
    v-model="conditionEditorVisible"
    :initial-setting="editingCondition"
    :chart-targets="chartTargets"
    :binding-candidates="bindingCandidates"
    @save-setting="saveCondition"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { cloneDeep } from "lodash-es";
import { DashboardFilterSetting, DashboardQuickFilterSetting } from "@eimsnext/models";
import { useI18n } from "vue-i18n";
import FilterDesigner from "../FilterDesigner/FilterDesigner.vue";
import { IDashboardBindingCandidate, IDashboardChartTarget, createDefaultFilterSetting } from "../FilterDesigner/type";
import { createQuickFilterOption } from "./type";

const props = defineProps<{
  modelValue: boolean;
  setting: DashboardQuickFilterSetting;
  chartTargets: IDashboardChartTarget[];
  bindingCandidates: IDashboardBindingCandidate[];
}>();
const emit = defineEmits<{ "update:modelValue": [value: boolean]; updated: [setting: DashboardQuickFilterSetting]; close: [] }>();
const { t } = useI18n();
const visible = ref(props.modelValue);
const draft = ref<DashboardQuickFilterSetting>(cloneDeep(props.setting));
const activeOptionId = ref<string>();
const editingIndex = ref<number>();
const editingCondition = ref<DashboardFilterSetting>();
const conditionEditorVisible = ref(false);

const activeOption = computed(() => draft.value.options.find((option) => option.id === activeOptionId.value));

watch(() => props.modelValue, (value) => { visible.value = value; });
watch(visible, (value) => {
  emit("update:modelValue", value);
  if (!value) return;
  draft.value = cloneDeep(props.setting);
  activeOptionId.value = draft.value.options[0]?.id;
});
watch(() => props.setting, (value) => {
  if (!visible.value) draft.value = cloneDeep(value);
}, { deep: true });

const addOption = () => {
  const option = createQuickFilterOption(t('admin.dashboardDesigner.untitledQuickFilterOption'));
  draft.value.options.push(option);
  activeOptionId.value = option.id;
};
const removeOption = (id: string) => {
  const index = draft.value.options.findIndex((option) => option.id === id);
  if (index < 0) return;
  draft.value.options.splice(index, 1);
  if (activeOptionId.value === id) activeOptionId.value = draft.value.options[0]?.id;
};
const addCondition = () => {
  editingIndex.value = undefined;
  editingCondition.value = createDefaultFilterSetting(t('admin.dashboardDesigner.filterCondition'));
  conditionEditorVisible.value = true;
};
const editCondition = (index: number) => {
  if (!activeOption.value) return;
  editingIndex.value = index;
  editingCondition.value = cloneDeep(activeOption.value.conditions[index]);
  conditionEditorVisible.value = true;
};
const saveCondition = (setting: DashboardFilterSetting) => {
  if (!activeOption.value) return;
  if (editingIndex.value == null) activeOption.value.conditions.push(setting);
  else activeOption.value.conditions.splice(editingIndex.value, 1, setting);
  conditionEditorVisible.value = false;
  editingCondition.value = undefined;
};
const save = () => {
  emit('updated', cloneDeep(draft.value));
  visible.value = false;
};
</script>

<style scoped lang="scss">
.quick-filter-settings-body { display: grid; grid-template-columns: 1fr 1fr; min-height: 300px; margin-top: 20px; border: 1px solid var(--et-border-color-light); }
.option-panel, .condition-panel { padding: 16px; min-width: 0; }.option-panel { border-right: 1px solid var(--et-border-color-light); }
.panel-title { margin-bottom: 10px; font-weight: 700; color: var(--et-text-primary); }.option-list, .condition-list { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 12px; }
.option-row, .condition-row { display: flex; align-items: center; gap: 8px; min-width: 0; }.option-row :deep(.el-input) { flex: 1; }.condition-row { justify-content: space-between; padding: 8px; border: 1px solid var(--et-border-color-light); border-radius: var(--et-radius-3); }.condition-row > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
