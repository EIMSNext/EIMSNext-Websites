<template>
  <PdfPreview v-model="showPdfPreview" :title="pdfPreviewTitle" :pdf-url="pdfPreviewUrl" />
  <et-dialog v-model="showShareDialog" class="share-dialog" :title="$t('common.share')" width="640px" :show-footer="false" append-to-body>
    <div class="share-dialog-body">
      <div class="share-section">
        <div class="share-section-title-row">
          <div class="share-section-title">{{ $t("admin.formData.enterpriseMembers") }}</div>
          <div class="share-section-desc">{{ $t("admin.formData.enterpriseMembersDesc") }}</div>
        </div>
        <ShareLinkBar :url="shareUrl" />
      </div>
    </div>
  </et-dialog>
  <div class="shared-form-data-page" v-loading="loading">
    <div class="shared-form-shell">
      <div class="shared-form-card">
        <div class="shared-form-header">
          <div>
            <div class="shared-form-title">{{ formDef?.name || $t("admin.formData.formDetail") }}</div>
          </div>
          <div class="shared-form-header-actions">
            <button
              class="shared-form-header-action-btn"
              type="button"
              :title="isFullscreen ? $t('admin.formData.exitFullscreen') : $t('admin.formData.fullscreen')"
              @click="toggle"
            >
              <et-icon :icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" size="18" />
            </button>
            <button
              class="shared-form-header-action-btn"
              type="button"
              :title="$t('common.close')"
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
              <button
                class="shared-form-tab"
                :class="{ active: sideTab === 'flow' }"
                type="button"
                @click="sideTab = 'flow'"
              >
                {{ $t("admin.formData.flowDynamic") }}
              </button>
              <button
                class="shared-form-tab"
                :class="{ active: sideTab === 'dataLog' }"
                type="button"
                @click="sideTab = 'dataLog'"
              >
                {{ $t("admin.formData.dataLog") }}
              </button>
            </div>
            <div class="shared-side-head">
              <div class="shared-side-title">{{ sideTitle }}</div>
              <div class="shared-side-extra">{{ sideRecordCount }} {{ $t("admin.formData.records") }}</div>
            </div>
            <div class="shared-side-body">
              <template v-if="sideTab === 'flow'">
                <template v-if="approvalLogs.length > 0">
                  <div v-for="log in approvalLogs" :key="log.id" class="workflow-card">
                    <div class="workflow-card-header">
                      <div class="workflow-node">{{ log.nodeName }}</div>
                      <div class="workflow-time">{{ formatDate(log.approvalTime) }}</div>
                    </div>
                    <div class="workflow-operator-row">
                      <div class="workflow-avatar">{{ getOperatorInitial(log.approver?.label) }}</div>
                      <div class="workflow-operator-content">
                        <div class="workflow-operator-name">{{ log.approver?.label || $t("admin.formData.system") }}</div>
                        <div class="workflow-operator-meta">{{ $t("admin.formData.approvalProcess") }}</div>
                      </div>
                    </div>
                    <div v-if="log.comment" class="workflow-comment">{{ log.comment }}</div>
                  </div>
                </template>
                <template v-else>
                  <div class="workflow-card workflow-card-compact">
                    <div class="workflow-card-header">
                      <div class="workflow-node">{{ $t("admin.formData.submitProcess") }}</div>
                      <div class="workflow-time">{{ formatDate(formData?.createTime) }}</div>
                    </div>
                    <div class="workflow-operator-row">
                      <div class="workflow-avatar">
                        {{ getOperatorInitial(formData?.createBy?.label) }}
                      </div>
                      <div class="workflow-operator-content">
                        <div class="workflow-operator-name">
                          {{ formData?.createBy?.label || $t("common.unknown") }}
                        </div>
                        <div class="workflow-operator-meta">{{ $t("admin.formData.initiator") }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
              <template v-else-if="changeLogs.length > 0">
                <div v-for="log in changeLogs" :key="log.id" class="workflow-card change-log-card">
                  <div class="workflow-card-header">
                    <div class="workflow-node">{{ $t("admin.formData.actionUpdate") }}</div>
                    <div class="workflow-time">{{ formatDate(log.operateTime) }}</div>
                  </div>
                  <div class="workflow-operator-row">
                    <div class="workflow-avatar">{{ getOperatorInitial(log.operator?.label) }}</div>
                    <div class="workflow-operator-content">
                      <div class="workflow-operator-name">{{ log.operator?.label || $t("admin.formData.system") }}</div>
                      <div class="workflow-operator-meta">{{ $t("admin.formData.dataLog") }}</div>
                    </div>
                  </div>
                  <div class="change-list">
                    <div v-for="item in log.content" :key="`${log.id}-${item.fieldId}`" class="change-row">
                      <div class="change-field">
                        {{ item.fieldLabel || item.fieldId }}
                        <span class="change-type">{{ formatChangeType(item.changeType) }}</span>
                      </div>
                      <div class="change-values">
                        <span>{{ formatChangeValue(item.oriVallue) }}</span>
                        <span class="change-arrow">→</span>
                        <span>{{ formatChangeValue(item.newVallue) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="workflow-card workflow-card-compact">
                  <div class="workflow-node">{{ $t("admin.formData.noDataLog") }}</div>
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
import { DataChangeType, FormDataChangeLog, FormDef, FormData, PrintDef, WfApprovalLog } from "@eimsnext/models";
import {
  customPrintService,
  formDataService,
  PrintRequest,
  printDefService,
  wfApprovalLogService,
} from "@eimsnext/services";
import { useFormStore } from "@eimsnext/store";
import { ShareLinkBar, ToolbarItem } from "@eimsnext/components";
import { useTagsViewStore } from "@/store";
import { useI18n } from "vue-i18n";
import FormView from "@/components/FormView/index.vue";
import FormPrintDiv from "@/components/WebPrint/FormPrintDiv.vue";
import { getPrintConfig, IPrintData } from "@/components/WebPrint/type";
import buildQuery from "odata-query";
import dayjs from "dayjs";

const PdfPreview = defineAsyncComponent(() => import("@/components/PrintDesigner/PdfPreview.vue"));

const { t } = useI18n();
const route = useRoute();
const formStore = useFormStore();
const tagsViewStore = useTagsViewStore();
const { isFullscreen, toggle } = useFullscreen();
const formDef = ref<FormDef>();
const formData = ref<FormData>();
const approvalLogs = ref<WfApprovalLog[]>([]);
const changeLogs = ref<FormDataChangeLog[]>([]);
const customPrintTemplates = ref<PrintDef[]>([]);
const loading = ref(false);
const printConfig = ref(getPrintConfig(false));
const formPrintData = ref<IPrintData>();
const printTrigger = ref<HTMLElement | null>(null);
const showPdfPreview = ref(false);
const showShareDialog = ref(false);
const pdfPreviewTitle = ref("");
const pdfPreviewUrl = ref("");
const sideTab = ref<"flow" | "dataLog">("flow");
const shareUrl = computed(() => `${window.location.origin}/#/app/${route.params.appId}/form/${route.params.formId}/data/${route.params.dataId}`);

const sideTitle = computed(() => {
  return sideTab.value === "flow" ? t("admin.formData.flowDynamic") : t("admin.formData.dataLog");
});

const sideRecordCount = computed(() => {
  return sideTab.value === "flow" ? approvalLogs.value.length : changeLogs.value.length;
});

const formatDate = (value?: number) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};

const getOperatorInitial = (label?: string) => {
  return label?.slice(0, 1) || "-";
};

const formatChangeValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatChangeType = (type: DataChangeType) => {
  switch (type) {
    case DataChangeType.Added:
      return t("admin.formData.changeAdded");
    case DataChangeType.Deleted:
      return t("admin.formData.changeDeleted");
    default:
      return t("admin.formData.changeModified");
  }
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
        text: t("common.share"),
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

const loadPrintDefs = async (formId: string) => {
  const query = buildQuery({ filter: { formId } });
  customPrintTemplates.value = await printDefService.query<PrintDef>(query);
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
    const printId = cmd.replace("custom-print:", "");
    const req: PrintRequest = { dataIds: [route.params.dataId.toString()], printId };
    const printResult = await customPrintService.print(req);

    if (printResult?.downloadUrl) {
      openCustomPrintPreview(printResult);
    } else {
      ElMessage.error(printResult?.message || t("common.printFailed"));
    }
    return;
  }

  switch (cmd) {
    case "share":
      showShareDialog.value = true;
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
  const authGroupId = (route.query.authGroupId as string) || undefined;
  const queryParams = authGroupId ? { authGroupId } : undefined;
  loading.value = true;

  try {
    const [form, data, logs, dataLogs] = await Promise.all([
      formStore.get(formId),
      formDataService.get<FormData>(dataId, queryParams),
      wfApprovalLogService.query<WfApprovalLog>(
        buildQuery({
          filter: { formId, dataId },
          orderBy: "approvalTime desc",
          top: 20,
        })
      ),
      formDataService.getChangeLogs(dataId, 0, 20, authGroupId),
    ]);

    if (form) {
      formDef.value = form;
      await loadPrintDefs(form.id);
    }

    if (data) {
      formData.value = data;
      generatePrintData();
    }

    approvalLogs.value = logs || [];
    changeLogs.value = dataLogs || [];
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
  background: var(--et-bg-page);
}

.shared-form-shell {
  max-width: 1280px;
  margin: 0 auto;
}

.shared-form-card {
  overflow: hidden;
  border: 1px solid var(--et-border-color-light);
  border-radius: 10px;
  background: var(--et-bg-container);
  box-shadow: var(--et-shadow-lg);
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
  border-bottom: 1px solid var(--et-border-color-light);
}

.shared-form-title {
  margin: 0;
  color: var(--et-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.shared-form-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: var(--et-text-tertiary);
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
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--et-bg-container);
  color: var(--et-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.shared-form-header-action-btn:hover {
  border-color: var(--et-border-color);
  background: var(--et-bg-hover);
  color: var(--et-text-primary);
}

.shared-form-header-action-btn:focus-visible {
  outline: 2px solid var(--et-color-primary-outline);
  outline-offset: 2px;
}

.shared-form-main-panel {
  min-width: 0;
  border-right: 1px solid var(--et-border-color-light);
}

.shared-form-toolbar-wrap {
  padding: 14px 16px 0;
  background: var(--et-bg-container);
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
  background: var(--et-bg-page);
}

.shared-side-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 18px;
  border-bottom: 1px solid var(--et-border-color-light);
  background: var(--et-bg-muted);
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
  color: var(--et-text-primary);
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
  color: var(--et-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.shared-side-extra {
  color: var(--et-text-tertiary);
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
  border: 1px solid var(--et-border-color-light);
  border-radius: 10px;
  background: var(--et-bg-container);
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
  color: var(--et-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.workflow-time {
  flex-shrink: 0;
  color: var(--et-text-secondary);
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
  background: var(--et-color-danger);
  color: var(--et-text-on-primary);
  font-size: 13px;
  font-weight: 700;
}

.workflow-operator-content {
  min-width: 0;
}

.workflow-operator-name {
  color: var(--et-text-primary);
  font-size: 14px;
}

.workflow-operator-meta,
.workflow-comment {
  color: var(--et-text-secondary);
  font-size: 12px;
}

.workflow-comment {
  margin-top: 10px;
  line-height: 1.6;
}

.change-log-card {
  padding-bottom: 10px;
}

.change-list {
  margin-top: 12px;
  border-top: 1px solid var(--et-border-color-light);
}

.change-row {
  padding: 10px 0 0;
}

.change-field {
  color: var(--et-text-primary);
  font-size: 13px;
  font-weight: 600;
}

.change-type {
  margin-left: 6px;
  color: var(--et-text-secondary);
  font-size: 12px;
  font-weight: 400;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--et-text-secondary);
  font-size: 12px;
  word-break: break-all;
}

.change-arrow {
  color: var(--et-text-tertiary);
}

.print-trigger {
  display: none;
}

:deep(.shared-form-toolbar .toolbar-container) {
  min-height: 48px;
  padding: 8px 12px;
  border: 1px solid var(--et-border-color);
  border-radius: 8px;
  background: var(--et-bg-container);
  box-shadow: var(--et-shadow-sm);
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
  background: var(--et-bg-hover);
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
  background: var(--et-border-color);
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
    border-bottom: 1px solid var(--et-border-color-light);
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
