<template>
    <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
        :showNoSave="false" okText="确定" @ok="execDelete">
        <div>数据删除后将不可恢复</div>
    </EtConfirmDialog>
    <et-toolbar :left-group="leftBars" @command="toolbarHandler" class="dataview-bar"></et-toolbar>
    <FormView v-if="formData" :def="formDef" :data="formData" :isView="isView" :actions="actions" @draft="saveDraft"
        @submit="submitData">
    </FormView>
</template>
<script lang="ts" setup>
defineOptions({
    name: "FormDataView",
});

import { FormData, FormContent, FormDataRequest, DataAction, FlowStatus } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";
import { MessageIcon, ToolbarItem } from "@eimsnext/components";

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
const showDeleteConfirmDialog = ref(false)

const leftBars = ref<ToolbarItem[]>([{ type: "button", config: { text: "Edit", command: "edit", icon: "el-icon-edit" } }, { type: "button", config: { text: "Delete", command: "delete", icon: "el-icon-delete", disabled: false } }])
const toolbarHandler = (cmd: string, e: MouseEvent) => {
    switch (cmd) {
        case 'edit':
            actions.value = { draft: { text: "SaveDraft", visible: true }, submit: { text: "Submit", visible: true } }
            isView.value = false;
            break;
        case 'delete':
            showDeleteConfirmDialog.value = true
            break;
    }
}
const execDelete = () => {
    formDataService.delete(props.dataId)
        .then(() => {
            emit("ok");
        })
}

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
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
        emit("ok");
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
        emit("ok");
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
        leftBars.value.find(x => x.config.command == "edit")!.config.disabled = formData.value.flowStatus != FlowStatus.Draft;
        leftBars.value.find(x => x.config.command == "delete")!.config.disabled = formData.value.flowStatus != FlowStatus.Draft;
    }
});
</script>
<style lang="scss" scoped>
.dataview-bar {
    margin: 12px 0 0;
    padding: 0 20px;
}
</style>