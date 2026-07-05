<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <span class="drawer-title">{{ t("admin.dashboardFilterDesigner.editTitle") }}</span>
    </template>
    <template #top-right>
      <el-button @click="close">{{ t("common.cancel") }}</el-button>
      <el-button type="primary" @click="onSave">{{ t("common.ok") }}</el-button>
    </template>

    <div class="filter-shell">
      <section class="filter-column charts-column">
        <div class="column-title">{{ t("admin.dashboardFilterDesigner.stepCharts") }}</div>
        <div class="chart-actions">
          <el-checkbox :model-value="allChecked" @change="(val) => toggleAll(Boolean(val))">{{ t("admin.dashboardFilterDesigner.checkAll") }}</el-checkbox>
        </div>
        <el-checkbox-group v-model="setting.targetChartIds" class="chart-list">
          <el-checkbox v-for="chart in chartTargets" :key="chart.id" :label="chart.id" class="chart-item">
            {{ chart.name }}
          </el-checkbox>
        </el-checkbox-group>
      </section>

      <section class="filter-column fields-column">
        <div class="column-title">{{ t("admin.dashboardFilterDesigner.stepFields") }}</div>
        <div v-for="candidate in visibleBindingCandidates" :key="candidate.dataSourceId" class="field-block">
          <div class="field-block-title">{{ candidate.dataSourceLabel }}</div>
          <el-select
            :model-value="getBindingField(candidate.dataSourceId)"
            filterable
            clearable
            :placeholder="t('admin.dashboardFilterDesigner.selectFieldPlaceholder')"
            class="field-select"
            @change="(val) => onFieldChange(candidate, val)"
          >
            <el-option
              v-for="field in getSelectableFields(candidate)"
              :key="field.field"
              :label="field.label"
              :value="field.field"
            >
              <div class="field-option">
                <span class="field-option-label">{{ field.label }}</span>
                <span class="field-option-type">{{ getFieldTypeText(field.type) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
      </section>

      <section class="filter-column settings-column">
        <div class="column-title">{{ t("admin.dashboardFilterDesigner.stepSettings") }}</div>

        <el-form label-position="top" class="settings-form">
          <el-form-item :label="t('admin.dashboardFilterDesigner.name')">
            <el-input v-model="setting.name" />
          </el-form-item>

          <el-form-item :label="t('admin.dashboardFilterDesigner.filterMode')">
            <template v-if="filterModeEditable">
              <el-segmented v-model="setting.filterMode" :options="filterModeOptions" block />
            </template>
            <template v-else>
              <div class="filter-mode-static">{{ filterModeLabel }}</div>
            </template>
          </el-form-item>

          <el-form-item :label="t('admin.dashboardFilterDesigner.defaultValue')">
            <div class="value-head-row">
              <el-segmented v-model="setting.defaultValueMode" :options="defaultModeOptions" size="small" />
              <div class="operator-wrap">
                <span class="operator-label">{{ t("admin.dashboardFilterDesigner.operator") }}</span>
                <el-select v-model="setting.operator" class="operator-select">
                  <el-option v-for="op in operatorOptions" :key="op.id" :label="op.label" :value="op.id" />
                </el-select>
              </div>
            </div>

            <div v-if="setting.operator != 'empty' && setting.operator != 'notempty'" class="default-editor">
              <template v-if="setting.defaultValueMode == 'dynamic'">
                <el-select v-model="dynamicDefaultType" class="full-width">
                  <el-option v-for="item in dynamicDefaultOptions" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
              </template>

              <template v-else-if="selectedFieldType == 'number' || selectedFieldType == 'timestamp'">
                <div v-if="setting.operator == 'between'" class="range-row">
                  <el-input v-model="rangeValue[0]" :placeholder="t('admin.dashboardFilterDesigner.minValue')" @change="syncRangeValue" />
                  <el-input v-model="rangeValue[1]" :placeholder="t('admin.dashboardFilterDesigner.maxValue')" @change="syncRangeValue" />
                </div>
                <el-input v-else v-model="singleValue" @change="syncSingleValue" />
              </template>

              <template v-else-if="isMemberType">
                <selected-tags
                  :model-value="memberTags"
                  :multiple="isMultipleType"
                  :editable="true"
                  :empty-text="isDepartmentType ? t('comp.emptyDept') : t('comp.emptyEmp')"
                  @editTag="openMemberDialog"
                />
              </template>

              <template v-else-if="setting.filterMode == 'text'">
                <el-input v-model="singleValue" @change="syncSingleValue" />
              </template>

              <template v-else>
                <el-select v-model="optionValue" :multiple="isMultipleType" filterable clearable class="full-width" @change="syncOptionValue">
                  <el-option v-for="item in currentOptions" :key="item.id" :label="item.label" :value="item.value ?? item.id" />
                </el-select>
              </template>
            </div>

            <div v-else class="no-value-hint">{{ t("admin.dashboardFilterDesigner.noValueInput") }}</div>
          </el-form-item>

          <el-form-item :label="t('admin.dashboardFilterDesigner.allowedRange')">
            <RangeOptionPanel
              v-model:allowed-range="setting.allowedRange"
              :range-source-type="setting.rangeSourceType || 'distinctData'"
              :current-options="currentOptions"
              :selected-field-type="selectedFieldType"
            />
          </el-form-item>

          <el-form-item v-if="isMemberType" :label="t('admin.dashboardFilterDesigner.memberDeptRange')">
            <selected-tags
              :model-value="memberLimitTags"
              multiple
              editable
              :empty-text="t('admin.dashboardFilterDesigner.noLimit')"
              @editTag="openMemberLimitDialog"
            />
          </el-form-item>

          <el-form-item :label="t('admin.dashboardFilterDesigner.linkage')">
            <div class="range-empty">{{ t("admin.dashboardFilterDesigner.noLinkage") }}</div>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </EtDrawer>

  <member-select-dialog
    v-model="showMemberDialog"
    :tags="memberTags"
    :member-options="memberOptions"
    @ok="memberSelected"
  />

  <member-select-dialog
    v-model="showMemberLimitDialog"
    :tags="memberLimitTags"
    :member-options="memberLimitOptions"
    @ok="memberLimitSelected"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useUserStore, useDeptStore } from "@eimsnext/store";
import {
  EtDrawer,
  IFormFieldDef,
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
  ISelectedTag,
  DataItemType,
} from "@eimsnext/components";
import {
  DashboardFilterSetting,
  DashboardItemDef,
  FieldType,
} from "@eimsnext/models";
import {
  dashboardItemDefService,
  formDataService,
  IFormDataFilterOptionItem,
} from "@eimsnext/services";
import { cloneDeep } from "lodash-es";
import { DashboardConditionFieldType, getDashboardConditionFieldType, isDashboardMultiValueType } from "../fieldType";
import RangeOptionPanel from "./RangeOptionPanel.vue";
import { useI18n } from "vue-i18n";
import {
  createDefaultFilterSetting,
  getFieldTypeGroup,
  getFilterMode,
  getRangeSourceType,
  IDashboardBindingCandidate,
  IDashboardChartTarget,
  isFilterSetting,
  toBinding,
} from "./type";

const { t } = useI18n();

defineOptions({
  name: "FilterDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  dashItemDef: DashboardItemDef;
  chartTargets: IDashboardChartTarget[];
  bindingCandidates: IDashboardBindingCandidate[];
}>();

const userStore = useUserStore();
const deptStore = useDeptStore();

const createLocalizedDefaultSetting = () => createDefaultFilterSetting(t("admin.dashboardDesigner.filterWidgetName"));

const setting = reactive<DashboardFilterSetting>(createLocalizedDefaultSetting());
const dynamicDefaultType = ref<"currentUser" | "currentDept" | "today" | "thisWeek" | "thisMonth">("currentUser");
const currentOptions = ref<IFormDataFilterOptionItem[]>([]);
const showMemberDialog = ref(false);
const showMemberLimitDialog = ref(false);
const rangeValue = ref<[any, any]>([undefined, undefined]);
const singleValue = ref<any>();
const optionValue = ref<any>();
const memberTags = ref<ISelectedTag[]>([]);
const memberLimitTags = ref<ISelectedTag[]>([]);

const initSettingFromItemDef = (itemDef: DashboardItemDef) => {
  const parsed = JSON.parse(itemDef.details || "{}");
  const fresh = isFilterSetting(parsed) ? cloneDeep(parsed) : createLocalizedDefaultSetting();
  Object.assign(setting, fresh);
  dynamicDefaultType.value = fresh.dynamicDefault?.type || "currentUser";
  currentOptions.value = [];
  rangeValue.value = [undefined, undefined];
  singleValue.value = undefined;
  optionValue.value = undefined;
  memberTags.value = [];
  memberLimitTags.value = [];
};

initSettingFromItemDef(props.dashItemDef);

watch(() => props.dashItemDef, (newItem) => { initSettingFromItemDef(newItem); });
const getMemberLimit = (value: DashboardFilterSetting): { deptIds?: string[] } | undefined => {
  return (value as DashboardFilterSetting & { memberLimit?: { deptIds?: string[] } }).memberLimit;
};

const selectedBindings = computed(() => setting.bindings.filter((item) => item.field));
const selectedField = computed(() => selectedBindings.value[0]?.field);
const selectedFieldType = computed(() => getDashboardConditionFieldType(selectedField.value?.type));
const isMemberType = computed(() => [DashboardConditionFieldType.Employee1, DashboardConditionFieldType.Employee2, DashboardConditionFieldType.Department1, DashboardConditionFieldType.Department2].includes(selectedFieldType.value));
const isDepartmentType = computed(() => [DashboardConditionFieldType.Department1, DashboardConditionFieldType.Department2].includes(selectedFieldType.value));
const isMultipleType = computed(() => isDashboardMultiValueType(selectedField.value?.type));
const filterModeEditable = computed(() => [DashboardConditionFieldType.Select1, DashboardConditionFieldType.Select2, DashboardConditionFieldType.Radio, DashboardConditionFieldType.CheckBox].includes(selectedFieldType.value));
const filterModeLabel = computed(() => {
  switch (selectedFieldType.value) {
    case DashboardConditionFieldType.Number:
    case DashboardConditionFieldType.TimeStamp:
      return t("admin.dashboardFilterDesigner.rangeFilter");
    case DashboardConditionFieldType.Input:
    case DashboardConditionFieldType.Other:
      return t("admin.dashboardFilterDesigner.textFilter");
    default:
      return t("admin.dashboardFilterDesigner.optionFilter");
  }
});

const allChecked = computed(() => props.chartTargets.length > 0 && setting.targetChartIds.length == props.chartTargets.length);
const visibleBindingCandidates = computed(() => {
  const activeSourceIds = new Set(
    props.chartTargets
      .filter((item) => setting.targetChartIds.includes(item.id))
      .map((item) => item.dataSource.id),
  );

  return props.bindingCandidates.filter((item) => activeSourceIds.has(item.dataSourceId));
});

const operatorOptions = computed(() => {
  switch (selectedFieldType.value) {
    case DashboardConditionFieldType.Number:
    case DashboardConditionFieldType.TimeStamp:
      return [
        { id: "eq", label: t("admin.dashboardFilterDesigner.eq") },
        { id: "between", label: t("admin.dashboardFilterDesigner.between") },
      ];
    case DashboardConditionFieldType.Select2:
    case DashboardConditionFieldType.CheckBox:
    case DashboardConditionFieldType.Employee2:
    case DashboardConditionFieldType.Department2:
      return [
        { id: "in", label: t("admin.dashboardFilterDesigner.in") },
        { id: "allin", label: t("admin.dashboardFilterDesigner.allin") },
        { id: "eq", label: t("admin.dashboardFilterDesigner.eq") },
        { id: "empty", label: t("admin.dashboardFilterDesigner.empty") },
        { id: "notempty", label: t("admin.dashboardFilterDesigner.notempty") },
      ];
    case DashboardConditionFieldType.Asset:
      return [
        { id: "empty", label: t("admin.dashboardFilterDesigner.empty") },
        { id: "notempty", label: t("admin.dashboardFilterDesigner.notempty") },
      ];
    default:
      return [
        { id: "eq", label: t("admin.dashboardFilterDesigner.eq") },
        { id: "empty", label: t("admin.dashboardFilterDesigner.empty") },
        { id: "notempty", label: t("admin.dashboardFilterDesigner.notempty") },
      ];
  }
});

const filterModeOptions = computed(() => [
  { label: t("admin.dashboardFilterDesigner.optionsMode"), value: "options" },
  { label: t("admin.dashboardFilterDesigner.textMode"), value: "text" },
]);

const defaultModeOptions = computed(() => [
  { label: t("admin.dashboardFilterDesigner.staticValue"), value: "static" },
  { label: t("admin.dashboardFilterDesigner.dynamicValue"), value: "dynamic" },
]);

const dynamicDefaultOptions = computed(() => {
  switch (selectedFieldType.value) {
    case DashboardConditionFieldType.Employee1:
    case DashboardConditionFieldType.Employee2:
      return [{ id: "currentUser", label: t("admin.dashboardFilterDesigner.currentUser") }];
    case DashboardConditionFieldType.Department1:
    case DashboardConditionFieldType.Department2:
      return [{ id: "currentDept", label: t("admin.dashboardFilterDesigner.currentDept") }];
    case DashboardConditionFieldType.TimeStamp:
      return [
        { id: "today", label: t("admin.dashboardFilterDesigner.today") },
        { id: "thisWeek", label: t("admin.dashboardFilterDesigner.thisWeek") },
        { id: "thisMonth", label: t("admin.dashboardFilterDesigner.thisMonth") },
      ];
    default:
      return [];
  }
});

const memberOptions = computed(() => ({
  showTabs: isDepartmentType.value
    ? MemberTabs.Department | MemberTabs.CurDept
    : MemberTabs.Employee | MemberTabs.CurUser,
  multiple: isMultipleType.value,
  limit: memberLimitTags.value.length > 0 && !isDepartmentType.value ? { depts: memberLimitTags.value } : undefined,
}));

const memberLimitOptions = computed(() => ({
  showTabs: MemberTabs.Department | MemberTabs.CurDept,
  multiple: true,
}));

const getBindingField = (dataSourceId: string) => {
  return setting.bindings.find((item) => item.dataSourceId == dataSourceId)?.field?.field;
};

const getSelectableFields = (candidate: IDashboardBindingCandidate) => {
  const selectedGroups = setting.bindings
    .filter((item) => item.dataSourceId != candidate.dataSourceId && item.field)
    .map((item) => item.field ? getFieldTypeGroup(item.field as IFormFieldDef) : undefined)
    .filter(Boolean);

  if (selectedGroups.length == 0) {
    return candidate.fields;
  }

  return candidate.fields.filter((field) => selectedGroups.includes(getFieldTypeGroup(field)));
};

const toggleAll = (checked: boolean) => {
  setting.targetChartIds = checked ? props.chartTargets.map((item) => item.id) : [];
};

const getFieldTypeText = (type?: string) => {
  switch (getDashboardConditionFieldType(type)) {
    case DashboardConditionFieldType.Number:
      return t("admin.dashboardFilterDesigner.fieldType.number");
    case DashboardConditionFieldType.TimeStamp:
      return t("admin.dashboardFilterDesigner.fieldType.time");
    case DashboardConditionFieldType.Employee1:
      return t("admin.dashboardFilterDesigner.fieldType.employee1");
    case DashboardConditionFieldType.Employee2:
      return t("admin.dashboardFilterDesigner.fieldType.employee2");
    case DashboardConditionFieldType.Department1:
      return t("admin.dashboardFilterDesigner.fieldType.department1");
    case DashboardConditionFieldType.Department2:
      return t("admin.dashboardFilterDesigner.fieldType.department2");
    case DashboardConditionFieldType.Select1:
      return t("admin.dashboardFilterDesigner.fieldType.select1");
    case DashboardConditionFieldType.Select2:
      return t("admin.dashboardFilterDesigner.fieldType.select2");
    case DashboardConditionFieldType.CheckBox:
      return t("admin.dashboardFilterDesigner.fieldType.checkbox");
    case DashboardConditionFieldType.Asset:
      return t("admin.dashboardFilterDesigner.fieldType.asset");
    default:
      return t("admin.dashboardFilterDesigner.fieldType.text");
  }
};

const syncDefaultFromSetting = () => {
  const defaultValue = setting.defaultValue;
  if (setting.defaultValueMode == "dynamic") {
    dynamicDefaultType.value = (setting.dynamicDefault?.type || dynamicDefaultOptions.value[0]?.id || "currentUser") as "currentUser" | "currentDept" | "today" | "thisWeek" | "thisMonth";
    return;
  }

  if (isMemberType.value) {
    memberTags.value = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
    return;
  }

  if (setting.operator == "between") {
    rangeValue.value = Array.isArray(defaultValue) ? [defaultValue[0], defaultValue[1]] : [undefined, undefined];
    return;
  }

  if (filterModeEditable.value && setting.filterMode == "options") {
    optionValue.value = defaultValue;
  } else {
    singleValue.value = defaultValue;
  }
};

const syncSingleValue = () => {
  setting.defaultValue = singleValue.value;
};

const syncOptionValue = () => {
  setting.defaultValue = optionValue.value;
};

const syncRangeValue = () => {
  setting.defaultValue = [...rangeValue.value];
};

const openMemberDialog = () => {
  showMemberDialog.value = true;
};

const openMemberLimitDialog = () => {
  showMemberLimitDialog.value = true;
};

const memberSelected = (tags: ISelectedTag[]) => {
  memberTags.value = tags;
  setting.defaultValue = isMultipleType.value ? tags : (tags[0] ? [tags[0]] : []);
};

const memberLimitSelected = (tags: ISelectedTag[]) => {
  memberLimitTags.value = tags;
  (setting as DashboardFilterSetting & { memberLimit?: { deptIds?: string[] } }).memberLimit = {
    deptIds: tags.map((item) => item.id),
  };
};

const loadCurrentOptions = async () => {
  const binding = selectedBindings.value[0];
  if (!binding?.field) {
    currentOptions.value = [];
    return;
  }

  if (binding.field.options?.length) {
    currentOptions.value = binding.field.options.map((item) => ({ id: item.value, label: item.label, value: item.value }));
    return;
  }

  if (setting.rangeSourceType == "memberScope") {
    currentOptions.value = [];
    return;
  }

  const resp = await formDataService.getFilterOptions({
    formId: binding.dataSourceId,
    field: binding.field.field,
    fieldType: binding.field.type,
    limit: 50,
  });
  currentOptions.value = resp.items || [];
};

const applyDynamicDefault = async () => {
  if (setting.defaultValueMode != "dynamic") {
    return;
  }

  const type = dynamicDefaultType.value;
  setting.dynamicDefault = { type };
    if (type == "currentUser") {
      setting.defaultValue = userStore.currentUser.empId
      ? [{ id: userStore.currentUser.empId, label: userStore.currentUser.empName || t("admin.dashboardFilterDesigner.currentUser"), type: DataItemType.Employee }]
      : [];
  } else if (type == "currentDept") {
    const deptId = userStore.currentUser.departmentIds?.[0] ?? userStore.currentUser.deptId;
    const dept = deptId ? await deptStore.get(deptId) : undefined;
    setting.defaultValue = deptId
      ? [{ id: deptId, label: dept?.name || t("admin.dashboardFilterDesigner.currentDept"), type: DataItemType.Department }]
      : [];
  } else if (type == "today") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    setting.defaultValue = [start, end];
    setting.operator = "between";
  } else if (type == "thisWeek") {
    const now = new Date();
    const day = now.getDay() || 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - day + 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    endDate.setMilliseconds(-1);
    setting.defaultValue = [startDate.getTime(), endDate.getTime()];
    setting.operator = "between";
  } else if (type == "thisMonth") {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    endDate.setMilliseconds(-1);
    setting.defaultValue = [startDate.getTime(), endDate.getTime()];
    setting.operator = "between";
  }

  syncDefaultFromSetting();
};

const onFieldChange = async (candidate: IDashboardBindingCandidate, fieldName?: string) => {
  const field = candidate.fields.find((item) => item.field == fieldName);
  setting.bindings = setting.bindings.filter((item) => item.dataSourceId != candidate.dataSourceId);
  if (!field) {
    return;
  }

  setting.bindings.push(toBinding(candidate, field));
  setting.fieldTypeGroup = getFieldTypeGroup(field);
  setting.rangeSourceType = getRangeSourceType(field);
  setting.filterMode = getFilterMode(field);
  if (!operatorOptions.value.some((item) => item.id == setting.operator)) {
    setting.operator = operatorOptions.value[0]?.id;
  }
  await loadCurrentOptions();
  syncDefaultFromSetting();
};

watch(
  () => setting.targetChartIds,
  (ids) => {
    const availableIds = new Set(props.chartTargets.filter((item) => ids.includes(item.id)).map((item) => item.dataSource.id));
    setting.bindings = setting.bindings.filter((item) => availableIds.has(item.dataSourceId));
  },
  { deep: true },
);

watch(
  () => setting.defaultValueMode,
  async (mode) => {
    if (mode == "dynamic") {
      await applyDynamicDefault();
    } else {
      setting.dynamicDefault = undefined;
    }
  },
);

watch(dynamicDefaultType, async () => {
  if (setting.defaultValueMode == "dynamic") {
    await applyDynamicDefault();
  }
});

watch(
  () => setting.operator,
  (newOp, oldOp) => {
    if (newOp == oldOp) return;
    if (newOp == "between" && oldOp != "between") {
      setting.defaultValue = [undefined, undefined];
      setting.defaultValueMode = "static";
    } else if (newOp == "empty" || newOp == "notempty") {
      setting.defaultValue = undefined;
    } else if (oldOp == "between" && newOp != "between") {
      setting.defaultValue = undefined;
    }
    syncDefaultFromSetting();
  },
);

watch(
  () => props.modelValue,
  async (value) => {
    if (value) {
      await loadCurrentOptions();
      syncDefaultFromSetting();
      if (getMemberLimit(setting)?.deptIds?.length) {
        memberLimitTags.value = (getMemberLimit(setting)?.deptIds || []).map((id: string) => ({
          id,
          label: id,
          type: DataItemType.Department,
        }));
      }
    }
  },
  { immediate: true },
);

const emit = defineEmits(["update:modelValue", "close"]);

const onSave = async () => {
  if (setting.defaultValueMode == "dynamic") {
    await applyDynamicDefault();
  }

  const req = {
    id: props.dashItemDef.id,
    name: setting.name,
    details: JSON.stringify(setting),
  };

  await dashboardItemDefService.patch<DashboardItemDef>(req.id, req);
  close();
};

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};
</script>

<style scoped lang="scss">
.drawer-title {
  font-size: var(--et-font-size-20);
  font-weight: 700;
}

.filter-shell {
  height: 100%;
  display: grid;
  grid-template-columns: 260px 1fr 340px;
  background: var(--et-bg-container);
}

.filter-column {
  padding: 24px;
  border-right: 1px solid var(--et-border-color-light);
  overflow: auto;
}

.filter-column:last-child {
  border-right: 0;
}

.column-title {
  font-size: var(--et-font-size-18);
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--et-text-primary);
}

.chart-actions {
  margin-bottom: 12px;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-item,
.field-block {
  margin: 0;
}

.field-block + .field-block {
  margin-top: 18px;
}

.field-block-title {
  margin-bottom: 10px;
  color: var(--et-text-primary);
  font-weight: 500;
}

.field-select,
.full-width,
.operator-select {
  width: 100%;
}

.field-option {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.field-option-type {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
}

.settings-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.value-head-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 10px;
  margin-bottom: 10px;
}

.operator-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.operator-label {
  font-size: var(--et-font-size-11);
  color: var(--et-text-secondary);
  line-height: 1;
}

.default-editor {
  min-height: 40px;
}

.range-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.filter-mode-static {
  font-size: var(--et-font-size-13);
  color: var(--et-text-secondary);
  padding: 4px 0;
}

.range-empty,
.no-value-hint {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  padding: 8px 0;
}

@media (max-width: 1200px) {
  .filter-shell {
    grid-template-columns: 220px 1fr 300px;
  }
}

@media (max-width: 900px) {
  .filter-shell {
    grid-template-columns: 1fr;
  }

  .filter-column {
    border-right: 0;
    border-bottom: 1px solid var(--et-border-color-light);
  }
}
</style>
