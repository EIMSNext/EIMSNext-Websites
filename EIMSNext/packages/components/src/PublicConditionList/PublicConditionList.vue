<template>
  <el-row :gutter="12">
    <el-col v-for="condition in conditions" :key="condition.field!.field" :xs="24" :sm="12">
      <el-form-item :label="condition.field!.label" required>
        <div v-if="condition.field!.type === FieldType.Number" class="range-value">
          <el-input-number v-model="numberValues[condition.field!.field][0]" class="range-input" @change="setRangeCondition(condition, numberValues[condition.field!.field])" />
          <span class="range-separator">-</span>
          <el-input-number v-model="numberValues[condition.field!.field][1]" class="range-input" @change="setRangeCondition(condition, numberValues[condition.field!.field])" />
        </div>
        <el-date-picker
          v-else-if="condition.field!.type === FieldType.TimeStamp"
          v-model="timestampValues[condition.field!.field]"
          type="datetimerange"
          value-format="x"
          class="w-full"
          @change="setTimestampCondition(condition, timestampValues[condition.field!.field])"
        />
        <el-select
          v-else-if="condition.field!.type === FieldType.Radio || condition.field!.type === FieldType.Select1"
          v-model="scalarValues[condition.field!.field]"
          class="w-full"
          filterable
          :remote="hasDynamicSelectSource(condition.field!)"
          :remote-method="(keyword: string) => searchOptions(condition.field!, keyword)"
          :loading="loadingFields[condition.field!.field]"
          @visible-change="(visible: boolean) => loadOptions(condition.field!, visible)"
          @change="setScalarCondition(condition, scalarValues[condition.field!.field])"
        >
          <el-option v-for="option in getOptions(condition.field!)" :key="String(option.value)" :label="option.label" :value="option.value" />
        </el-select>
        <el-input
          v-else
          v-model="scalarValues[condition.field!.field]"
          :type="condition.field!.type === FieldType.TextArea ? 'textarea' : 'text'"
          @blur="setScalarCondition(condition, scalarValues[condition.field!.field])"
        />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { FieldType } from "@eimsnext/models";
import { ConditionOperator, ConditionValueType, IConditionList } from "../ConditionList/type";
import { IFormFieldDef } from "../FieldSelect/type";
import { isDynamicSelectSource, loadDynamicSelectOptions, type DynamicSelectOption, type DynamicSelectSource } from "@eimsnext/utils";

defineOptions({ name: "PublicConditionList" });
const props = defineProps<{
  modelValue: IConditionList;
  fields: IFormFieldDef[];
  optionLoader?: (source: DynamicSelectSource, keyword?: string) => Promise<DynamicSelectOption[]>;
}>();
const emit = defineEmits(["update:modelValue", "change", "validity-change"]);
const scalarValues = reactive<Record<string, string | number | undefined>>({});
const numberValues = reactive<Record<string, [number | null, number | null]>>({});
const timestampValues = reactive<Record<string, [string | null, string | null]>>({});
const dynamicOptions = reactive<Record<string, DynamicSelectOption[]>>({});
const loadingFields = reactive<Record<string, boolean>>({});
const optionRequestIds = reactive<Record<string, number>>({});
const isRangeField = (type: FieldType) => type === FieldType.Number || type === FieldType.TimeStamp;
const createCondition = (field: IFormFieldDef): IConditionList => ({
  id: `public_${field.field}`,
  field,
  op: isRangeField(field.type) ? ConditionOperator.Between : ConditionOperator.Equals,
  value: { type: ConditionValueType.Custom, value: isRangeField(field.type) ? [] : undefined },
});
const conditions = computed(() => props.modelValue.items || []);
const hasDynamicSelectSource = (field: IFormFieldDef) => field.type === FieldType.Select1 && isDynamicSelectSource(field.source);
const getOptions = (field: IFormFieldDef) => hasDynamicSelectSource(field)
  ? mergeSelectedOptions(dynamicOptions[field.field] || [], scalarValues[field.field])
  : (field.options || []).map((option) => ({ label: option.label, value: option.value }));
const loadOptions = async (field: IFormFieldDef, visible: boolean) => {
  if (!visible || !hasDynamicSelectSource(field) || !field.source || dynamicOptions[field.field]?.length || loadingFields[field.field]) return;
  await searchOptions(field, "");
};
const searchOptions = async (field: IFormFieldDef, keyword: string) => {
  if (!hasDynamicSelectSource(field) || !field.source) return;
  const requestId = (optionRequestIds[field.field] || 0) + 1;
  optionRequestIds[field.field] = requestId;
  loadingFields[field.field] = true;
  try {
    const options = await (props.optionLoader || loadDynamicSelectOptions)(field.source, keyword);
    if (requestId === optionRequestIds[field.field]) {
      dynamicOptions[field.field] = options;
    }
  } catch {
    if (requestId === optionRequestIds[field.field]) {
      dynamicOptions[field.field] = [];
    }
  } finally {
    if (requestId === optionRequestIds[field.field]) {
      loadingFields[field.field] = false;
    }
  }
};
const mergeSelectedOptions = (options: DynamicSelectOption[], selected: unknown): DynamicSelectOption[] => {
  if (selected === undefined || selected === null || selected === "" || options.some((option) => String(option.value) === String(selected))) return options;
  return [...options, { label: String(selected), value: selected as string | number | boolean }];
};
const normalize = () => {
  const current = new Map((props.modelValue.items || []).map((item) => [item.field?.field, item]));
  const items = props.fields.map((field) => current.get(field.field) || createCondition(field));
  items.forEach((item) => {
    item.field = props.fields.find((field) => field.field === item.field?.field) || item.field;
    if (!item.field || !item.value) return;
    item.op = isRangeField(item.field.type) ? ConditionOperator.Between : ConditionOperator.Equals;
    item.value.type = ConditionValueType.Custom;
    if (item.field.type === FieldType.Number) {
      const values = Array.isArray(item.value.value) ? item.value.value : [];
      numberValues[item.field.field] = [values[0] ?? null, values[1] ?? null];
      item.value.value = numberValues[item.field.field];
    } else if (item.field.type === FieldType.TimeStamp) {
      const values = Array.isArray(item.value.value) ? item.value.value : [];
      timestampValues[item.field.field] = [values[0] == null ? null : String(values[0]), values[1] == null ? null : String(values[1])];
    } else {
      scalarValues[item.field.field] = item.value.value;
    }
  });
  emit("update:modelValue", { id: props.modelValue.id || "public_conditions", rel: "and", items });
  emit("validity-change", items.length === props.fields.length && items.every(isFilled));
};
const setRangeCondition = (condition: IConditionList, value?: [number | string | null, number | string | null]) => {
  if (!condition.value) return;
  condition.value.value = value?.[0] == null || value?.[1] == null ? [] : value;
  emitChange();
};
const setTimestampCondition = (condition: IConditionList, value?: [string | null, string | null]) => {
  if (!condition.value) return;
  condition.value.value = value?.[0] == null || value?.[1] == null ? [] : [Number(value[0]), Number(value[1])];
  emitChange();
};
const setScalarCondition = (condition: IConditionList, value?: string | number) => {
  if (!condition.value) return;
  condition.value.value = value;
  emitChange();
};
const isFilled = (condition: IConditionList) => {
  const value = condition.value?.value;
  if (Array.isArray(value)) {
    if (value.length !== 2 || value.some((item) => item === null || item === undefined || item === "")) return false;
    return Number(value[0]) <= Number(value[1]);
  }
  return value !== null && value !== undefined && `${value}`.trim() !== "";
};
const emitChange = () => {
  emit("update:modelValue", { ...props.modelValue, rel: "and", items: conditions.value });
  emit("change");
  emit("validity-change", conditions.value.length === props.fields.length && conditions.value.every(isFilled));
};
watch(() => props.fields, normalize, { immediate: true, deep: true });
watch(() => props.modelValue.items?.length, (length) => {
  if (length !== props.fields.length) normalize();
});
</script>

<style scoped>
.range-value {
  align-items: center;
  display: flex;
  gap: 8px;
  width: 100%;
}

.range-input {
  min-width: 0;
  width: 100%;
}

.range-separator {
  color: var(--el-text-color-secondary);
}
</style>
