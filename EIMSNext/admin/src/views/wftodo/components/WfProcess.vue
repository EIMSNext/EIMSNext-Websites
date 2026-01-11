<template>
  <FormView v-if="formData" :def="formDef" :data="formData" :isView="true" :actions="actions" @approve="handleApprove"
    @reject="handleReject">
  </FormView>
</template>
<script lang="ts" setup>
defineOptions({
  name: "WfProcess",
});

import { FormDef, FormData as FormData_2, FormContent, FormDataRequest, WfTodo, ApproveAction } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService, workflowService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";

const props = withDefaults(
  defineProps<{
    todo: WfTodo;
  }>(),
  {
  }
);

const actions = ref<FormActionSettings>({ approve: { text: "common.wfProcess.approve", visible: true }, reject: { text: "common.wfProcess.reject", visible: true } })
const appId = ref("");
const dataId = ref(props.todo.dataId);
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData_2>();

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const handleApprove = (data: any) => {
  workflowService.approve({
    dataId: dataId.value,
    action: ApproveAction.Approve,
    comment: "同意",
  });
};
const handleReject = (data: any) => {
  workflowService.approve({
    dataId: dataId.value,
    action: ApproveAction.Reject,
    comment: "不同意",
  });
};

onMounted(async () => {
  let form = await formStore.get(props.todo.formId);
  // console.log("form def11111", form?.appId)
  if (form) {
    appId.value = form.appId;
    formDef.value = form.content!;
  }

  let data = await formDataService.get<FormData_2>(props.todo!.dataId);
  // console.log("form data11111", data, data?.id)
  if (data) {
    formData.value = data
  }
});
</script>