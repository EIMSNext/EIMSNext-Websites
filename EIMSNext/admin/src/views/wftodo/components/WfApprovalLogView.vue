<template>
    <FormView v-if="formData" :def="formDef" :data="formData" :isView="true" :actions="actions">
    </FormView>
</template>
<script lang="ts" setup>
defineOptions({
    name: "WfApprovalLogView",
});

import { FormDef, FormData, FormContent, FormDataRequest, WfTodo, ApproveAction, WfApprovalLog } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService, workflowService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";

const props = withDefaults(
    defineProps<{
        approvalLog: WfApprovalLog;
    }>(),
    {
    }
);

const actions = ref<FormActionSettings>({})
const appId = ref("");
const dataId = ref(props.approvalLog.dataId);
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData>();

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);
const cancel = () => {
    emit("update:modelValue", false);
    emit("cancel");
};


onMounted(async () => {
    let form = await formStore.get(props.approvalLog.formId);
    // console.log("form def11111", form?.appId)
    if (form) {
        appId.value = form.appId;
        formDef.value = form.content!;
    }

    let data = await formDataService.get<FormData>(props.approvalLog!.dataId);
    // console.log("form data11111", data, data?.id)
    if (data) {
        formData.value = data
    }
});
</script>