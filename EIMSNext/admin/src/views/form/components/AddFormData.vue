<template>
  <FormView :def="formDef" :data="formData" :isView="isView" :actions="actions" @draft="saveDraft" @submit="submitData">
  </FormView>
</template>
<script lang="ts" setup>
defineOptions({
  name: "AddFormData",
});

import { FormDef, FormData, FormContent, FormDataRequest, DataAction } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";

const props = withDefaults(
  defineProps<{
    formId: string;
    isView: boolean;
    data?: FormData;
  }>(),
  {
    isView: false,
  }
);

const actions = ref<FormActionSettings>({ draft: { text: "SaveDraft", visible: true }, submit: { text: "Submit", visible: true }, reset: { text: "Reset", visible: true } })
const appId = ref("");
const dataId = ref(props.data?.id);
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref(props.data);

if (props.formId) {
  let form = formStore.items.find((x: FormDef) => x.id == props.formId);
  if (form) {
    appId.value = form.appId;
    formDef.value = form.content!;
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
    id: dataId.value ?? "",
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
    id: dataId.value ?? "",
    appId: appId.value,
    formId: props.formId,
    data: data,
  };

  formDataService.post<FormData>(fdata).then((res) => {
    formData.value = res.data;
    emit("submit", res);
  });
};
</script>
