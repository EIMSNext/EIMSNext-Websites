<template>
  <FormView v-if="formData" :def="formDef" :data="formData" :isView="true" :actions="actions" @approve="handleApprove"
    @reject="handleReject"></FormView>

  <et-dialog v-model="showCommentDialog" title="审批意见" width="500px" :append-to-body="true" :destroy-on-close="true"
    @ok="confirmApproveAction" @cancel="cancelApproveAction">
    <el-input v-model="comment" type="textarea" :rows="4" placeholder="请输入审批意见" />
  </et-dialog>
</template>
<script lang="ts" setup>
defineOptions({
  name: "WfProcess",
});

import {
  FormDef,
  FormData as FormData_2,
  FormContent,
  FormDataRequest,
  WfTodo,
  ApproveAction,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService, workflowService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";

const props = withDefaults(
  defineProps<{
    todo: WfTodo;
  }>(),
  {}
);

const actions = ref<FormActionSettings>({
  approve: { text: "common.wfProcess.approve", visible: true },
  reject: { text: "common.wfProcess.reject", visible: true },
});
const appId = ref("");
const dataId = ref(props.todo.dataId);
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData_2>();
const showCommentDialog = ref(false);
const comment = ref("");
const pendingAction = ref<ApproveAction>();

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const resetCommentDialog = () => {
  showCommentDialog.value = false;
  comment.value = "";
  pendingAction.value = undefined;
};

const handleApprove = () => {
  pendingAction.value = ApproveAction.Approve;
  comment.value = "";
  showCommentDialog.value = true;
};

const handleReject = () => {
  pendingAction.value = ApproveAction.Reject;
  comment.value = "";
  showCommentDialog.value = true;
};

const confirmApproveAction = async () => {
  if (!pendingAction.value) {
    return;
  }

  try {
    await workflowService.approve({
      dataId: dataId.value,
      action: pendingAction.value,
      comment: comment.value,
    });
    resetCommentDialog();
  }
  catch {
  }
};

const cancelApproveAction = () => {
  resetCommentDialog();
};

onMounted(async () => {
  let form = await formStore.get(props.todo.formId);
  if (form) {
    appId.value = form.appId;
    formDef.value = form.content!;
  }

  let data = await formDataService.get<FormData_2>(props.todo!.dataId);
  if (data) {
    formData.value = data;
  }
});
</script>
