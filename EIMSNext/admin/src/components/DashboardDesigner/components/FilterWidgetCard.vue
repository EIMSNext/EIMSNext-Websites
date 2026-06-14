<template>
  <div class="filter-widget-card">
    <div class="filter-widget-header">{{ setting.name || itemDef.name }}</div>

    <div v-if="selectedBinding?.field" class="filter-widget-body">
      <div v-if="isNoValueOp" class="no-value-hint">{{ t("admin.dashFilter.noInput") }}</div>

      <selected-tags
        v-else-if="isMemberType"
        :model-value="memberValue"
        :multiple="isMultiple"
        :editable="true"
        :empty-text="isDepartmentType ? t('comp.emptyDept') : t('comp.emptyEmp')"
        @editTag="showMemberDialog = true"
      />

      <div v-else-if="showRangeMode" class="range-wrapper">
        <el-input v-model="rangeValue[0]" :placeholder="t('common.minValue')" @change="emitRangeValue" />
        <el-input v-model="rangeValue[1]" :placeholder="t('common.maxValue')" @change="emitRangeValue" />
      </div>

      <el-select
        v-else-if="showOptionsMode"
        v-model="optionValue"
        :multiple="isMultiple"
        filterable
        clearable
        :placeholder="t('common.pleaseSelect')"
        class="full-width"
        @change="emitOptionValue"
      >
        <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.value ?? item.id" />
      </el-select>

      <el-input v-else v-model="textValue" :placeholder="t('common.pleaseInput')" @change="emitTextValue" />
    </div>

    <div v-else class="filter-widget-empty">{{ t("admin.dashFilter.emptyBinding") }}</div>
  </div>

  <member-select-dialog
    v-model="showMemberDialog"
    :tags="memberValue"
    :member-options="memberOptions"
    @ok="memberSelected"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  DataItemType,
  ISelectedTag,
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
} from "@eimsnext/components";
import { DashboardFilterSetting, DashboardItemDef, FieldType } from "@eimsnext/models";
import { useDeptStore, useUserStore } from "@eimsnext/store";
import { IFormDataFilterOptionItem, formDataService } from "@eimsnext/services";
import { DashboardConditionFieldType, getDashboardConditionFieldType, isDashboardMultiValueType } from "../fieldType";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "FilterWidgetCard",
});

const props = defineProps<{
  itemDef: DashboardItemDef;
}>();

const emit = defineEmits(["change"]);

const userStore = useUserStore();
const deptStore = useDeptStore();
const showMemberDialog = ref(false);
const options = ref<IFormDataFilterOptionItem[]>([]);
const optionValue = ref<any>();
const textValue = ref<any>();
const rangeValue = ref<[any, any]>([undefined, undefined]);
const memberValue = ref<ISelectedTag[]>([]);

const setting = computed<DashboardFilterSetting>(() => JSON.parse(props.itemDef.details || "{}"));
const getMemberLimit = (value: DashboardFilterSetting): { deptIds?: string[] } | undefined => {
  return (value as DashboardFilterSetting & { memberLimit?: { deptIds?: string[] } }).memberLimit;
};
const selectedBinding = computed(() => setting.value.bindings?.[0]);
const fieldTypeGroup = computed(() => selectedBinding.value?.field ? getDashboardConditionFieldType(selectedBinding.value.field.type as FieldType) : DashboardConditionFieldType.Other);
const isMultiple = computed(() => isDashboardMultiValueType(selectedBinding.value?.field?.type as FieldType));
const isMemberType = computed(() => [DashboardConditionFieldType.Employee1, DashboardConditionFieldType.Employee2, DashboardConditionFieldType.Department1, DashboardConditionFieldType.Department2].includes(fieldTypeGroup.value));
const isDepartmentType = computed(() => [DashboardConditionFieldType.Department1, DashboardConditionFieldType.Department2].includes(fieldTypeGroup.value));
const showRangeMode = computed(() => setting.value.operator == "between");
const isNoValueOp = computed(() => ["empty", "notempty"].includes(setting.value.operator ?? ""));
const showOptionsMode = computed(() => setting.value.filterMode == "options" && !showRangeMode.value && !isMemberType.value && !isNoValueOp.value);

const memberOptions = computed(() => ({
  showTabs: isDepartmentType.value ? MemberTabs.Department | MemberTabs.CurDept : MemberTabs.Employee | MemberTabs.CurUser,
  multiple: isMultiple.value,
  limit: !isDepartmentType.value && getMemberLimit(setting.value)?.deptIds?.length
    ? {
        depts: (getMemberLimit(setting.value)?.deptIds || []).map((id: string) => ({ id, label: id, type: DataItemType.Department })),
      }
    : undefined,
}));

const emitValue = (value: any) => {
  emit("change", { itemId: props.itemDef.id, value });
};

const emitOptionValue = () => emitValue(optionValue.value);
const emitTextValue = () => emitValue(textValue.value);
const emitRangeValue = () => emitValue([...rangeValue.value]);

const memberSelected = (tags: ISelectedTag[]) => {
  memberValue.value = tags;
  emitValue(isMultiple.value ? tags : (tags[0] ? [tags[0]] : []));
};

const resolveDynamicDefault = async () => {
  switch (setting.value.dynamicDefault?.type) {
    case "currentUser":
      return userStore.currentUser.empId
        ? [{ id: userStore.currentUser.empId, label: userStore.currentUser.empName || t("admin.dashFilter.currentUser"), type: DataItemType.Employee }]
        : [];
    case "currentDept":
      const deptId = userStore.currentUser.departmentIds?.[0] ?? userStore.currentUser.deptId;
      if (!deptId) return [];
      const dept = await deptStore.get(deptId);
      return [{ id: deptId, label: dept?.name || t("admin.dashFilter.currentDept"), type: DataItemType.Department }];
    default:
      return setting.value.defaultValue;
  }
};

const applyDefaultValue = async () => {
  if (isNoValueOp.value) return;

  const defaultValue = setting.value.defaultValueMode == "dynamic"
    ? await resolveDynamicDefault()
    : setting.value.defaultValue;

  if (isMemberType.value) {
    memberValue.value = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
    emitValue(memberValue.value);
    return;
  }

  if (showRangeMode.value) {
    rangeValue.value = Array.isArray(defaultValue) ? [defaultValue[0], defaultValue[1]] : [undefined, undefined];
    emitRangeValue();
    return;
  }

  if (showOptionsMode.value) {
    optionValue.value = defaultValue;
    emitOptionValue();
    return;
  }

  textValue.value = defaultValue;
  emitTextValue();
};

const loadOptions = async () => {
  const binding = selectedBinding.value;
  if (!binding?.field) {
    options.value = [];
    return;
  }

  if (binding.field.options?.length) {
    options.value = binding.field.options.map((item) => ({ id: item.value, label: item.label, value: item.value }));
    return;
  }

  if (setting.value.rangeSourceType == "memberScope") {
    options.value = [];
    return;
  }

  const resp = await formDataService.getFilterOptions({
    formId: binding.dataSourceId,
    field: binding.field.field,
    fieldType: binding.field.type,
    limit: 50,
  });
  options.value = resp.items || [];
};

onMounted(async () => {
  await loadOptions();
  await applyDefaultValue();
});
</script>

<style scoped lang="scss">
.filter-widget-card {
  width: 100%;
  height: 100%;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.filter-widget-header {
  font-size: var(--et-font-size-14);
  font-weight: 700;
  color: var(--et-text-primary);
}

.filter-widget-body {
  min-height: 40px;
}

.full-width {
  width: 100%;
}

.range-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.no-value-hint {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  padding: 8px 0;
}

.filter-widget-empty {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
}
</style>
