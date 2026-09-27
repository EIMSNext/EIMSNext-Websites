<template>
  <el-select v-model="value" size="default" :placeholder="t('eventFlow.selectForm')" @change="onInput">
    <el-option v-for="item in formList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { useAppStore, useFormStore } from "@eimsnext/store";
import { IFormItem, IFormSelectOptions, buildFormDefListItems, buildFormListItems } from "./type";
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
  sourceScope?: "currentApp" | "crossApp";
  targetAppId?: string;
}>();

const appStore = useAppStore();
const formStore = useFormStore();
const formList = ref<IFormItem[]>([]);

const value = ref(props.modelValue?.id || "");

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let formitem = formList.value.find((x) => x.id == val)!;
  emit("update:modelValue", formitem);
  emit("change", formitem);
};

watch(
  [() => props.appId, () => props.modelValue, () => props.sourceScope, () => props.targetAppId],
  ([newAppId, newModel], [oldAppId, oldModel]) => {
    if (newAppId && (newAppId != oldAppId || props.sourceScope === "crossApp")) {
      loadForms(newAppId);
    }
    if (newModel && newModel != oldModel) {
      value.value = newModel.id || "";
    }
  },
  { immediate: true },
);

async function loadForms(appId: string) {
  if (props.sourceScope === "crossApp") {
    const forms = await formStore.loadFormsIncludeCross(props.targetAppId || appId);
    formList.value = buildFormDefListItems(forms, props.options);
    return;
  }

  const app = await appStore.get(appId);
  formList.value = buildFormListItems(app!, props.options);
}
</script>
