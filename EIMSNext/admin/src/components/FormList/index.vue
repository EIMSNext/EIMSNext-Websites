<template>
  <el-select v-model="value" size="default" @change="onInput">
    <el-option v-for="item in formList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { IListItem } from "@eimsnext/components";
import { useFormStore, useAppStore } from "@eimsnext/store";
import { IFormItem, buildFormListItems } from "./type";

defineOptions({
  name: "FormList",
});
const props = defineProps<{
  modelValue: IFormItem;
  appId: string;
}>();
const appStore = useAppStore()
const formStore = useFormStore();
const formList = ref<IListItem[]>([]);
// console.log("form stores", formStore.items, props.appId);
// formList.value = buildFormListItems(formStore.items.filter((x) => x.appId == props.appId));
// console.log("form list", formList.value);

const value = ref(props.modelValue?.id);

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = formList.value.find((x) => x.id == val)!;
  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
  [() => props.appId, () => props.modelValue],
  ([newAppId, newModel], [oldAppId, oldModel]) => {
    if (newAppId && newAppId != oldAppId) {
      appStore.get(newAppId).then(app => {
        formList.value = buildFormListItems(app!);
      })
    }
    if (newModel && newModel != oldModel) value.value = newModel.id;
  },
  { immediate: true }
);
</script>
