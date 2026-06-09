<template>
  <el-select v-model="value" size="default" @change="onInput">
    <el-option v-for="item in fieldList" :key="item.id" :label="item.label" :value="item.id" />
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

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = fieldList.value.find((x) => x.id == val)!;
  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
  [() => props.formId, () => props.fieldLimit, () => props.fields],
  ([newFormId]) => {
    if (customFieldList.value.length > 0) {
      fieldList.value = customFieldList.value;
      return;
    }

    if (newFormId) {
      formStore.get(newFormId).then((form) => {
        if (form?.content?.items) {
          fieldList.value = buildFieldListItems(newFormId, form?.content?.items, form.usingWorkflow, undefined, {
            ...(props.fieldLimit || {}),
            t,
          });
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
  },
  { immediate: true, deep: true },
);
</script>
