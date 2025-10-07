<template>
  <FormView :def="formDef" :data="formData" :isView="isView" :actions="actions" @draft="saveDraft" @submit="submitData">
  </FormView>
</template>
<script lang="ts" setup>
defineOptions({
  name: "AddEditFormData",
});

import { FormDef, FormData as FormData_2, FormContent, FormDataRequest } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";

const props = withDefaults(
  defineProps<{
    formId: string;
    isView: boolean;
    data?: FormData_2;
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
  console.log("form", form);
  if (form) {
    appId.value = form.appId;
    formDef.value = form.content!;
  }
}

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
    id: dataId.value ?? "",
    appId: appId.value,
    formId: props.formId,
    data: data,
  };

  formDataService.post<FormData_2>(fdata).then((res) => {
    // console.log("ressss", res);
    formData.value = res.data;
    emit("submit", res);
  });
};
</script>
