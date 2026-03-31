<template>
  <EtConfirmDialog
    v-model="showDeleteConfirmDialog"
    :title="t('common.message.deleteConfirm_Title')"
    :icon="MessageIcon.Warning"
    :showNoSave="false"
    @ok="execDelete"
  >
    <div>{{ t("common.message.deleteConfirm_Content2") }}</div>
  </EtConfirmDialog>
  <PdfPreview
    v-model="showPdfPreview"
    :title="pdfPreviewTitle"
    subtitle="Custom print preview"
    :source="pdfPreviewUrl"
  />
  <et-toolbar type="small" :left-group="leftBars" @command="toolbarHandler"></et-toolbar>
  <FormView
    v-if="formDef && formData"
    :def="formDef.content!"
    :data="formData"
    :isView="isView"
    :actions="actions"
    :fieldPerms="fieldPerms"
    class="editdata"
    @draft="saveDraft"
    @submit="submitData"
  ></FormView>
  <div ref="printTrigger" v-print="printConfig" class="print-trigger">
    <FormPrintDiv
      v-model="printConfig.showPrintDiv"
      :title="formDef?.name"
      :printData="formPrintData"
    ></FormPrintDiv>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: "FormDataView",
});

import { computed, onBeforeMount, ref, watch } from "vue";
import {
  FormData,
  FormDataRequest,
  DataAction,
  FlowStatus,
  IFieldPerm,
  DataPerms,
  FormDef,
  PrintTemplate,
} from "@eimsnext/models";
import { useFormStore, useUserStore } from "@eimsnext/store";
import { formDataService, printTemplateService } from "@eimsnext/services";
import { FormActionSettings } from "@/components/FormView/type";
import { MessageIcon, ToolbarItem } from "@eimsnext/components";
import { useI18n } from "vue-i18n";
import { hasDataPerm } from "@/utils/common";
import FormPrintDiv from "@/components/WebPrint/FormPrintDiv.vue";
import PdfPreview from "@/components/WebPrint/PdfPreview.vue";
import { getPrintConfig, IPrintData } from "@/components/WebPrint/type";
import buildQuery from "odata-query";
const { t, locale, mergeLocaleMessage } = useI18n();

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
const formStore = useFormStore();
const formDef = ref<FormDef>();
const formData = ref<FormData>();
const showDeleteConfirmDialog = ref(false);
const userStore = useUserStore();
const { currentUser } = userStore;

const canEdit = computed(() => hasDataPerm(currentUser.userType, DataPerms.Edit, props.dataPerms));
const canRemove = computed(() =>
  hasDataPerm(currentUser.userType, DataPerms.Remove, props.dataPerms)
);

const printConfig = ref(getPrintConfig(false));

const formPrintData = ref();
const printTrigger = ref<HTMLElement | null>(null);
const customPrintTemplates = ref<PrintTemplate[]>([]);
const showPdfPreview = ref(false);
const pdfPreviewTitle = ref("");
const pdfPreviewUrl = ref("");
const mockPdfPreviewUrl = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

const leftBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: { text: "common.edit", command: "edit", visible: canEdit, icon: "el-edit" },
  },
  {
    type: "button",
    config: {
      text: "common.delete",
      command: "delete",
      visible: canRemove,
      icon: "el-delete",
      disabled: false,
    },
  },
  {
    type: "button",
    config: {
      text: "common.print",
      command: "print",
      visible: true,
      icon: "el-printer",
      disabled: false,
    },
  },
]);

const getPrintTemplateTextKey = (print: PrintTemplate) => `form.printTemplate.${print.id}`;

const syncPrintTemplateLocales = (prints: PrintTemplate[]) => {
  const currentLocale = locale.value;
  const messages = prints.reduce<Record<string, string>>((acc, print) => {
    acc[getPrintTemplateTextKey(print)] = print.name;
    return acc;
  }, {});

  mergeLocaleMessage(currentLocale, messages);
};

const updatePrintToolbar = () => {
  const printIndex = leftBars.value.findIndex((item) => item.config.command == "print");
  if (printIndex < 0) return;

  const currentItem = leftBars.value[printIndex];
  const baseConfig = {
    text: "common.print",
    command: "print",
    visible: true,
    icon: "el-printer",
    disabled: currentItem.config.disabled,
  };

  if (!customPrintTemplates.value.length) {
    leftBars.value[printIndex] = {
      type: "button",
      config: baseConfig,
    };
    return;
  }

  leftBars.value[printIndex] = {
    type: "dropdown",
    config: {
      ...baseConfig,
      menuItems: [
        {
          text: "common.print",
          command: "print",
          visible: true,
        },
        ...customPrintTemplates.value.map((print) => ({
          text: getPrintTemplateTextKey(print),
          command: `custom-print:${print.id}`,
          visible: true,
        })),
      ],
    },
  };
};

const loadPrintTemplates = async (formId: string) => {
  const query = buildQuery({ filter: { formId } });
  customPrintTemplates.value = await printTemplateService.query<PrintTemplate>(query);
  syncPrintTemplateLocales(customPrintTemplates.value);
  updatePrintToolbar();
};

const openCustomPrintPreview = (print: PrintTemplate) => {
  pdfPreviewUrl.value = mockPdfPreviewUrl;
  pdfPreviewTitle.value = `${print.name}.pdf`;
  showPdfPreview.value = true;
};

const toolbarHandler = (cmd: string, e: MouseEvent) => {
  if (cmd.startsWith("custom-print:")) {
    const templateId = cmd.replace("custom-print:", "");
    const print = customPrintTemplates.value.find((item) => item.id == templateId);

    if (!print) {
      ElMessage.warning("未找到打印模板");
      return;
    }

    openCustomPrintPreview(print);
    return;
  }

  switch (cmd) {
    case "edit":
      actions.value = {
        draft: { text: "common.wfProcess.saveDraft" },
        submit: { text: "common.wfProcess.submit" },
        reset: { text: "common.reset" },
      };
      isView.value = false;
      break;
    case "delete":
      showDeleteConfirmDialog.value = true;
      break;
    case "print":
      printTrigger.value?.click();
      break;
  }
};
const execDelete = () => {
  formDataService.delete(props.dataId).then(() => {
    emit("ok");
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
  () => formData,
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
    await loadPrintTemplates(form.id);
  }

  let data = await formDataService.get<FormData>(props.dataId);
  if (data) {
    formData.value = data;
    leftBars.value.find((x) => x.config.command == "edit")!.config.disabled =
      formDef.value?.usingWorkflow && formData.value.flowStatus != FlowStatus.Draft;
    leftBars.value.find((x) => x.config.command == "delete")!.config.disabled =
      formDef.value?.usingWorkflow && formData.value.flowStatus != FlowStatus.Draft;
  }
});
</script>
<style lang="scss" scoped>
.print-trigger {
  display: none;
}
</style>
