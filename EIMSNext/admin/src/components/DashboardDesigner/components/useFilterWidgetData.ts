import { computed, ref } from "vue";
import {
  DataItemType,
  ISelectedTag,
  MemberTabs,
} from "@eimsnext/components";
import { DashboardFilterSetting, DashboardItemDef, FieldType } from "@eimsnext/models";
import { useDeptStore, useUserStore } from "@eimsnext/store";
import { IFormDataFilterOptionItem, formDataService } from "@eimsnext/services";
import { DashboardConditionFieldType, getDashboardConditionFieldType, isDashboardMultiValueType } from "../fieldType";
import { useI18n } from "vue-i18n";

export function useFilterWidgetData(props: { itemDef: DashboardItemDef; isPublic?: boolean }) {
  const { t } = useI18n();
  const userStore = useUserStore();
  const deptStore = useDeptStore();

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
  const fieldTypeGroup = computed(() =>
    selectedBinding.value?.field
      ? getDashboardConditionFieldType(selectedBinding.value.field.type as FieldType)
      : DashboardConditionFieldType.Other
  );
  const isMultiple = computed(() => isDashboardMultiValueType(selectedBinding.value?.field?.type as FieldType));
  const isMemberType = computed(() =>
    [DashboardConditionFieldType.Employee1, DashboardConditionFieldType.Employee2,
     DashboardConditionFieldType.Department1, DashboardConditionFieldType.Department2].includes(fieldTypeGroup.value)
  );
  const isDepartmentType = computed(() =>
    [DashboardConditionFieldType.Department1, DashboardConditionFieldType.Department2].includes(fieldTypeGroup.value)
  );
  const showRangeMode = computed(() => setting.value.operator == "between");
  const isNoValueOp = computed(() => ["empty", "notempty"].includes(setting.value.operator ?? ""));
  const showOptionsMode = computed(() =>
    setting.value.filterMode == "options" && !showRangeMode.value && !isMemberType.value && !isNoValueOp.value
  );

  const memberOptions = computed(() => ({
    showTabs: isDepartmentType.value
      ? MemberTabs.Department | MemberTabs.CurDept
      : MemberTabs.Employee | MemberTabs.CurUser,
    multiple: isMultiple.value,
    limit: !isDepartmentType.value && getMemberLimit(setting.value)?.deptIds?.length
      ? {
          depts: (getMemberLimit(setting.value)?.deptIds || []).map((id: string) => ({
            id,
            label: id,
            type: DataItemType.Department,
          })),
        }
      : undefined,
  }));

  const resolveDynamicDefault = async () => {
    if (props.isPublic) {
      return [];
    }

    switch (setting.value.dynamicDefault?.type) {
      case "currentUser":
        return userStore.currentUser.empId
          ? [{ id: userStore.currentUser.empId, label: userStore.currentUser.empName || t("admin.dashFilter.currentUser"), type: DataItemType.Employee }]
          : [];
      case "currentDept": {
        const deptId = userStore.currentUser.departmentIds?.[0] ?? userStore.currentUser.deptId;
        if (!deptId) return [];
        const dept = await deptStore.get(deptId);
        return [{ id: deptId, label: dept?.name || t("admin.dashFilter.currentDept"), type: DataItemType.Department }];
      }
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
      return { itemId: props.itemDef.id, value: memberValue.value };
    }

    if (showRangeMode.value) {
      rangeValue.value = Array.isArray(defaultValue) ? [defaultValue[0], defaultValue[1]] : [undefined, undefined];
      return { itemId: props.itemDef.id, value: [...rangeValue.value] };
    }

    if (showOptionsMode.value) {
      optionValue.value = defaultValue;
      return { itemId: props.itemDef.id, value: optionValue.value };
    }

    textValue.value = defaultValue;
    return { itemId: props.itemDef.id, value: textValue.value };
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

    const request = {
      formId: binding.dataSourceId,
      field: binding.field.field,
      fieldType: binding.field.type,
      limit: 50,
    };
    const resp = await formDataService.getFilterOptions(request);
    options.value = resp.items || [];
  };

  return {
    options,
    optionValue,
    textValue,
    rangeValue,
    memberValue,
    setting,
    selectedBinding,
    fieldTypeGroup,
    isMultiple,
    isMemberType,
    isDepartmentType,
    showRangeMode,
    isNoValueOp,
    showOptionsMode,
    memberOptions,
    applyDefaultValue,
    loadOptions,
  };
}
