<template>
    <div v-click-outside="onClickOutside">
        <ConditionList v-model="condList" :form-id="formId" :max-level="1" :field-build-setting="filterFieldBuildSetting" @change="onChange" @remove="onClear">
        </ConditionList>
        <div class="actions">
            <el-button type="primary" @click="onSearch">{{ t("common.filter") }}</el-button>
            <el-button @click="onReset">{{ t("common.reset") }}</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { IConditionList } from "@eimsnext/components";
import { SystemField } from "@eimsnext/models";
import { uniqueId } from "@eimsnext/utils";
import { ClickOutside as vClickOutside } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
    name: "DashFilter",
});

const props = withDefaults(
    defineProps<{
        modelValue: IConditionList;
        formId: string;
    }>(),
    {}
);

const condList = ref(props.modelValue);
// 与 ConditionList 默认 setting 保持一致（rule: All=0, matchType: false），仅追加 dataTitle 排除
const filterFieldBuildSetting = {
    version: 0,
    rule: 0,
    matchType: false,
    fieldLimit: {
        // TODO: 暂时不允许 dataTitle 作为筛选条件（任何情况），后续如恢复删掉此行即可
        excludeSystemFields: [SystemField.DataTitle],
    },
};
watch(
  () => props.modelValue,
  (list) => {
    condList.value = list;
  },
  { immediate: true }
);

    const onChange = (filter: IConditionList) => {
    condList.value = filter;
};
const onClear = () => {
    condList.value.items = []
}

const emit = defineEmits(["ok", "cancel"]);
const onSearch = () => {
    emit("ok", condList.value);
};
const onReset = () => {
    condList.value = { id: uniqueId(), rel: "and", items: [] };
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
