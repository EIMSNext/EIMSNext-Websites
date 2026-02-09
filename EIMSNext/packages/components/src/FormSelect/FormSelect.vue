<template>
  <el-select v-model="value" size="default" :placeholder="t('dataflow.selectForm')" @change="onInput">
    <el-option v-for="item in formList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { useAppStore } from "@eimsnext/store";
import { IFormItem, IFormSelectOptions, buildFormListItems } from "./type";
import { ref, watch } from "vue";
import { isObject, isString } from "@eimsnext/utils";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "FormSelect",
});
const props = defineProps<{
  modelValue: IFormItem | string;
  appId: string;
  options?: IFormSelectOptions
}>();

const appStore = useAppStore()
const formList = ref<IFormItem[]>([]);

const value = ref("");
if (isObject(props.modelValue))
  value.value = (props.modelValue as IFormItem).id || ""
else
  value.value = props.modelValue || ""

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
        formList.value = buildFormListItems(app!, props.options);
      })
    }
    if (newModel && newModel != oldModel) {
      // console.log("newmode", newModel)
      if (isString(newModel))
        value.value = newModel || ""
      else
        value.value = (newModel as IFormItem).id || ""
    }
  },
  { immediate: true }
);
</script>
