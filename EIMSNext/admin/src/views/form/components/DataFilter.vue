<template>
  <div v-click-outside="onClickOutside">
    <!-- <div> -->
    <ConditionList :model-value="modelValue" :form-id="formId" :max-level="1" :field-build-setting="filterFieldBuildSetting" @remove="onClear">
    </ConditionList>
    <div class="actions">
      <el-button type="primary" @click="onSearch">{{ t("common.filter") }}</el-button>
      <el-button>{{ t("common.reset") }}</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IConditionList } from "@eimsnext/components";
import { FieldType, FormFieldPermission, SystemField } from "@eimsnext/models";
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
    formFieldPermissions?: FormFieldPermission[];
  }>(),
  {}
);

const filterFieldBuildSetting = computed(() => ({
  version: 0,
  rule: 0,
  matchType: false,
  fieldLimit: {
    excludeFieldTypes: [FieldType.DataSelect],
    // TODO: 暂时不允许 dataTitle 作为筛选条件（任何情况），后续如恢复删掉此行即可
    excludeSystemFields: [SystemField.DataTitle],
    formFieldPermissions: props.formFieldPermissions,
  },
}));
const onClear = () => {
  props.modelValue.items = [];
}

const emit = defineEmits(["ok", "cancel"]);
const onSearch = () => {
  emit("ok", props.modelValue);
};
const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  let excludedClasses = ["data-filter", "el-select__popper", "el-dropdown__popper"];
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
