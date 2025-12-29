<template>
  <div v-click-outside="onClickOutside">
    <FieldSortList v-model="sortList" :form-id="formId" @change="onChange"></FieldSortList>
    <div class="actions">
      <el-button type="primary" @click="onSort">{{ t("common.sort") }}</el-button>
      <el-button>{{ t("common.deleteAll") }}</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IFieldSortList } from "@eimsnext/components";
import { ClickOutside as vClickOutside } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "DataFilter",
});

const props = withDefaults(
  defineProps<{
    modelValue: IFieldSortList;
    formId: string;
  }>(),
  {}
);

const sortList = toRef<IFieldSortList>(props.modelValue);
const onChange = (sort: IFieldSortList) => {
  sortList.value = sort;
};

const emit = defineEmits(["ok", "cancel"]);
const onSort = () => {
  emit("ok", sortList.value);
};
const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  let excludedClasses = ["data-sort", "el-dropdown-menu__item"];
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
