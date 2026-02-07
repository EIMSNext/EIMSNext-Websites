<template>
    <et-dialog v-model="showDialog" :title="t('comp.selectDataSource')" @cancel="cancel" @ok="save">
        <FormList v-model="formItem" :appId="appId" @itemClick="formSelected"></FormList>
    </et-dialog>
</template>
<script setup lang="ts">
import { DataSourceType, IDataSource } from "../type";
import { EtDialog, FormList, IFormItem } from "@eimsnext/components";
import { useLocale } from "element-plus";
import { ref, toRef } from "vue";
const { t } = useLocale();

defineOptions({
    name: "DataSourceDialog",
});

const props = defineProps<{
    modelValue: boolean,
    appId: string,
    dataSource?: IDataSource
}>();

const showDialog = toRef(props.modelValue)
const formItem = ref<IFormItem>({ id: "" })
const dataSource = toRef(props.dataSource)

if (dataSource.value) {
    if (dataSource.value.type == DataSourceType.Form)
        formItem.value = { id: dataSource.value.id, label: dataSource.value.label }
}

const formSelected = (form: IFormItem) => {
    formItem.value = form;
    dataSource.value = { id: form.id, label: form.label ?? "", type: DataSourceType.Form }
}
const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
    emit("update:modelValue", false);
    emit("cancel");
};
const save = () => {
    emit("ok", dataSource.value);
};
</script>