<template>
  <FormRender :def="formDef" :data="formData" @submit="submitData"></FormRender>
</template>
<script lang="ts" setup>
defineOptions({
  name: "AddEditFormData",
});

import { FormDef, FormData as FormData_2, FormContent, FormDataRequest } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import FormRender from "./FormRender.vue";
import { formDataService } from "@eimsnext/services";

const props = withDefaults(
  defineProps<{
    formId: string;
    edit: boolean;
    data?: FormData_2;
  }>(),
  {
    edit: false,
  }
);

const appId = ref("");
const dataId = ref(props.data?.id);
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData>(props.data?.data);

if (props.formId) {
  let form = formStore.items.find((x: FormDef) => x.id == props.formId);
  console.log("form", form);
  if (form) {
    appId.value = form.appId;
    formDef.value = form.content!;
    // formName.value = form.name;
  }
}

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const submitData = (data: any) => {
  let fdata: FormDataRequest = {
    id: dataId.value ?? "",
    appId: appId.value,
    formId: props.formId,
    data: data,
  };

  formDataService.post<FormData_2>(fdata).then((res) => {
    console.log("ressss", res);
    formData.value = res.data;
    emit("submit", res);
  });
};
</script>
