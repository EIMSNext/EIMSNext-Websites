<template>
  <FormView
    v-if="formData"
    :def="formDef"
    :data="formData"
    :isView="true"
    :actions="actions"
    @withdraw="handleWithdraw"
    @urge="handleUrge"
  ></FormView>
</template>
<script lang="ts" setup>
defineOptions({
  name: "WfTaskLogView",
});

import {
  FormData,
  FormContent,
  WfTaskLog,
  WorkflowActionStatus,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService, workflowService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    taskLog: WfTaskLog;
  }>(),
  {}
);

const actions = ref<FormActionSettings>({});
const appId = ref("");
const dataId = ref(props.taskLog.dataId);
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData>();
const actionStatus = ref<WorkflowActionStatus>({ canWithdraw: false, canUrge: false });

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const handleWithdraw = async () => {
  try {
    await ElMessageBox.confirm(t("common.wfProcess.withdrawConfirm"), t("common.wfProcess.withdraw"), {
      type: "warning",
    });
    await workflowService.withdraw({ dataId: dataId.value });
    emit("submit");
  } catch {
  }
};

const handleUrge = async () => {
  try {
    await workflowService.urge({ dataId: dataId.value });
    ElMessage.success(t("common.wfProcess.urgeSuccess"));
  } catch {
  }
};

onMounted(async () => {
  let form = await formStore.get(props.taskLog.formId);
  if (form) {
    appId.value = form.appId;
    formDef.value = form.content!;
  }

  let data = await formDataService.get<FormData>(props.taskLog!.dataId);
  if (data) {
    formData.value = data;
  }

  actionStatus.value = await workflowService.getActionStatus(props.taskLog.dataId);
  actions.value = {
    withdraw: { text: "common.wfProcess.withdraw", visible: actionStatus.value.canWithdraw },
    urge: { text: "common.wfProcess.urge", visible: actionStatus.value.canUrge },
  };
});
</script>
