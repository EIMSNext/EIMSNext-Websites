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
      <el-button type="primary" @click="onSearch">筛选</el-button>
      <el-button>重置</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import ConditionList from "@/components/ConditionList/index.vue";
import { IConditionList } from "@/components/ConditionList/type";
import { ClickOutside as vClickOutside } from "element-plus";

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
