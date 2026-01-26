<template>
  <el-select v-model="value" size="default" :placeholder="t('dataflow.selectForm')" @change="onInput">
    <el-option v-for="item in formList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { useFormStore, useAppStore } from "@eimsnext/store";
import { IFormItem, buildFormListItems } from "./type";
import { IListItem } from "@/list/type";
import { ref, watch } from "vue";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "FormSelect",
});
const props = defineProps<{
  modelValue: IFormItem;
  appId: string;
}>();
const appStore = useAppStore()
const formList = ref<IListItem[]>([]);

const value = ref(props.modelValue?.id);

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let formtem = formList.value.find((x) => x.id == val)!;
  emit("update:modelValue", formtem);
  emit("change", formtem);
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
