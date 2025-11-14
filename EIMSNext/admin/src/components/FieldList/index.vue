<template>
  <el-select v-model="value" size="default" @change="onInput">
    <el-option v-for="item in fieldList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { IListItem } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";
import { IFormFieldDef, buildFieldListItems } from "./type";

defineOptions({
  name: "FieldList",
});
const props = defineProps<{
  formId: string;
  modelValue: IFormFieldDef;
}>();

const formStore = useFormStore();
const fieldList = ref<IListItem[]>([]);

const value = ref(props.modelValue?.field);

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = fieldList.value.find((x) => x.id == val)!;
  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
  [() => props.formId, () => props.modelValue],
  ([newFormId, newModel], [oldFormId, oldModel]) => {
    if (newFormId && newFormId != oldFormId) {
      formStore.get(newFormId).then((form) => {
        if (form?.content?.items)
          fieldList.value = buildFieldListItems(newFormId, form.content.items, form.usingWorkflow);
      });
    }
    if (newModel && newModel != oldModel) value.value = newModel.field;
  },
  { immediate: true }
);
</script>
