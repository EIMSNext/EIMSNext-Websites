<template>
  <PdfPreview v-model="showPdfPreview" :title="pdfPreviewTitle" :pdf-url="pdfPreviewUrl" />
  <div class="shared-form-data-page" v-loading="loading">
    <div class="shared-form-shell">
      <div class="shared-form-card">
        <div class="shared-form-header">
          <div>
            <div class="shared-form-title">{{ formDef?.name || "表单详情" }}</div>
          </div>
          <div class="shared-form-header-actions">
            <button
              class="shared-form-header-action-btn"
              type="button"
              :title="isFullscreen ? '退出全屏' : '全屏显示'"
              @click="toggle"
            >
              <et-icon :icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" size="18" />
            </button>
            <button
              class="shared-form-header-action-btn"
              type="button"
              title="关闭"
              @click="closeCurrentPage"
            >
              <et-icon icon="el-close" size="18" />
            </button>
          </div>
        </div>
        <div class="shared-form-body">
          <section class="shared-form-main-panel">
            <div class="shared-form-toolbar-wrap">
              <et-toolbar
                class="shared-form-toolbar"
                type="small"
                :left-group="toolbarItems"
                @command="toolbarHandler"
              ></et-toolbar>
            </div>
            <div class="shared-form-main">
              <FormView
                v-if="formDef && formData"
                :def="formDef.content!"
                :data="formData"
                :isView="true"
                class="shared-form-content"
              />
            </div>
          </section>
          <aside class="shared-form-side">
            <div class="shared-side-tabs">
              <button class="shared-form-tab active" type="button">流程动态</button>
              <button class="shared-form-tab" type="button">数据日志</button>
            </div>
            <div class="shared-side-head">
              <div class="shared-side-title">流程动态</div>
              <div class="shared-side-extra">{{ approvalLogs.length }} 条</div>
            </div>
            <div class="shared-side-body">
              <template v-if="approvalLogs.length > 0">
                <div v-for="log in approvalLogs" :key="log.id" class="workflow-card">
                  <div class="workflow-card-header">
                    <div class="workflow-node">{{ log.nodeName }}</div>
                    <div class="workflow-time">{{ formatDate(log.approvalTime) }}</div>
                  </div>
                  <div class="workflow-operator-row">
                    <div class="workflow-avatar">{{ getOperatorInitial(log.approver?.label) }}</div>
                    <div class="workflow-operator-content">
                      <div class="workflow-operator-name">{{ log.approver?.label || "系统" }}</div>
                      <div class="workflow-operator-meta">审批处理</div>
                    </div>
                  </div>
                  <div v-if="log.comment" class="workflow-comment">{{ log.comment }}</div>
                </div>
              </template>
              <template v-else>
                <div class="workflow-card workflow-card-compact">
                  <div class="workflow-card-header">
                    <div class="workflow-node">提交流程</div>
                    <div class="workflow-time">{{ formatDate(formData?.createTime) }}</div>
                  </div>
                  <div class="workflow-operator-row">
                    <div class="workflow-avatar">
                      {{ getOperatorInitial(formData?.createBy?.label) }}
                    </div>
                    <div class="workflow-operator-content">
                      <div class="workflow-operator-name">
                        {{ formData?.createBy?.label || "未知" }}
                      </div>
                      <div class="workflow-operator-meta">发起人</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </aside>
        </div>
      </div>
    </div>
    <div ref="printTrigger" v-print="printConfig" class="print-trigger">
      <FormPrintDiv
        v-model="printConfig.showPrintDiv"
        :title="formDef?.name"
        :printData="formPrintData"
      ></FormPrintDiv>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: "SharedFormDataPage",
});

import { computed, defineAsyncComponent, nextTick, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { FormDef, FormData, PrintTemplate, WfApprovalLog } from "@eimsnext/models";
import {
  customPrintService,
  formDataService,
  PrintRequest,
  printTemplateService,
  wfApprovalLogService,
} from "@eimsnext/services";
import { useFormStore } from "@eimsnext/store";
import { ToolbarItem } from "@eimsnext/components";
import { useTagsViewStore } from "@/store";
import FormView from "@/components/FormView/index.vue";
import FormPrintDiv from "@/components/WebPrint/FormPrintDiv.vue";
import { getPrintConfig, IPrintData } from "@/components/WebPrint/type";
import buildQuery from "odata-query";
import dayjs from "dayjs";

const PdfPreview = defineAsyncComponent(() => import("@/components/PrintDesigner/PdfPreview.vue"));

const route = useRoute();
const formStore = useFormStore();
const tagsViewStore = useTagsViewStore();
const { isFullscreen, toggle } = useFullscreen();
const formDef = ref<FormDef>();
const formData = ref<FormData>();
const approvalLogs = ref<WfApprovalLog[]>([]);
const customPrintTemplates = ref<PrintTemplate[]>([]);
const loading = ref(false);
const printConfig = ref(getPrintConfig(false));
const formPrintData = ref<IPrintData>();
const printTrigger = ref<HTMLElement | null>(null);
const showPdfPreview = ref(false);
const pdfPreviewTitle = ref("");
const pdfPreviewUrl = ref("");

const formatDate = (value?: number) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};

const getOperatorInitial = (label?: string) => {
  return label?.slice(0, 1) || "-";
};

const toolbarItems = computed<ToolbarItem[]>(() => {
  const basePrintConfig = {
    text: "common.print",
    command: "systemprint",
    visible: true,
    icon: "el-printer",
    disabled: false,
  };

  const bars: ToolbarItem[] = [
    {
      type: "button",
      config: {
        text: "分享",
        command: "share",
        visible: true,
        icon: "el-share",
        class: "toolbar-share-btn",
      },
    },
  ];

  if (!customPrintTemplates.value.length) {
    bars.push({
      type: "button",
      config: basePrintConfig,
    });
    return bars;
  }

  bars.push({
    type: "dropdown",
    config: {
      ...basePrintConfig,
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

const loadPrintTemplates = async (formId: string) => {
  const query = buildQuery({ filter: { formId } });
  customPrintTemplates.value = await printTemplateService.query<PrintTemplate>(query);
};

const openCustomPrintPreview = (print: any) => {
  pdfPreviewUrl.value = print.downloadUrl;
  pdfPreviewTitle.value = print.fileName;
  showPdfPreview.value = true;
};

const generatePrintData = () => {
  if (!formDef.value || !formData.value) return;

  formPrintData.value = {
    formDef: formDef.value,
    formData: formData.value,
  };
};

const toolbarHandler = async (cmd: string) => {
  if (cmd.startsWith("custom-print:")) {
    const templateId = cmd.replace("custom-print:", "");
    const req: PrintRequest = { dataIds: [route.params.dataId.toString()], templateId };
    const printResult = await customPrintService.print(req);

    if (printResult?.downloadUrl) {
      openCustomPrintPreview(printResult);
    } else {
      ElMessage.error(printResult?.message || "打印失败");
    }
    return;
  }

  switch (cmd) {
    case "share":
      break;
    case "systemprint":
      setTimeout(() => {
        nextTick(() => {
          printTrigger.value?.click();
        });
      }, 300);
      break;
  }
};

const closeCurrentPage = () => {
  if (window.opener) {
    window.close();
    return;
  }

  tagsViewStore.closeCurrentView();
};

watch(
  () => formData.value,
  () => {
    generatePrintData();
  },
  { deep: true }
);

watch(showPdfPreview, (visible) => {
  if (!visible) {
    pdfPreviewUrl.value = "";
  }
});

onBeforeMount(async () => {
  const formId = route.params.formId.toString();
  const dataId = route.params.dataId.toString();
  loading.value = true;

  try {
    const [form, data, logs] = await Promise.all([
      formStore.get(formId),
      formDataService.get<FormData>(dataId),
      wfApprovalLogService.query<WfApprovalLog>(
        buildQuery({
          filter: { formId, dataId },
          orderBy: "approvalTime desc",
          top: 20,
        })
      ),
    ]);

    if (form) {
      formDef.value = form;
      await loadPrintTemplates(form.id);
    }

    if (data) {
      formData.value = data;
      generatePrintData();
    }

    approvalLogs.value = logs || [];
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.shared-form-data-page {
  min-width: 1080px;
  min-height: 100%;
  padding: 10px 0;
  background: linear-gradient(180deg, #f7f8fa 0%, #f4f6f8 100%);
}

.shared-form-shell {
  max-width: 1280px;
  margin: 0 auto;
}

.shared-form-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
}

.shared-form-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  min-height: 720px;
}

.shared-form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #edf0f3;
}

.shared-form-title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
}

.shared-form-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
}

.shared-form-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shared-form-header-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shared-form-header-action-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
}

.shared-form-header-action-btn:focus-visible {
  outline: 2px solid var(--et-color-primary-outline);
  outline-offset: 2px;
}

.shared-form-main-panel {
  min-width: 0;
  border-right: 1px solid #edf0f3;
}

.shared-form-toolbar-wrap {
  padding: 14px 16px 0;
  background: #fff;
}

.shared-form-main {
  min-width: 0;
  padding: 0;
}

.shared-form-content {
  height: 100%;
}

.shared-form-side {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fbfcfd;
}

.shared-side-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 18px;
  border-bottom: 1px solid #edf0f3;
  background: #f8fafc;
}

.shared-form-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #0f172a;
  font-size: 14px;
  cursor: pointer;
}

.shared-form-tab.active {
  color: var(--et-color-primary);
  border-bottom-color: var(--et-color-primary-hover);
  font-weight: 600;
}

:deep(.shared-form-content .form-wrapper) {
  padding: 20px 24px 24px;
}

.shared-side-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 18px 12px;
}

.shared-side-title {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.shared-side-extra {
  color: #94a3b8;
  font-size: 12px;
}

.shared-side-body {
  flex: 1;
  overflow: auto;
  padding: 0 14px 18px;
}

.workflow-card {
  margin-bottom: 12px;
  padding: 14px 14px 12px;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  background: #fff;
}

.workflow-card-compact {
  margin-top: 6px;
}

.workflow-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.workflow-node {
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.workflow-time {
  flex-shrink: 0;
  color: #64748b;
  font-size: 12px;
}

.workflow-operator-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.workflow-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ff6b6b;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.workflow-operator-content {
  min-width: 0;
}

.workflow-operator-name {
  color: #111827;
  font-size: 14px;
}

.workflow-operator-meta,
.workflow-comment {
  color: #64748b;
  font-size: 12px;
}

.workflow-comment {
  margin-top: 10px;
  line-height: 1.6;
}

.print-trigger {
  display: none;
}

:deep(.shared-form-toolbar .toolbar-container) {
  min-height: 48px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

:deep(.shared-form-toolbar .left-group) {
  gap: 2px;
}

:deep(.shared-form-toolbar .toolbar-item.el-button),
:deep(.shared-form-toolbar .toolbar-dropdown) {
  height: 30px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  box-shadow: none;
}

:deep(.shared-form-toolbar .toolbar-item.el-button:not(.is-disabled):hover),
:deep(.shared-form-toolbar .toolbar-dropdown:not(.is-disabled):hover) {
  background: #f8fafc;
}

:deep(.shared-form-toolbar .toolbar-share-btn) {
  margin-right: 6px;
  padding-right: 12px;
  position: relative;
}

:deep(.shared-form-toolbar .toolbar-share-btn::after) {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 14px;
  background: #dbe2ea;
  transform: translateY(-50%);
}

@media (max-width: 1100px) {
  .shared-form-data-page {
    padding: 16px;
  }

  .shared-form-body {
    grid-template-columns: 1fr;
  }

  .shared-form-main-panel {
    border-right: 0;
    border-bottom: 1px solid #edf0f3;
  }

  .shared-form-side {
    min-height: 360px;
  }
}

@media print {
  .shared-form-data-page {
    padding: 0;
    background: #fff;
  }

  .shared-form-header-actions,
  .shared-form-toolbar-wrap,
  .shared-form-side {
    display: none;
  }

  .shared-form-body {
    display: block;
    min-height: auto;
  }

  .shared-form-main-panel {
    border-right: 0;
  }
}
</style>
