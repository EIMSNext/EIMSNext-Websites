<template>
  <el-select v-model="value" size="default" :placeholder="t('dataflow.selectForm')" @change="onInput">
    <el-option v-for="item in formList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { useAppStore } from "@eimsnext/store";
import { IFormItem, IFormSelectOptions, buildFormListItems } from "./type";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "FormSelect",
});
const props = defineProps<{
  modelValue: IFormItem;
  appId: string;
  options?: IFormSelectOptions;
}>();

const appStore = useAppStore();
const formList = ref<IFormItem[]>([]);

const value = ref(props.modelValue?.id || "");

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let formitem = formList.value.find((x) => x.id == val)!;
  emit("update:modelValue", formitem);
  emit("change", formitem);
};

watch(
  [() => props.appId, () => props.modelValue],
  ([newAppId, newModel], [oldAppId, oldModel]) => {
    if (newAppId && newAppId != oldAppId) {
      appStore.get(newAppId).then((app) => {
        formList.value = buildFormListItems(app!, props.options);
      });
    }
    if (newModel && newModel != oldModel) {
      value.value = newModel.id || "";
    }
  },
  { immediate: true },
);
</script>
