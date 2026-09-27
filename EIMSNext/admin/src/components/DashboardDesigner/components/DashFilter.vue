<template>
    <div v-click-outside="onClickOutside">
        <ConditionList v-model="condList" :form-id="formId" :max-level="1" @change="onChange" @remove="onClear">
        </ConditionList>
        <div class="actions">
            <el-button type="primary" @click="onSearch">{{ t("common.filter") }}</el-button>
            <el-button @click="onReset">{{ t("common.reset") }}</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { IConditionList } from "@eimsnext/components";
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

const condList = toRef<IConditionList>(props.modelValue);

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
