<template>
  <EtConfirmDialog v-model="showDeleteConfirmDialog" :title="t('common.message.deleteConfirm_Title')"
    :icon="MessageIcon.Warning" :showNoSave="false" @ok="execDelete">
    <div>{{ t("common.message.deleteConfirm_Content2") }}</div>
  </EtConfirmDialog>
  <PdfPreview v-model="showPdfPreview" :title="pdfPreviewTitle" :pdf-url="pdfPreviewUrl" />
  <et-dialog v-model="showShareDialog" class="share-dialog" :title="$t('admin.formData.share')" width="640px" :show-footer="false" append-to-body>
    <div class="share-dialog-body">
      <div class="share-section">
        <div class="share-section-title-row">
          <div class="share-section-title">{{ $t("admin.formData.enterpriseMembers") }}</div>
          <div class="share-section-desc">{{ $t("admin.formData.enterpriseMembersDesc") }}</div>
        </div>
        <ShareLinkBar :url="shareUrl" />
      </div>
      <!-- <div class="share-section share-section-secondary">
        <div class="share-section-title-row">
          <div class="share-section-title">数据外链</div>
          <div class="share-section-desc">将表单中的数据发布为独立的公开链接，无需登录即可访问数据</div>
        </div>
        <el-switch v-model="externalShareEnabled" disabled />
      </div> -->
    </div>
  </et-dialog>
  <et-toolbar class="form-data-toolbar" type="small" :left-group="leftBars" @command="toolbarHandler"></et-toolbar>
  <FormView v-if="formDef && formData" :def="formDef.content!" :data="formData" :isView="isView" :actions="actions"
    :fieldPerms="fieldPerms" class="editdata" @draft="saveDraft" @submit="submitData"></FormView>
  <div ref="printTrigger" v-print="printConfig" class="print-trigger">
    <FormPrintDiv v-model="printConfig.showPrintDiv" :title="formDef?.name" :printData="formPrintData"></FormPrintDiv>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: "FormDataView",
});

import { computed, defineAsyncComponent, nextTick, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  FormData,
  FormDataRequest,
  DataAction,
  FlowStatus,
  IFieldPerm,
  DataPerms,
  FormDef,
  PrintDef,
  WorkflowActionStatus,
} from "@eimsnext/models";
import { useFormStore, useUserStore } from "@eimsnext/store";
import { customPrintService, formDataService, PrintRequest, printDefService, workflowService } from "@eimsnext/services";
import { bus } from "@eimsnext/utils";
import { FormActionSettings } from "@/components/FormView/type";
import { MessageIcon, ShareLinkBar, ToolbarItem } from "@eimsnext/components";
import { useI18n } from "vue-i18n";
import { hasDataPerm } from "@/utils/common";
import FormPrintDiv from "@/components/WebPrint/FormPrintDiv.vue";
import { getPrintConfig, IPrintData } from "@/components/WebPrint/type";
import buildQuery from "odata-query";
const { t } = useI18n();

const PdfPreview = defineAsyncComponent(() => import("@/components/PrintDesigner/PdfPreview.vue"));

const props = withDefaults(
  defineProps<{
    formId: string;
    dataId: string;
    dataPerms?: DataPerms;
    fieldPerms?: IFieldPerm[];
  }>(),
  {}
);

const isView = ref(true);
const actions = ref<FormActionSettings>({});
const isEditing = ref(false)
const oriFormData = ref<FormData>()
const formStore = useFormStore();
const formDef = ref<FormDef>();
const formData = ref<FormData>();
const showDeleteConfirmDialog = ref(false);
const showShareDialog = ref(false);
const externalShareEnabled = ref(false);
const userStore = useUserStore();
const { currentUser } = userStore;
const route = useRoute();

const canEdit = computed(() => hasDataPerm(currentUser.userType, DataPerms.Edit, props.dataPerms));
const canRemove = computed(() =>
  hasDataPerm(currentUser.userType, DataPerms.Remove, props.dataPerms)
);

const printConfig = ref(getPrintConfig(false));

const formPrintData = ref();
const printTrigger = ref<HTMLElement | null>(null);
const customPrintTemplates = ref<PrintDef[]>([]);
const showPdfPreview = ref(false);
const pdfPreviewTitle = ref("");
const pdfPreviewUrl = ref("");
const shareUrl = computed(() => `${window.location.origin}/#/app/${route.params.appId}/form/${props.formId}/data/${props.dataId}`);

const inEdit = computed(() => isEditing.value);
const editDisabled = ref(false);
const deleteDisabled = ref(false);
const actionStatus = ref<WorkflowActionStatus>({ canWithdraw: false, canUrge: false });

const leftBars = computed<ToolbarItem[]>(() => {
  const bars: ToolbarItem[] = [
    {
      type: "button",
      config: {
        text: t("admin.formData.share"),
        command: "share",
        visible: !inEdit.value,
        icon: "el-share",
        class: "toolbar-share-btn",
      },
    },
    {
      type: "button",
      config: {
        text: "common.edit",
        command: "edit",
        visible: canEdit.value && !inEdit.value,
        icon: "el-edit",
        disabled: editDisabled.value,
      },
    },
    {
      type: "button",
      config: {
        text: "common.cancel",
        command: "cancel",
        visible: inEdit.value,
        icon: "el-close",
      },
    },
    {
      type: "button",
      config: {
        text: "common.wfProcess.withdraw",
        command: "withdraw",
        visible: !inEdit.value && actionStatus.value.canWithdraw,
        icon: "refresh-left",
      },
    },
    {
      type: "button",
      config: {
        text: "common.wfProcess.urge",
        command: "urge",
        visible: !inEdit.value && actionStatus.value.canUrge,
        icon: "promotion",
      },
    },
    {
      type: "button",
      config: {
        text: "common.delete",
        command: "delete",
        visible: canRemove.value && !inEdit.value,
        icon: "el-delete",
        disabled: deleteDisabled.value,
      },
    },
  ];

  const baseConfig = {
    text: "common.print",
    command: "systemprint",
    visible: !inEdit.value,
    icon: "el-printer",
    disabled: false,
  };

  if (!customPrintTemplates.value.length) {
    bars.push({
      type: "button",
      config: baseConfig,
    });
    return bars;
  }

  bars.push({
    type: "dropdown",
    config: {
      ...baseConfig,
      menuItems: [
        {
          text: "common.systemprint",
          command: "systemprint",
          visible: true,
        },
        ...customPrintTemplates.value.map((print) => ({
          text: print.name,
          command: `custom-print:${print.id}`,
          visible: true,
        })),
      ],
    },
  });

  return bars;
});

const loadPrintDefs = async (formId: string) => {
  const query = buildQuery({ filter: { formId } });
  customPrintTemplates.value = await printDefService.query<PrintDef>(query);
};

const openCustomPrintPreview = (print: any) => {
  pdfPreviewUrl.value = print.downloadUrl;
  pdfPreviewTitle.value = print.fileName;
  showPdfPreview.value = true;
};

const toolbarHandler = async (cmd: string, e: MouseEvent) => {
  if (cmd.startsWith("custom-print:")) {
    const printId = cmd.replace("custom-print:", "");
    let req: PrintRequest = { dataIds: [props.dataId], printId }
    let printResult = await customPrintService.print(req);

    if (printResult && printResult.downloadUrl) {
      openCustomPrintPreview(printResult);
    }
    else {
      ElMessage.error(printResult?.message || t("admin.formData.printFailed"))
    }

    return;
  }

  switch (cmd) {
    case "share":
      showShareDialog.value = true;
      break;
    case "edit":
      isEditing.value = true;
      oriFormData.value = JSON.parse(JSON.stringify(formData.value));

      actions.value = {
        draft: { text: "common.wfProcess.saveDraft" },
        submit: { text: "common.wfProcess.submit" },
        reset: { text: "common.reset" },
      };
      isView.value = false;
      break;
    case "cancel":
      isEditing.value = false;
      isView.value = true;
      formData.value = JSON.parse(JSON.stringify(oriFormData.value));
      actions.value = {};
      break;
    case "delete":
      showDeleteConfirmDialog.value = true;
      break;
    case "withdraw":
      if (!actionStatus.value.canWithdraw) {
        break;
      }
      try {
        await ElMessageBox.confirm(t("common.wfProcess.withdrawConfirm"), t("common.wfProcess.withdraw"), {
          type: "warning",
        });
        await workflowService.withdraw({
          dataId: props.dataId,
        });
        const data = await formDataService.get<FormData>(props.dataId);
        formData.value = data;
        actionStatus.value = { canWithdraw: false, canUrge: false };
        editDisabled.value = false;
        deleteDisabled.value = false;
      } catch {
      }
      break;
    case "urge":
      if (!actionStatus.value.canUrge) {
        break;
      }
      try {
        await workflowService.urge({
          dataId: props.dataId,
        });
        ElMessage.success(t("common.wfProcess.urgeSuccess"));
      } catch {
      }
      break;
    case "systemprint":
      setTimeout(() => {
        nextTick(() => { printTrigger.value?.click(); })
      }, 300);
      break;
  }
};
const execDelete = () => {
  formDataService.delete(props.dataId).then(() => {
    emit("ok");
    bus.emit("data:deleted", { formId: props.formId });
  });
};

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const saveDraft = (data: any) => {
  let fdata: FormDataRequest = {
    action: DataAction.Save,
    id: props.dataId,
    appId: formDef.value?.appId!,
    formId: props.formId,
    data: data,
  };

  // 根据是否有dataId判断是新增还是编辑，编辑时使用put方法
  const request = props.dataId
    ? formDataService.put<FormData>(props.dataId, fdata)
    : formDataService.post<FormData>(fdata);

  request.then((res) => {
    formData.value = res.data;
    emit("ok");
    bus.emit("data:saved", { formId: props.formId });
  });
};
const submitData = (data: any) => {
  let fdata: FormDataRequest = {
    action: DataAction.Submit,
    id: props.dataId,
    appId: formDef.value?.appId!,
    formId: props.formId,
    data: data,
  };

  // 根据是否有dataId判断是新增还是编辑，编辑时使用put方法
  const request = props.dataId
    ? formDataService.put<FormData>(props.dataId, fdata)
    : formDataService.post<FormData>(fdata);

  request.then((res) => {
    formData.value = res.data;
    emit("ok");
    bus.emit("data:saved", { formId: props.formId });
  });
};

const generatePrintData = () => {
  let printData: IPrintData = {
    formDef: formDef.value!,
    formData: formData.value!,
    fieldPerms: props.fieldPerms,
  };
  formPrintData.value = printData;
};
watch(
  () => formData.value,
  (val) => {
    if (val) generatePrintData();
  },
  { deep: true }
);

watch(showPdfPreview, (visible) => {
  if (!visible) {
    pdfPreviewUrl.value = "";
  }
});

onBeforeMount(async () => {
  let form = await formStore.get(props.formId);
  if (form) {
    formDef.value = form;
    await loadPrintDefs(form.id);
  }

  let data = await formDataService.get<FormData>(props.dataId);
  if (data) {
    formData.value = data;
    const workflowLocked = !!(formDef.value?.usingWorkflow && formData.value.flowStatus != FlowStatus.Draft);
    editDisabled.value = workflowLocked;
    deleteDisabled.value = workflowLocked;

    const status = await workflowService.getActionStatus(props.dataId);
    actionStatus.value = status;
  }
});
</script>
<style lang="scss" scoped>
.print-trigger {
  display: none;
}

.share-dialog-body {
  padding: 0 0 8px;
}

.share-section {
  padding: 10px 20px;
}

.share-section-secondary {
  margin-top: 8px;
  border-top: 1px solid #eef2f7;
}

.share-section-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.share-section-title {
  color: #111827;
  font-size: 15px;
  font-weight: 600;
}

.share-section-desc {
  color: #6b7280;
  font-size: 12px;
}

:deep(.share-dialog .el-dialog) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.share-dialog .el-dialog__header) {
  padding: 14px 20px;
  border-bottom: 1px solid #eef2f7;
}

:deep(.share-dialog .el-dialog__title) {
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

:deep(.share-dialog .el-dialog__body) {
  padding: 12px 20px 14px;
}

:deep(.share-dialog .el-switch.is-disabled) {
  opacity: 1;
}

:deep(.share-dialog .el-switch.is-disabled .el-switch__core) {
  background: #d1d5db;
  border-color: #d1d5db;
}

:deep(.form-data-toolbar .toolbar-container) {
  min-height: 40px;
  margin-bottom: var(--et-space-8);
  padding: var(--et-space-6) var(--et-space-10);
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

:deep(.form-data-toolbar .left-group) {
  gap: 2px;
}

:deep(.form-data-toolbar .toolbar-item.el-button),
:deep(.form-data-toolbar .toolbar-dropdown) {
  height: 28px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  box-shadow: none;
}

:deep(.form-data-toolbar .toolbar-item.el-button:not(.is-disabled):hover),
:deep(.form-data-toolbar .toolbar-dropdown:not(.is-disabled):hover) {
  background: var(--el-fill-color-light);
}

:deep(.form-data-toolbar .toolbar-share-btn) {
  margin-right: 6px;
  padding-right: 12px;
  position: relative;
}

:deep(.form-data-toolbar .toolbar-share-btn::after) {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 14px;
  background: var(--el-border-color);
  transform: translateY(-50%);
}
</style>
