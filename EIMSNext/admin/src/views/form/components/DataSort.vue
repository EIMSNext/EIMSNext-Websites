<template>
  <div v-click-outside="onClickOutside">
    <FieldSortList v-model="sortList" :form-id="formId" :formFieldPermissions="formFieldPermissions"></FieldSortList>
    <div class="actions">
      <el-button type="primary" @click="onSort">{{ t("common.sort") }}</el-button>
      <el-button class="delete-button" @click="onDeleteAll">{{ t("common.deleteAll") }}</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IFieldSortList } from "@eimsnext/components";
import { FormFieldPermission } from "@eimsnext/models";
import { ClickOutside as vClickOutside } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "DataSort",
});

const props = withDefaults(
  defineProps<{
    modelValue: IFieldSortList;
    formId: string;
    formFieldPermissions?: FormFieldPermission[];
  }>(),
  {}
);

const sortList = toRef(props, "modelValue");

const emit = defineEmits(["ok", "cancel", "clear"]);
const onSort = () => {
  emit("ok", sortList.value);
};
const onDeleteAll = () => {
  emit("clear");
};
const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  let excludedClasses = ["data-sort", "el-dropdown-menu__item", "el-select__popper", "el-dropdown__popper"];
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
