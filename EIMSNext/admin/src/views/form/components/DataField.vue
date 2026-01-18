<template>
    <div v-click-outside="onClickOutside">
        <et-list v-model="value" :data="fieldList" :selectable="true"></et-list>
        <div class="actions">
            <el-button type="primary" @click="onOk">{{ t("common.ok") }}</el-button>
            <el-button @click="onCancel">{{ t("common.cancel") }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IListItem, IFormFieldDef, buildFieldListItems } from "@eimsnext/components";
import { IFieldPerm } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { ClickOutside as vClickOutside } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
    name: "DataField",
});
const props = defineProps<{
    modelValue: IFormFieldDef[];
    formId: string;
    fieldPerms?: IFieldPerm[];
}>();

const formStore = useFormStore();
const fieldList = ref<IListItem[]>([]);
const value = ref(props.modelValue.map(x => x.field));

const emit = defineEmits(["update:modelValue", "ok", "cancel"]);
const onOk = () => {
    let listItem = fieldList.value.filter((x) => value.value.indexOf(x.id) > -1).map(x => x.data);
    emit("update:modelValue", listItem);
    emit("ok", listItem);
};

const onCancel = () => {
    emit("cancel");
};
const onClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    let excludedClasses = ["data-field", "el-select__popper", "el-dropdown__popper"];
    if (excludedClasses.some((cls) => target.closest(`.${cls}`))) {
        return;
    }
    emit("cancel");
};
onBeforeMount(() => {
    formStore.get(props.formId).then((form) => {
        if (form?.content?.items)
            fieldList.value = buildFieldListItems(form.id, form.content.items, form.usingWorkflow, undefined, { fieldPerms: props.fieldPerms });
    });
})
</script>
<style lang="scss" scoped>
.actions {
    //   border-top: solid 1px #ddd;
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    padding-top: 5px;
}
</style>