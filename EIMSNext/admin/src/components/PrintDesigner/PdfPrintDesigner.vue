<template>
  <div class="flow-designer">
    <el-dialog v-model="showPageSetupDialog" :title="t('admin.printDesigner.settings')" width="560px">
      <el-form label-width="88px">
        <el-form-item :label="t('admin.printDesigner.paperSize')">
          <el-select v-model="pageSettingsDraft.paperSize" class="w-full">
            <el-option v-for="option in paperSizeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('admin.printDesigner.paperOrientation')">
          <el-radio-group v-model="pageSettingsDraft.orientation">
            <el-radio-button label="portrait">{{ t("admin.printDesigner.portrait") }}</el-radio-button>
            <el-radio-button label="landscape">{{ t("admin.printDesigner.landscape") }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('admin.printDesigner.pageMargin')">
          <div class="page-margin-grid">
            <div class="page-margin-item">
              <span class="page-margin-label">{{ t("admin.printDesigner.marginTop") }}</span>
              <el-input-number v-model="pageSettingsDraft.margins.top" :min="0" :step="1" :precision="0" controls-position="right" />
            </div>
            <div class="page-margin-item">
              <span class="page-margin-label">{{ t("admin.printDesigner.marginRight") }}</span>
              <el-input-number v-model="pageSettingsDraft.margins.right" :min="0" :step="1" :precision="0" controls-position="right" />
            </div>
            <div class="page-margin-item">
              <span class="page-margin-label">{{ t("admin.printDesigner.marginBottom") }}</span>
              <el-input-number v-model="pageSettingsDraft.margins.bottom" :min="0" :step="1" :precision="0" controls-position="right" />
            </div>
            <div class="page-margin-item">
              <span class="page-margin-label">{{ t("admin.printDesigner.marginLeft") }}</span>
              <el-input-number v-model="pageSettingsDraft.margins.left" :min="0" :step="1" :precision="0" controls-position="right" />
            </div>
          </div>
          <span class="page-margin-unit">{{ t("admin.printDesigner.marginUnit") }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPageSetupDialog = false">{{ t("common.cancel") }}</el-button>
          <el-button type="primary" @click="applyPageSettings">{{ t("common.ok") }}</el-button>
        </div>
      </template>
    </el-dialog>
    <PdfPreview
      v-model="showPrintPreview"
      :pdf-url="previewPdfUrl"
      :title="previewPdfTitle"
    />
    <div class="flow-actions">
      <div class="left">
        <span class="page-setup-summary">{{ pageSetupSummary }}</span>
      </div>
      <div class="right">
        <el-button @click="openPageSetupDialog">{{ t("admin.printDesigner.settings") }}</el-button>
        <el-button :loading="previewing" :disabled="!designerReady" @click="preview">{{ t("admin.printDesigner.preview") }}</el-button>
        <el-button :loading="saving" :disabled="!designerReady" @click="save">{{ t("common.save") }}</el-button>
      </div>
    </div>
    <div class="print-design-container" v-loading="loading">
      <el-tabs v-model="activeTab" class="field-container">
        <el-tab-pane :label="t('admin.printDesigner.formFields')" name="form" class="field-panel">
          <el-tree
            ref="formFieldsTreeRef"
            class="mt-2"
            :data="formFieldNodes"
            item-key="id"
            :props="{ children: 'children', label: 'label', disabled: '' }"
            :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
              <Draggable
                :list="[data]"
                :sort="false"
                ghost-class="ghost"
                @start="onStart"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                item-key="id"
              >
                <template #item="{ element }">
                  <div class="node-data" :title="data.label">
                    <div class="node-wrapper">
                      <et-icon
                        size="16px"
                        :icon="fieldIcons[data.data?.type] || 'fc-icon-input'"
                        class="node-icon"
                      ></et-icon>
                      <span class="node-label">{{ data.label }}</span>
                    </div>
                  </div>
                </template>
              </Draggable>
            </template>
          </el-tree>
        </el-tab-pane>
        <el-tab-pane :label="t('admin.printDesigner.systemFields')" name="system" class="field-panel">
          <el-tree
            ref="systemFieldsTreeRef"
            class="mt-2"
            :data="systemFieldNodes"
            item-key="id"
            :props="{ children: 'children', label: 'label', disabled: '' }"
            :expand-on-click-node="false"
            default-expand-all
          >
            <template #default="{ data }">
              <Draggable
                v-if="data.value !== 'approvallogs'"
                :list="[data]"
                :sort="false"
                ghost-class="ghost"
                @start="onStart"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                item-key="id"
              >
                <template #item="{ element }">
                  <div class="node-data" :title="data.label">
                    <div class="node-wrapper">
                      <et-icon
                        size="16px"
                        :icon="fieldIcons[data.data?.type] || 'fc-icon-input'"
                        class="node-icon"
                      ></et-icon>
                      <span class="node-label">{{ data.label }}</span>
                    </div>
                  </div>
                </template>
              </Draggable>
              <div v-else class="node-data" :title="data.label">
                <div class="node-wrapper">
                  <et-icon
                    size="16px"
                    :icon="fieldIcons[data.data?.type] || 'fc-icon-input'"
                    class="node-icon"
                  ></et-icon>
                  <span class="node-label">{{ data.label }}</span>
                </div>
              </div>
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>
      <div class="designer-stage">
        <el-alert v-if="loadError" type="error" :closable="false" show-icon>
          <template #title>{{ t("admin.printDesigner.designerLoadFailed") }}</template>
          {{ loadError }}
        </el-alert>
        <div ref="container" class="univer-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { FieldDef, FieldType, FormDef, PrintDef, PrintDefRequest } from "@eimsnext/models";
import { DataItemType, fieldIcons, ITreeNode } from "@eimsnext/components";
import { EimsPrintAreaPlugin, type PrintOrientation } from "@eimsnext/print-plugins";
import Draggable from "vuedraggable";
import { customPrintService, PrintPreviewRequest, printDefService } from "@eimsnext/services";
import { IPrintMetadata } from "./type";
import PdfPreview from "./PdfPreview.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "PdfPrintDesigner",
});

type UniverModule = typeof import("@univerjs/core");
type UIPluginModule = typeof import("@univerjs/ui");

type LoadedUniverModules = {
  core: UniverModule;
  react: any;
  render: typeof import("@univerjs/engine-render");
  engineFormula: typeof import("@univerjs/engine-formula");
  ui: UIPluginModule;
  docs: typeof import("@univerjs/docs");
  docsDrawing: typeof import("@univerjs/docs-drawing");
  docsUi: typeof import("@univerjs/docs-ui");
  drawing: typeof import("@univerjs/drawing");
  drawingUi: typeof import("@univerjs/drawing-ui");
  sheets: typeof import("@univerjs/sheets");
  sheetsDrawing: typeof import("@univerjs/sheets-drawing");
  sheetsDrawingUi: typeof import("@univerjs/sheets-drawing-ui");
  sheetsFormula: typeof import("@univerjs/sheets-formula");
  sheetsFormulaUi: typeof import("@univerjs/sheets-formula-ui");
  sheetsNumfmt: typeof import("@univerjs/sheets-numfmt");
  sheetsNumfmtUi: typeof import("@univerjs/sheets-numfmt-ui");
  sheetsUi: typeof import("@univerjs/sheets-ui");
  designLocale: { default: Record<string, unknown> };
  uiLocale: { default: Record<string, unknown> };
  drawingUiLocale: { default: Record<string, unknown> };
  docsUiLocale: { default: Record<string, unknown> };
  sheetsLocale: { default: Record<string, unknown> };
  sheetsDrawingUiLocale: { default: Record<string, unknown> };
  sheetsFormulaLocale: { default: Record<string, unknown> };
  sheetsFormulaUiLocale: { default: Record<string, unknown> };
  sheetsNumfmtUiLocale: { default: Record<string, unknown> };
  sheetsUiLocale: { default: Record<string, unknown> };
  coreFacade: { FUniver: any };
  sheetsFacade: { FWorkbook: any; FRange: any };
};

type PrintMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type PrintPageSettings = {
  paperSize: string;
  orientation: PrintOrientation;
  margins: PrintMargins;
};

type WorksheetPageSetup = {
  paperSize: string;
  orientation: PrintOrientation;
  topMargin: number;
  rightMargin: number;
  bottomMargin: number;
  leftMargin: number;
};

const paperSizeOptions = [
  { label: "A3", value: "A3" },
  { label: "A4", value: "A4" },
  { label: "A5", value: "A5" },
  { label: "B5", value: "B5" },
  { label: "Letter", value: "Letter" },
  { label: "Legal", value: "Legal" },
];

const createDefaultMargins = (): PrintMargins => ({
  top: 15,
  right: 15,
  bottom: 15,
  left: 15,
});

const createDefaultPageSettings = (): PrintPageSettings => ({
  paperSize: "A4",
  orientation: "portrait",
  margins: createDefaultMargins(),
});

const DEFAULT_SHEET_ID = "Sheet1";
const PAGE_SETUP_MENU_ID = "eimsnext.print.page-setup";
const PAGE_SETUP_MENU_ICON_ID = "eimsnext.print.page-setup.icon";
const DEFAULT_ROW_COUNT = 100;
const DEFAULT_COLUMN_COUNT = 26;

const mmToPoint = (millimeter: number) => Number((millimeter * 72 / 25.4).toFixed(4));

const pointToMm = (point: number) => Number((point * 25.4 / 72).toFixed(2));

const createDefaultWorkbookData = () => ({
  id: DEFAULT_SHEET_ID,
  name: DEFAULT_SHEET_ID,
  appVersion: "0.21.0",
  locale: "zhCN",
  sheetOrder: [DEFAULT_SHEET_ID],
  sheets: {
    [DEFAULT_SHEET_ID]: {
      id: DEFAULT_SHEET_ID,
      name: DEFAULT_SHEET_ID,
      rowCount: DEFAULT_ROW_COUNT,
      columnCount: DEFAULT_COLUMN_COUNT,
      cellData: {},
      rowData: {},
      columnData: {},
      rowHeight: {},
      columnWidth: {},
      mergeData: [],
      pageSetup: buildWorksheetPageSetup(createDefaultPageSettings()),
    },
  },
});

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

const clonePageSettings = (settings: PrintPageSettings): PrintPageSettings => ({
  paperSize: settings.paperSize,
  orientation: settings.orientation,
  margins: { ...settings.margins },
});

const normalizeOrientation = (value: unknown, fallback: PrintOrientation): PrintOrientation => (
  value === "landscape" || value === "portrait" ? value : fallback
);

const normalizeMarginValue = (value: unknown, fallback: number) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return value;
};

const normalizeDraftPageSettings = (value: PrintPageSettings): PrintPageSettings => {
  const defaults = createDefaultPageSettings();
  const paperSize = paperSizeOptions.some((option) => option.value === value.paperSize)
    ? value.paperSize
    : defaults.paperSize;

  return {
    paperSize,
    orientation: normalizeOrientation(value.orientation, defaults.orientation),
    margins: {
      top: normalizeMarginValue(value.margins.top, defaults.margins.top),
      right: normalizeMarginValue(value.margins.right, defaults.margins.right),
      bottom: normalizeMarginValue(value.margins.bottom, defaults.margins.bottom),
      left: normalizeMarginValue(value.margins.left, defaults.margins.left),
    },
  };
};

const normalizePageSettings = (value: unknown): PrintPageSettings => {
  const defaults = createDefaultPageSettings();
  if (!isRecord(value)) {
    return defaults;
  }

  const paperSize = typeof value.paperSize === "string" && paperSizeOptions.some((option) => option.value === value.paperSize)
    ? value.paperSize
    : defaults.paperSize;

  const resolveMarginMm = (primaryKey: keyof WorksheetPageSetup, fallback: number) => {
    const normalized = normalizeMarginValue(value[primaryKey], mmToPoint(fallback));
    return pointToMm(normalized);
  };

  return {
    paperSize,
    orientation: normalizeOrientation(value.orientation, defaults.orientation),
    margins: {
      top: resolveMarginMm("topMargin", defaults.margins.top),
      right: resolveMarginMm("rightMargin", defaults.margins.right),
      bottom: resolveMarginMm("bottomMargin", defaults.margins.bottom),
      left: resolveMarginMm("leftMargin", defaults.margins.left),
    },
  };
};

const buildWorksheetPageSetup = (settings: PrintPageSettings): WorksheetPageSetup => ({
  paperSize: settings.paperSize,
  orientation: settings.orientation,
  topMargin: mmToPoint(settings.margins.top),
  rightMargin: mmToPoint(settings.margins.right),
  bottomMargin: mmToPoint(settings.margins.bottom),
  leftMargin: mmToPoint(settings.margins.left),
});

const resolveActiveSheet = (workbookData: Record<string, unknown>) => {
  const sheets = isRecord(workbookData.sheets) ? workbookData.sheets : undefined;
  if (!sheets) {
    return undefined;
  }

  const sheetOrder = Array.isArray(workbookData.sheetOrder) ? workbookData.sheetOrder : undefined;
  const firstSheetKey = sheetOrder?.find((item): item is string => typeof item === "string" && isRecord(sheets[item]))
    ?? Object.keys(sheets).find((key) => isRecord(sheets[key]));

  if (!firstSheetKey) {
    return undefined;
  }

  const sheet = sheets[firstSheetKey];
  return isRecord(sheet) ? sheet : undefined;
};

const applyPageSetupToWorkbookData = (workbookData: Record<string, unknown>, settings: PrintPageSettings) => {
  const activeSheet = resolveActiveSheet(workbookData);
  if (!activeSheet) {
    return workbookData;
  }

  activeSheet.pageSetup = buildWorksheetPageSetup(settings);
  return workbookData;
};

const props = defineProps<{
  formDef: FormDef;
  printDef: PrintDef;
}>();

const currentPrintDef = ref<PrintDef>(props.printDef);

const activeTab = ref("form");
const formStore = useFormStore();
const formFieldNodes = ref<ITreeNode[]>([]);
const systemFieldNodes = ref<ITreeNode[]>([]);
const draggingNode = ref<ITreeNode>();
const container = ref<HTMLElement | null>(null);
const showPageSetupDialog = ref(false);
const loading = ref(false);
const previewing = ref(false);
const saving = ref(false);
const loadError = ref("");
const showPrintPreview = ref(false);
const previewPdfUrl = ref("");
const previewPdfTitle = ref("");
const pageSettings = ref<PrintPageSettings>(createDefaultPageSettings());
const pageSettingsDraft = reactive<PrintPageSettings>(createDefaultPageSettings());
const designerReady = computed(() => !loading.value && !loadError.value && !!workbookApi);
const pageSetupSummary = computed(() => {
  const margins = pageSettings.value.margins;
  return t("admin.printDesigner.pageSummary", {
    paper: pageSettings.value.paperSize,
    orientation: pageSettings.value.orientation === "landscape"
      ? t("admin.printDesigner.landscape")
      : t("admin.printDesigner.portrait"),
    top: margins.top,
    right: margins.right,
    bottom: margins.bottom,
    left: margins.left,
  });
});

let univerObj: InstanceType<UniverModule["Univer"]> | undefined;
let univerApi: any;
let workbookApi: any;
let loadedModules: LoadedUniverModules | undefined;
let printAreaPlugin: EimsPrintAreaPlugin | undefined;
let disposed = false;

const hiddenMenuItems: Record<string, { hidden: boolean }> = {
  "sheet.command.add-range-protection-from-toolbar": { hidden: true },
  "sheet.contextMenu.permission": { hidden: true },
  "base-ui.operation.toggle-shortcut-panel": { hidden: true },
  "formula-ui.operation.insert-function": { hidden: true },
  "formula-ui.operation.more-functions": { hidden: true },
  "formula-ui.operation.insert-function.common": { hidden: true },
  "formula-ui.operation.insert-function.financial": { hidden: true },
  "formula-ui.operation.insert-function.logical": { hidden: true },
  "formula-ui.operation.insert-function.text": { hidden: true },
  "formula-ui.operation.insert-function.date": { hidden: true },
  "formula-ui.operation.insert-function.lookup": { hidden: true },
  "formula-ui.operation.insert-function.math": { hidden: true },
  "formula-ui.operation.insert-function.statistical": { hidden: true },
  "formula-ui.operation.insert-function.engineering": { hidden: true },
  "formula-ui.operation.insert-function.information": { hidden: true },
  "formula-ui.operation.insert-function.database": { hidden: true },
  "ribbon.data": { hidden: true },
  "ribbon.formulas": { hidden: true },
  "formula-bar": { hidden: true },
  "sheet.toolbar.text-to-number": { hidden: true },
};

const syncPageSettingsDraft = () => {
  const nextSettings = clonePageSettings(pageSettings.value);
  pageSettingsDraft.paperSize = nextSettings.paperSize;
  pageSettingsDraft.orientation = nextSettings.orientation;
  pageSettingsDraft.margins.top = nextSettings.margins.top;
  pageSettingsDraft.margins.right = nextSettings.margins.right;
  pageSettingsDraft.margins.bottom = nextSettings.margins.bottom;
  pageSettingsDraft.margins.left = nextSettings.margins.left;
};

const openPageSetupDialog = () => {
  syncPageSettingsDraft();
  showPageSetupDialog.value = true;
};

const applyPageSettings = () => {
  pageSettings.value = normalizeDraftPageSettings(pageSettingsDraft);
  syncPageSettingsDraft();
  printAreaPlugin?.refresh();
  showPageSetupDialog.value = false;
};

const createPageSetupMenuIcon = (react: any) => {
  const { createElement } = react;

  return function PageSetupMenuIcon(props: Record<string, unknown>) {
    return createElement(
      "span",
      {
        ...props,
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          ...(typeof props.style === "object" ? props.style : {}),
        },
      },
      createElement(
        "svg",
        {
          viewBox: "0 0 1024 1024",
          width: "1em",
          height: "1em",
          fill: "currentColor",
          ariaHidden: "true",
        },
        createElement("path", {
          d: "M256 128a64 64 0 0 0-64 64v160h64V192h512v160h64V192a64 64 0 0 0-64-64H256zm-64 288c-70.688 0-128 57.312-128 128v192h128v160h640V736h128V544c0-70.688-57.312-128-128-128H192zm64 64h512v128H256V480zm-64 0v352h-64V544a64 64 0 0 1 64-64zm640 0h64a64 64 0 0 1 64 64v288h-64V480zm-512 192h384v160H320V672zm448-96a48 48 0 1 0 0-96 48 48 0 0 0 0 96z",
        })
      )
    );
  };
};

const registerPageSetupToolbarMenu = (modules: LoadedUniverModules, runtimeApi: any) => {
  runtimeApi.registerComponent(PAGE_SETUP_MENU_ICON_ID, createPageSetupMenuIcon(modules.react));
  runtimeApi.createMenu({
    id: PAGE_SETUP_MENU_ID,
    title: t("admin.printDesigner.pageSetupMenu"),
    tooltip: t("admin.printDesigner.pageSetupMenu"),
    icon: PAGE_SETUP_MENU_ICON_ID,
    order: 1000,
    action: openPageSetupDialog,
  }).appendTo([modules.ui.RibbonPosition.INSERT, modules.ui.RibbonInsertGroup.MEDIA]);
};

const disposeDesigner = () => {
  printAreaPlugin?.dispose();
  printAreaPlugin = undefined;
  univerObj?.dispose();
  univerObj = undefined;
  univerApi = undefined;
  workbookApi = undefined;

  if (container.value) {
    container.value.innerHTML = "";
  }
};

const parseTemplateContent = () => {
  if (!currentPrintDef.value.content) {
    pageSettings.value = createDefaultPageSettings();
    syncPageSettingsDraft();
    return createDefaultWorkbookData();
  }

  const parsed = JSON.parse(currentPrintDef.value.content);
  if (!isRecord(parsed)) {
    throw new Error(t("admin.printDesigner.invalidTemplate"));
  }

  const workbookData = { ...parsed };
  const activeSheet = resolveActiveSheet(workbookData);
  const rawSettings = activeSheet?.pageSetup;
  pageSettings.value = normalizePageSettings(rawSettings);
  syncPageSettingsDraft();

  return applyPageSetupToWorkbookData(
    Object.keys(workbookData).length > 0 ? workbookData : createDefaultWorkbookData(),
    pageSettings.value
  );
};

const serializeTemplateContent = () => applyPageSetupToWorkbookData({
  ...ensureWorkbookApi().save(),
}, pageSettings.value);

const ensureWorkbookApi = () => {
  if (!workbookApi) {
    throw new Error(t("admin.printDesigner.designerNotReady"));
  }

  return workbookApi;
};

const populateFields = () => {
  formFieldNodes.value = [];
  systemFieldNodes.value = buildSystemFieldNodes();

  if (props.formDef.content && props.formDef.content.items) {
    props.formDef.content.items.forEach((x: FieldDef) => {
      const node: ITreeNode = {
        id: x.field,
        value: x.field,
        label: x.title,
        fullLabel: x.title,
        type: DataItemType.Field,
        data: x,
      };

      if (x.columns && x.columns.length > 0) {
        node.children = [];
        x.columns.forEach((y) => {
          const subNode: ITreeNode = {
            id: `${node.id}-${y.field}`,
            value: `${node.id}>${y.field}`,
            label: y.title,
            fullLabel: `${node.label}.${y.title}`,
            type: DataItemType.Field,
            data: y,
          };

          node.children?.push(subNode);
        });
      }

      formFieldNodes.value.push(node);
    });
  }
};

function buildSystemFieldNodes(): ITreeNode[] {
  const fields: Array<{
    id: string;
    labelKey: string;
    type: FieldType;
    dataType?: "qrcode";
  }> = [
    { id: "createby", labelKey: "submitter", type: FieldType.Employee1 },
    { id: "createtime", labelKey: "submittedAt", type: FieldType.TimeStamp },
    { id: "updatetime", labelKey: "updatedAt", type: FieldType.TimeStamp },
    { id: "ext", labelKey: "extensionField", type: FieldType.Input },
    { id: "flowstatus", labelKey: "flowStatus", type: FieldType.Input },
    { id: "internalqrcode", labelKey: "internalQrCode", type: FieldType.Input, dataType: "qrcode" },
    { id: "externalqrcode", labelKey: "externalQrCode", type: FieldType.Input, dataType: "qrcode" },
    { id: "printedby", labelKey: "printOperator", type: FieldType.Employee1 },
    { id: "printedtime", labelKey: "printTime", type: FieldType.TimeStamp },
  ];

  const nodes: ITreeNode[] = fields.map((field) => ({
    id: field.id,
    value: field.id,
    label: t(`admin.printDesigner.${field.labelKey}`),
    fullLabel: t(`admin.printDesigner.${field.labelKey}`),
    type: DataItemType.Field,
    data: { type: field.type, printDataType: field.dataType || "field" },
  }));

  if (!props.formDef.usingWorkflow) {
    return nodes;
  }

  nodes.splice(5, 0,
    {
      id: "currentnode",
      value: "currentnode",
      label: t("admin.printDesigner.currentNode"),
      fullLabel: t("admin.printDesigner.currentNode"),
      type: DataItemType.Field,
      data: { type: FieldType.Input, printDataType: "field" },
    },
    {
      id: "currentowner",
      value: "currentowner",
      label: t("admin.printDesigner.currentOwner"),
      fullLabel: t("admin.printDesigner.currentOwner"),
      type: DataItemType.Field,
      data: { type: FieldType.Employee1, printDataType: "field" },
    },
  );

  const approvalFields = [
    { id: "sequence", labelKey: "approvalSequence", type: FieldType.Number },
    { id: "approvaltime", labelKey: "approvalTime", type: FieldType.TimeStamp },
    { id: "nodename", labelKey: "approvalNodeName", type: FieldType.Input },
    { id: "approver", labelKey: "approvalApprover", type: FieldType.Employee1 },
    { id: "comment", labelKey: "approvalContent", type: FieldType.TextArea },
    { id: "result", labelKey: "approvalResult", type: FieldType.Input },
  ];
  const approvalLabel = t("admin.printDesigner.approvalInfo");
  nodes.push({
    id: "approvallogs",
    value: "approvallogs",
    label: approvalLabel,
    fullLabel: approvalLabel,
    type: DataItemType.Field,
    data: { type: FieldType.TableForm, printDataType: "field" },
    children: approvalFields.map((field) => ({
      id: `approvallogs-${field.id}`,
      value: `approvallogs>${field.id}`,
      label: t(`admin.printDesigner.${field.labelKey}`),
      fullLabel: `${approvalLabel}.${t(`admin.printDesigner.${field.labelKey}`)}`,
      type: DataItemType.Field,
      data: { type: field.type, printDataType: "field" },
    })),
  });

  return nodes;
}

const loadUniverModules = async () => {
  if (loadedModules) {
    return loadedModules;
  }

  console.log("[PdfPrintDesigner] loadUniverModules: starting first batch (9 facade imports)");
  const t1 = Date.now();
  await Promise.all([
    import("@univerjs/core/facade"),
    import("@univerjs/ui/facade"),
    import("@univerjs/docs-ui/facade"),
    import("@univerjs/sheets/facade"),
    import("@univerjs/sheets-ui/facade"),
    import("@univerjs/sheets-formula/facade"),
    import("@univerjs/sheets-numfmt/facade"),
  ]);
  console.log(`[PdfPrintDesigner] loadUniverModules: first batch done in ${Date.now() - t1}ms`);

  console.log("[PdfPrintDesigner] loadUniverModules: starting second batch (24 imports)");
  const t2 = Date.now();
  const [
    core,
    react,
    render,
    engineFormula,
    ui,
    docs,
    docsDrawing,
    docsUi,
    drawing,
    drawingUi,
    sheets,
    sheetsDrawing,
    sheetsDrawingUi,
    sheetsFormula,
    sheetsFormulaUi,
    sheetsNumfmt,
    sheetsNumfmtUi,
    sheetsUi,
    designLocale,
    uiLocale,
    drawingUiLocale,
    docsUiLocale,
    sheetsLocale,
    sheetsDrawingUiLocale,
    sheetsFormulaLocale,
    sheetsFormulaUiLocale,
    sheetsNumfmtUiLocale,
    sheetsUiLocale,
    coreFacade,
    sheetsFacade,
  ] = await Promise.all([
    import("@univerjs/core"),
    import("react"),
    import("@univerjs/engine-render"),
    import("@univerjs/engine-formula"),
    import("@univerjs/ui"),
    import("@univerjs/docs"),
    import("@univerjs/docs-drawing"),
    import("@univerjs/docs-ui"),
    import("@univerjs/drawing"),
    import("@univerjs/drawing-ui"),
    import("@univerjs/sheets"),
    import("@univerjs/sheets-drawing"),
    import("@univerjs/sheets-drawing-ui"),
    import("@univerjs/sheets-formula"),
    import("@univerjs/sheets-formula-ui"),
    import("@univerjs/sheets-numfmt"),
    import("@univerjs/sheets-numfmt-ui"),
    import("@univerjs/sheets-ui"),
    import("@univerjs/design/locale/zh-CN"),
    import("@univerjs/ui/locale/zh-CN"),
    import("@univerjs/drawing-ui/locale/zh-CN"),
    import("@univerjs/docs-ui/locale/zh-CN"),
    import("@univerjs/sheets/locale/zh-CN"),
    import("@univerjs/sheets-drawing-ui/locale/zh-CN"),
    import("@univerjs/sheets-formula/locale/zh-CN"),
    import("@univerjs/sheets-formula-ui/locale/zh-CN"),
    import("@univerjs/sheets-numfmt-ui/locale/zh-CN"),
    import("@univerjs/sheets-ui/locale/zh-CN"),
    import("@univerjs/core/facade"),
    import("@univerjs/sheets/facade"),
  ]);
  console.log(`[PdfPrintDesigner] loadUniverModules: second batch done in ${Date.now() - t2}ms`);

  loadedModules = {
    core,
    react,
    render,
    engineFormula,
    ui,
    docs,
    docsDrawing,
    docsUi,
    drawing,
    drawingUi,
    sheets,
    sheetsDrawing,
    sheetsDrawingUi,
    sheetsFormula,
    sheetsFormulaUi,
    sheetsNumfmt,
    sheetsNumfmtUi,
    sheetsUi,
    designLocale: designLocale as { default: Record<string, unknown> },
    uiLocale: uiLocale as { default: Record<string, unknown> },
    drawingUiLocale: drawingUiLocale as { default: Record<string, unknown> },
    docsUiLocale: docsUiLocale as { default: Record<string, unknown> },
    sheetsLocale: sheetsLocale as { default: Record<string, unknown> },
    sheetsDrawingUiLocale: sheetsDrawingUiLocale as { default: Record<string, unknown> },
    sheetsFormulaLocale: sheetsFormulaLocale as { default: Record<string, unknown> },
    sheetsFormulaUiLocale: sheetsFormulaUiLocale as { default: Record<string, unknown> },
    sheetsNumfmtUiLocale: sheetsNumfmtUiLocale as { default: Record<string, unknown> },
    sheetsUiLocale: sheetsUiLocale as { default: Record<string, unknown> },
    coreFacade: coreFacade as { FUniver: any },
    sheetsFacade: sheetsFacade as { FWorkbook: any; FRange: any },
  };

  return loadedModules;
};

const initSheet = async (data: Record<string, unknown>) => {
  if (!container.value) {
    throw new Error(t("admin.printDesigner.containerMissing"));
  }

  console.log("[PdfPrintDesigner] initSheet: loading Univer modules...");
  const modules = await loadUniverModules();
  console.log("[PdfPrintDesigner] initSheet: creating Univer instance...");
  const { LocaleType, merge, Univer } = modules.core;

  const univer = new Univer({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge(
        {},
        modules.designLocale.default,
        modules.uiLocale.default,
        modules.drawingUiLocale.default,
        modules.docsUiLocale.default,
        modules.sheetsLocale.default,
        modules.sheetsDrawingUiLocale.default,
        modules.sheetsFormulaLocale.default,
        modules.sheetsFormulaUiLocale.default,
        modules.sheetsNumfmtUiLocale.default,
        modules.sheetsUiLocale.default
      ),
    },
  });

  console.log("[PdfPrintDesigner] initSheet: registering Univer plugins...");
  univer.registerPlugin(modules.render.UniverRenderEnginePlugin);
  univer.registerPlugin(modules.engineFormula.UniverFormulaEnginePlugin);
  univer.registerPlugin(modules.ui.UniverUIPlugin, {
    container: container.value,
    header: true,
    toolbar: true,
    footer: true,
    contextMenu: true,
    headerMenu: true,
    ribbonType: "simple",
  });
  univer.registerPlugin(modules.drawing.UniverDrawingPlugin);
  univer.registerPlugin(modules.drawingUi.UniverDrawingUIPlugin);
  univer.registerPlugin(modules.docs.UniverDocsPlugin);
  univer.registerPlugin(modules.docsDrawing.UniverDocsDrawingPlugin);
  univer.registerPlugin(modules.docsUi.UniverDocsUIPlugin);
  univer.registerPlugin(modules.sheets.UniverSheetsPlugin);
  univer.registerPlugin(modules.sheetsDrawing.UniverSheetsDrawingPlugin);
  univer.registerPlugin(modules.sheetsFormula.UniverSheetsFormulaPlugin);
  univer.registerPlugin(modules.sheetsNumfmt.UniverSheetsNumfmtPlugin);
  univer.registerPlugin(modules.sheetsUi.UniverSheetsUIPlugin, {
    menu: hiddenMenuItems,
  });
  univer.registerPlugin(modules.sheetsFormulaUi.UniverSheetsFormulaUIPlugin);
  univer.registerPlugin(modules.sheetsNumfmtUi.UniverSheetsNumfmtUIPlugin);
  univer.registerPlugin(modules.sheetsDrawingUi.UniverSheetsDrawingUIPlugin);

  const runtimeApi = modules.coreFacade.FUniver.newAPI(univer);
  registerPageSetupToolbarMenu(modules, runtimeApi);
  const runtimeWorkbook = runtimeApi.createWorkbook(data);
  const renderManagerService = (univer as any).__getInjector?.().get(modules.render.IRenderManagerService);
  const runtimeUnitId = typeof runtimeWorkbook?.getId === "function"
    ? runtimeWorkbook.getId()
    : typeof runtimeWorkbook?.getUnitId === "function"
      ? runtimeWorkbook.getUnitId()
      : DEFAULT_SHEET_ID;

  if (!renderManagerService) {
    throw new Error(t("admin.printDesigner.renderServiceMissing"));
  }

  if (!runtimeUnitId) {
    throw new Error(t("admin.printDesigner.unitIdMissing"));
  }

  univerObj = univer;
  univerApi = runtimeApi;
  workbookApi = runtimeWorkbook;

  printAreaPlugin = new EimsPrintAreaPlugin({
    container: container.value,
    unitId: runtimeUnitId,
    getWorkbook: () => workbookApi,
    getPageSettings: () => pageSettings.value,
  }, renderManagerService);
  printAreaPlugin.onRendered();
  console.log("[PdfPrintDesigner] initSheet: scheduling requestAnimationFrame...");
  requestAnimationFrame(() => {
    console.log("[PdfPrintDesigner] requestAnimationFrame: fired, refreshing print area");
    printAreaPlugin?.refresh();
  });

  if (!runtimeApi.Event?.DragOver || !runtimeApi.Event?.Drop) {
    throw new Error(t("admin.printDesigner.eventApiChanged"));
  }

  runtimeApi.addEvent(runtimeApi.Event.DragOver, (params: any) => {
    if (!draggingNode.value) {
      return;
    }

    params.dataTransfer.dropEffect = "move";
    const range = params.worksheet.getRange(params.row, params.column);
    if (range) {
      params.worksheet.setActiveRange(range);
    }
  });

  runtimeApi.addEvent(runtimeApi.Event.Drop, (params: any) => {
    if (!draggingNode.value) {
      return;
    }

    const cell = params.worksheet.getRange(params.row, params.column);
    if (cell) {
      cell.setValue(`\${${draggingNode.value.fullLabel}}`);
      const printMetadata: IPrintMetadata = {
        dataType: draggingNode.value.data?.printDataType || "field",
        id: draggingNode.value.value!,
      };

      if (typeof (cell as any).setCustomMetaData !== "function") {
        throw new Error(t("admin.printDesigner.metadataApiMissing"));
      }

      (cell as any).setCustomMetaData(printMetadata);
    }

    draggingNode.value = undefined;
  });

  printAreaPlugin?.refresh();
  console.log("[PdfPrintDesigner] initSheet: complete");
};

const initializeDesigner = async () => {
  console.log("[PdfPrintDesigner] initializeDesigner: start, disposed=", disposed);
  loading.value = true;
  loadError.value = "";

  try {
    const data = parseTemplateContent();
    await nextTick();
    if (disposed) {
      console.log("[PdfPrintDesigner] initializeDesigner: already disposed, early return");
      return;
    }

    disposeDesigner();
    console.log("[PdfPrintDesigner] initializeDesigner: calling initSheet...");
    const t = Date.now();
    await initSheet(data as Record<string, unknown>);
    console.log(`[PdfPrintDesigner] initializeDesigner: initSheet completed in ${Date.now() - t}ms`);
  } catch (error) {
    console.error("[PdfPrintDesigner] initializeDesigner: caught error", error);
    disposeDesigner();
    loadError.value = error instanceof Error ? error.message : t("admin.printDesigner.initFailed");
    console.error("[PdfPrintDesigner] init failed", error);
  } finally {
    console.log("[PdfPrintDesigner] initializeDesigner: end, loading=false");
    loading.value = false;
  }
};

const preview = async () => {
  try {
    previewing.value = true;
    const req: PrintPreviewRequest = {
      content: JSON.stringify(serializeTemplateContent()),
      printType: currentPrintDef.value.printType,
    };

    const printResult = await customPrintService.preview(req);
    if (printResult?.downloadUrl) {
      previewPdfUrl.value = printResult.downloadUrl;
      previewPdfTitle.value = currentPrintDef.value.name || t("admin.printDesigner.previewTitle");
      showPrintPreview.value = true;
      return;
    }

    ElMessage.error(printResult?.message || t("admin.printDesigner.previewFailed"));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t("admin.printDesigner.previewFailed"));
  } finally {
    previewing.value = false;
  }
};

const save = async () => {
  try {
    saving.value = true;
    const req: PrintDefRequest = {
      id: currentPrintDef.value.id,
      name: currentPrintDef.value.name,
      appId: currentPrintDef.value.appId,
      formId: currentPrintDef.value.formId,
      content: JSON.stringify(serializeTemplateContent()),
      printType: currentPrintDef.value.printType,
    };

    currentPrintDef.value = req.id
      ? await printDefService.put<PrintDef>(req.id, req)
      : await printDefService.post<PrintDef>(req);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
};

const onStart = (e: any) => {
  e.preventDefault();
  const vm = e.item._underlying_vm_;
  if (vm.data.type == FieldType.TableForm) {
    e.cancel = true;
    return;
  }

  draggingNode.value = vm;
};

watch(
  () => props.printDef,
  async (value, oldValue) => {
    console.log("[PdfPrintDesigner] watch printDef: changed", oldValue?.id, "->", value?.id);
    currentPrintDef.value = value;

    if (container.value) {
      await initializeDesigner();
    }
  }
);

onMounted(async () => {
  console.log("[PdfPrintDesigner] onMounted: component mounted");
  populateFields();
  await initializeDesigner();
});

onBeforeUnmount(() => {
  console.log("[PdfPrintDesigner] onBeforeUnmount: component about to unmount, disposed=", disposed);
  disposed = true;
  disposeDesigner();
});
</script>

<style lang="scss" scoped>
.print-design-container {
  height: 100%;
  display: flex;
  padding: 0 var(--et-space-5);

  .field-container {
    width: var(--et-size-300);
    height: 100%;

    .field-panel {
      height: 100%;
      padding: 0 var(--et-space-15) 0 var(--et-space-12);
    }

    :deep(.el-tree-node__content) {
      height: var(--et-line-height-30);
      width: 100%;
      cursor: move;

      > div {
        width: 100%;
      }
    }

    .node-data {
      width: 100%;
      display: flex;
      align-items: center;
      line-height: var(--et-line-height-30);
    }

    .node-wrapper {
      width: 100%;
      display: flex;
      align-items: center;

      .node-label {
        flex: 1;
        padding-left: var(--et-space-5);
        font-size: var(--et-font-size-14);
        white-space: nowrap;
      }

      .node-action {
        white-space: nowrap;
        flex-shrink: 0;
        margin-left: var(--et-space-10);
        pointer-events: none;
        display: none;
        align-items: center;

        .action-item {
          margin-right: var(--et-space-5);
          cursor: pointer;

          &:last-child {
            margin-right: 0;
          }

          &:hover {
            color: var(--et-color-primary);
          }
        }
      }

      &:hover {
        .node-action {
          display: flex;
        }
      }
    }
  }

  .designer-stage {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--et-space-10);
    min-width: 0;
  }

  .univer-container {
    width: 100%;
    height: 100%;
    min-height: 0;
  }
}

.page-setup-summary {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-32);
}

.page-margin-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--et-space-12);
}

.page-margin-item {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);

  .el-input-number {
    width: 100%;
  }
}

.page-margin-label,
.page-margin-unit {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
}

.page-margin-unit {
  margin-top: var(--et-space-8);
  display: inline-block;
}

.drop-active {
  background-color: var(--et-bg-primary-soft);
  border: 2px dashed var(--et-color-primary) !important;
}
</style>

<style lang="scss">
.flow-designer {
  .univer-container {
    [data-u-comp="defined-name"] {
      display: none;
    }

    [data-u-comp="formula-bar"] > div:first-child {
      display: none;
    }
  }
}

.print-design-container .field-container {
  .el-tabs__nav.is-top {
    float: none;

    .el-tabs__item {
      flex: auto;
    }
  }
}
</style>
