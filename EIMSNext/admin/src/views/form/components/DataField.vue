<template>
    <div>
        <et-list v-model="value" :data="fieldList" :selectable="true"></et-list>
        <div class="actions">
            <el-button type="primary" @click="onOk">确定</el-button>
            <el-button @click="onCancel">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IFormFieldDef, buildFieldListItems } from "@/components/FieldList/type";
import { IListItem } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";


defineOptions({
    name: "DataField",
});
const props = defineProps<{
    formId: string;
    modelValue: IFormFieldDef[];
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

onBeforeMount(() => {
    formStore.get(props.formId).then((form) => {
        if (form?.content?.items)
            fieldList.value = buildFieldListItems(form.id, form.content.items, form.usingWorkflow);
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