<template>
    <div v-click-outside="onClickOutside" class="no-drag">
        <div class="sort-title">设置排序规则</div>
        <SortList v-model="sortList" :sortFields="sortFields" :editable="false" :multiple="false" @change="onChange">
        </SortList>
        <div class="actions">
            <el-button @click="onCancel">{{ t("common.cancel") }}</el-button>
            <el-button type="primary" @click="onSort">{{ t("common.sort") }}</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ISortList, ISortField } from "@eimsnext/components";
import { ClickOutside as vClickOutside } from "element-plus";
import { cloneDeep } from "lodash-es";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
    name: "DataSort",
});

const props = withDefaults(
    defineProps<{
        modelValue: ISortList;
        sortFields: ISortField[]
    }>(),
    {}
);

const sortList = ref<ISortList>();
const onChange = (sort: ISortList) => {
    sortList.value = sort;
};

const emit = defineEmits(["ok", "cancel"]);
const onSort = () => {
    emit("ok", sortList.value);
};
const onCancel = () => {
    emit("cancel")
}
const onClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    let excludedClasses = ["data-sort", "el-dropdown-menu__item", "el-select__popper", "el-dropdown__popper"];
    if (excludedClasses.some((cls) => target.closest(`.${cls}`))) {
        return;
    }
    emit("cancel");
};

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        sortList.value = cloneDeep(props.modelValue)
    }
}, {
    immediate: true,
    deep: true
});
</script>
<style lang="scss" scoped>
.sort-title {
    height: 30px;
    border-bottom: solid 1px var(--et-color-border);
    margin-bottom: 5px;
    font-weight: 600;
    font-size: 14px;
}

.actions {
    // border-top: solid 1px #ddd;
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    padding-top: 5px;
}
</style>
