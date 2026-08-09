<template>
  <el-select v-model="value" size="default" @change="onInput">
    <el-option
      v-for="item in fieldList"
      :key="item.id"
      :label="item.label"
      :value="item.id"
      :disabled="item.data?.missing"
    >
      <span :class="{ 'missing-field-option': item.data?.missing }">{{ item.label }}</span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { IFormFieldDef, buildFieldListItems } from "./type";
import { computed, ref, watch } from "vue";
import { IListItem } from "@/list/type";
import { IFieldLimit } from "@/NodeFieldList/type";
import { DataItemType } from "@/common";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "FieldSelect",
});
const props = defineProps<{
  modelValue: IFormFieldDef;
  formId: string;
  fieldLimit?: IFieldLimit;
  fields?: IFormFieldDef[];
  useFields?: boolean;
}>();

const formStore = useFormStore();
const fieldList = ref<IListItem[]>([]);

const value = ref(props.modelValue?.field);

const customFieldList = computed<IListItem[]>(() => {
  return (props.fields || []).map((field) => ({
    id: field.field,
    label: field.label,
    data: field,
    type: DataItemType.Field,
  }));
});

const missingLabel = (field: IFormFieldDef) => {
  const label = field.label || field.field;
  return label.includes(t("dataflow.deletedField")) ? label : `${label}（${t("dataflow.deletedField")}）`;
};

const appendMissingSelectedField = (items: IListItem[]) => {
  const selected = props.modelValue;
  const normalizedItems = items.filter((item) => !item.data?.missing || item.id === selected?.field);
  if (!selected?.field || normalizedItems.some((item) => item.id === selected.field)) {
    return normalizedItems;
  }

  return [
    {
      id: selected.field,
      label: missingLabel(selected),
      data: { ...selected, label: missingLabel(selected), missing: true },
      type: DataItemType.Field,
    },
    ...normalizedItems,
  ];
};

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = fieldList.value.find((x) => x.id == val)!;
  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
  [() => props.formId, () => props.fieldLimit, () => props.fields],
  ([newFormId]) => {
    if (props.useFields || customFieldList.value.length > 0) {
      fieldList.value = appendMissingSelectedField(customFieldList.value);
      return;
    }

    if (newFormId) {
      formStore.get(newFormId).then((form) => {
        if (form?.content?.items) {
          fieldList.value = appendMissingSelectedField(
            buildFieldListItems(newFormId, form?.content?.items, form.usingWorkflow, undefined, {
              ...(props.fieldLimit || {}),
              t,
            }),
          );
        }
      });
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (newValue) => {
    value.value = newValue?.field;
    fieldList.value = appendMissingSelectedField(fieldList.value);
  },
  { immediate: true, deep: true },
);
</script>
<style lang="scss" scoped>
.missing-field-option {
  color: var(--et-color-danger);
}
</style>
