<template>
    <et-toolbar :left-group="leftBars" @command="toolbarHandler"></et-toolbar>
    <FormView v-if="formData" :def="formDef" :data="formData" :isView="isView" :actions="actions" @draft="saveDraft"
        @submit="submitData">
    </FormView>
</template>
<script lang="ts" setup>
defineOptions({
    name: "FormDataView",
});

import { FormData, FormContent, FormDataRequest, DataAction } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";
import { ToolbarItem } from "@eimsnext/components";

const props = withDefaults(
    defineProps<{
        formId: string;
        dataId: string;
    }>(),
    {
    }
);

const isView = ref(true)
const actions = ref<FormActionSettings>({})
const appId = ref("");
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData>();

const leftBars = ref<ToolbarItem[]>([{ type: "button", config: { text: "Edit", command: "edit", icon: "el-icon-edit" } }, { type: "dropdown", config: { text: "Print", command: "", icon: "el-icon-print", menuItems: [{ text: "system print", command: "sysprint" }], onCommand: (cmd: string) => { alert(cmd) } } }])
const toolbarHandler = (cmd: string, e: MouseEvent) => {
    switch (cmd) {
        case 'edit':
            isView.value = false;
            break;
    }
}

const emit = defineEmits(["update:modelValue", "cancel", "save", "submit"]);
const cancel = () => {
    emit("update:modelValue", false);
    emit("cancel");
};
const saveDraft = (data: any) => {
    let fdata: FormDataRequest = {
        action: DataAction.Save,
        id: props.dataId,
        appId: appId.value,
        formId: props.formId,
        data: data,
    };

    formDataService.post<FormData>(fdata).then((res) => {
        formData.value = res.data;
        emit("save", res);
    });
};;
const submitData = (data: any) => {
    let fdata: FormDataRequest = {
        action: DataAction.Submit,
        id: props.dataId,
        appId: appId.value,
        formId: props.formId,
        data: data,
    };

    formDataService.post<FormData>(fdata).then((res) => {
        formData.value = res.data;
        emit("submit", res);
    });
};

onBeforeMount(async () => {
    let form = await formStore.get(props.formId);
    if (form) {
        appId.value = form.appId;
        formDef.value = form.content!;
    }

    let data = await formDataService.get<FormData>(props.dataId);
    if (data) {
        formData.value = data;
    }
});
</script>