<template>
    <FormView v-if="formData" :def="formDef" :data="formData" :isView="isView" :actions="actions" @draft="saveDraft"
        @submit="submitData">
    </FormView>
</template>
<script lang="ts" setup>
defineOptions({
    name: "FormDataView",
});

import { FormData, FormContent, FormDataRequest } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";

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

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);
const cancel = () => {
    emit("update:modelValue", false);
    emit("cancel");
};
const saveDraft = (data: any) => {
    alert("TODO:")
    // let fdata: FormDataRequest = {
    //   id: dataId.value ?? "",
    //   appId: appId.value,
    //   formId: props.formId,
    //   data: data,
    // };

    // formDataService.post<FormData_2>(fdata).then((res) => {
    //   // console.log("ressss", res);
    //   formData.value = res.data;
    //   emit("submit", res);
    // });
};
const submitData = (data: any) => {
    let fdata: FormDataRequest = {
        id: props.dataId,
        appId: appId.value,
        formId: props.formId,
        data: data,
    };

    formDataService.post<FormData>(fdata).then((res) => {
        console.log("ressss", res);
        formData.value = res.data;
        emit("submit", res);
    });
};

onBeforeMount(async () => {
    let form = await formStore.get(props.formId);
    // console.log("form def11111", form?.appId)
    if (form) {
        appId.value = form.appId;
        formDef.value = form.content!;
    }

    let data = await formDataService.get<FormData>(props.dataId);
    console.log("dataid11111", data, props.dataId)
    if (data) {
        formData.value = data;
    }
});
</script>