<template>
  <div v-click-outside="onClickOutside">
    <!-- <div> -->
    <ConditionList
      v-model="condList"
      :form-id="formId"
      :max-level="1"
      @change="onChange"
    ></ConditionList>
    <div class="actions">
      <el-button type="primary" @click="onSearch">{{ t("common.filter") }}</el-button>
      <el-button>{{ t("common.reset") }}</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IConditionList } from "@eimsnext/components";
import { ClickOutside as vClickOutside } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "DataFilter",
});

const props = withDefaults(
  defineProps<{
    modelValue: IConditionList;
    formId: string;
  }>(),
  {}
);

const condList = toRef<IConditionList>(props.modelValue);
const onChange = (filter: IConditionList) => {
  condList.value = filter;
};

const emit = defineEmits(["ok", "cancel"]);
const onSearch = () => {
  emit("ok", condList.value);
};
const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  let excludedClasses = ["data-filter", "el-select__popper"];
  if (excludedClasses.some((cls) => target.closest(`.${cls}`))) {
    return;
  }
  emit("cancel");
};
</script>
<style lang="scss" scoped>
.actions {
  // border-top: solid 1px #ddd;
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  padding-top: 5px;
}
</style>
