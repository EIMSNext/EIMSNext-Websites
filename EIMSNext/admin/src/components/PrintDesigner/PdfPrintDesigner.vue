<template>
  <div class="flow-designer">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-button>打印模板设置</el-button>
        <el-button :loading="previewing" :disabled="!designerReady" @click="preview">预览</el-button>
        <el-button :loading="saving" :disabled="!designerReady" @click="save">保存</el-button>
      </div>
    </div>
    <div class="print-design-container" v-loading="loading">
      <el-tabs v-model="activeTab" class="field-container">
        <el-tab-pane label="表单字段" name="form" class="field-panel">
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
                      <et-icon size="16px" icon="el-copyDocument" class="node-icon"></et-icon>
                      <span class="node-label">{{ data.label }}</span>
                    </div>
                  </div>
                </template>
              </Draggable>
            </template>
          </el-tree>
        </el-tab-pane>
        <el-tab-pane label="系统字段" name="system" class="field-panel">
          <div>system</div>
        </el-tab-pane>
      </el-tabs>
      <div class="designer-stage">
        <el-alert v-if="loadError" type="error" :closable="false" show-icon>
          <template #title>打印设计器加载失败</template>
          {{ loadError }}
        </el-alert>
        <div ref="container" class="univer-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { FieldDef, FieldType, FormDef, PrintTemplate, PrintTemplateRequest } from "@eimsnext/models";
import { DataItemType, ITreeNode } from "@eimsnext/components";
import Draggable from "vuedraggable";
import { customPrintService, PrintPreviewRequest, printTemplateService } from "@eimsnext/services";
import { IPrintMetadata } from "./type";

defineOptions({
  name: "PdfPrintDesigner",
});

type UniverModule = typeof import("@univerjs/core");
type UIPluginModule = typeof import("@univerjs/ui");

type LoadedUniverModules = {
  core: UniverModule;
  render: typeof import("@univerjs/engine-render");
  ui: UIPluginModule;
  docs: typeof import("@univerjs/docs");
  docsDrawing: typeof import("@univerjs/docs-drawing");
  docsUi: typeof import("@univerjs/docs-ui");
  drawing: typeof import("@univerjs/drawing");
  drawingUi: typeof import("@univerjs/drawing-ui");
  sheets: typeof import("@univerjs/sheets");
  sheetsDrawing: typeof import("@univerjs/sheets-drawing");
  sheetsDrawingUi: typeof import("@univerjs/sheets-drawing-ui");
  sheetsUi: typeof import("@univerjs/sheets-ui");
  designLocale: { default: Record<string, unknown> };
  uiLocale: { default: Record<string, unknown> };
  drawingUiLocale: { default: Record<string, unknown> };
  docsUiLocale: { default: Record<string, unknown> };
  sheetsLocale: { default: Record<string, unknown> };
  sheetsDrawingUiLocale: { default: Record<string, unknown> };
  sheetsUiLocale: { default: Record<string, unknown> };
  coreFacade: { FUniver: any };
  sheetsFacade: { FWorkbook: any; FRange: any };
};

const props = defineProps<{
  formDef: FormDef;
  printDef: PrintTemplate;
}>();

const currentPrintDef = ref<PrintTemplate>(props.printDef);

const activeTab = ref("form");
const formStore = useFormStore();
const formFieldNodes = ref<ITreeNode[]>([]);
const draggingNode = ref<ITreeNode>();
const container = ref<HTMLElement | null>(null);
const loading = ref(false);
const previewing = ref(false);
const saving = ref(false);
const loadError = ref("");
const designerReady = computed(() => !loading.value && !loadError.value && !!workbookApi);

let univerObj: InstanceType<UniverModule["Univer"]> | undefined;
let univerApi: any;
let workbookApi: any;
let loadedModules: LoadedUniverModules | undefined;
let disposed = false;

const univerStyleImports = [
  "@univerjs/design/lib/index.css",
  "@univerjs/ui/lib/index.css",
  "@univerjs/drawing-ui/lib/index.css",
  "@univerjs/docs-ui/lib/index.css",
  "@univerjs/sheets-drawing-ui/lib/index.css",
  "@univerjs/sheets-ui/lib/index.css",
];

const hiddenMenuItems: Record<string, { hidden: boolean }> = {
  "sheet.command.add-range-protection-from-toolbar": { hidden: true },
  "sheet.contextMenu.permission": { hidden: true },
  "base-ui.operation.toggle-shortcut-panel": { hidden: true },
  "formula-ui.operation.insert-function": { hidden: true },
  "formula-ui.operation.more-functions": { hidden: true },
  "ribbon.data": { hidden: true },
  "ribbon.formulas": { hidden: true },
  "formula-bar": { hidden: true },
};

const ensureWorkbookApi = () => {
  if (!workbookApi) {
    throw new Error("打印设计器尚未完成初始化");
  }

  return workbookApi;
};

const populateFields = () => {
  formFieldNodes.value = [];

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

const loadUniverModules = async () => {
  if (loadedModules) {
    return loadedModules;
  }

  await Promise.all([
    import("@univerjs/core/facade"),
    import("@univerjs/ui/facade"),
    import("@univerjs/docs-ui/facade"),
    import("@univerjs/sheets/facade"),
    import("@univerjs/sheets-ui/facade"),
    ...univerStyleImports.map((path) => import(path)),
  ]);

  const [
    core,
    render,
    ui,
    docs,
    docsDrawing,
    docsUi,
    drawing,
    drawingUi,
    sheets,
    sheetsDrawing,
    sheetsDrawingUi,
    sheetsUi,
    designLocale,
    uiLocale,
    drawingUiLocale,
    docsUiLocale,
    sheetsLocale,
    sheetsDrawingUiLocale,
    sheetsUiLocale,
    coreFacade,
    sheetsFacade,
  ] = await Promise.all([
    import("@univerjs/core"),
    import("@univerjs/engine-render"),
    import("@univerjs/ui"),
    import("@univerjs/docs"),
    import("@univerjs/docs-drawing"),
    import("@univerjs/docs-ui"),
    import("@univerjs/drawing"),
    import("@univerjs/drawing-ui"),
    import("@univerjs/sheets"),
    import("@univerjs/sheets-drawing"),
    import("@univerjs/sheets-drawing-ui"),
    import("@univerjs/sheets-ui"),
    import("@univerjs/design/locale/zh-CN"),
    import("@univerjs/ui/locale/zh-CN"),
    import("@univerjs/drawing-ui/locale/zh-CN"),
    import("@univerjs/docs-ui/locale/zh-CN"),
    import("@univerjs/sheets/locale/zh-CN"),
    import("@univerjs/sheets-drawing-ui/locale/zh-CN"),
    import("@univerjs/sheets-ui/locale/zh-CN"),
    import("@univerjs/core/facade"),
    import("@univerjs/sheets/facade"),
  ]);

  loadedModules = {
    core,
    render,
    ui,
    docs,
    docsDrawing,
    docsUi,
    drawing,
    drawingUi,
    sheets,
    sheetsDrawing,
    sheetsDrawingUi,
    sheetsUi,
    designLocale: designLocale as { default: Record<string, unknown> },
    uiLocale: uiLocale as { default: Record<string, unknown> },
    drawingUiLocale: drawingUiLocale as { default: Record<string, unknown> },
    docsUiLocale: docsUiLocale as { default: Record<string, unknown> },
    sheetsLocale: sheetsLocale as { default: Record<string, unknown> },
    sheetsDrawingUiLocale: sheetsDrawingUiLocale as { default: Record<string, unknown> },
    sheetsUiLocale: sheetsUiLocale as { default: Record<string, unknown> },
    coreFacade: coreFacade as { FUniver: any },
    sheetsFacade: sheetsFacade as { FWorkbook: any; FRange: any },
  };

  return loadedModules;
};

const initSheet = async (data: Record<string, unknown>) => {
  if (!container.value) {
    throw new Error("未找到打印设计器容器");
  }

  const modules = await loadUniverModules();
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
        modules.sheetsUiLocale.default
      ),
    },
  });

  univer.registerPlugin(modules.render.UniverRenderEnginePlugin);
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
  univer.registerPlugin(modules.sheetsUi.UniverSheetsUIPlugin, {
    menu: hiddenMenuItems,
  });
  univer.registerPlugin(modules.sheetsDrawingUi.UniverSheetsDrawingUIPlugin);

  const runtimeApi = modules.coreFacade.FUniver.newAPI(univer);
  const runtimeWorkbook = runtimeApi.createWorkbook(data);

  if (!runtimeApi.Event?.DragOver || !runtimeApi.Event?.Drop) {
    throw new Error("Univer 0.21 运行时事件接口发生变化，请检查 facade Event 定义");
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
        dataType: "field",
        id: draggingNode.value.value!,
      };

      if (typeof (cell as any).setCustomMetaData !== "function") {
        throw new Error("Univer 0.21 运行时未提供 setCustomMetaData，打印字段元数据写入失败");
      }

      (cell as any).setCustomMetaData(printMetadata);
    }

    draggingNode.value = undefined;
  });

  univerObj = univer;
  univerApi = runtimeApi;
  workbookApi = runtimeWorkbook;
};

const initializeDesigner = async () => {
  const data = currentPrintDef.value.content
    ? JSON.parse(currentPrintDef.value.content)
    : { id: "Sheet1", name: "Sheet1" };

  loading.value = true;
  loadError.value = "";

  try {
    await nextTick();
    await initSheet(data as Record<string, unknown>);
  } catch (error) {
    univerObj?.dispose();
    univerObj = undefined;
    univerApi = undefined;
    workbookApi = undefined;
    loadError.value = error instanceof Error ? error.message : "打印设计器初始化失败";
    console.error("[PdfPrintDesigner] init failed", error);
  } finally {
    loading.value = false;
  }
};

const preview = async () => {
  try {
    previewing.value = true;
    const req: PrintPreviewRequest = {
      content: JSON.stringify(ensureWorkbookApi().save()),
      printType: currentPrintDef.value.printType,
    };

    const printResult = await customPrintService.preview(req);
    if (printResult?.downloadUrl) {
      window.open(printResult.downloadUrl, "_blank");
      return;
    }

    ElMessage.error(printResult?.message || "打印失败");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "打印失败");
  } finally {
    previewing.value = false;
  }
};

const save = async () => {
  try {
    saving.value = true;
    const req: PrintTemplateRequest = {
      id: currentPrintDef.value.id,
      name: currentPrintDef.value.name,
      appId: currentPrintDef.value.appId,
      formId: currentPrintDef.value.formId,
      content: JSON.stringify(ensureWorkbookApi().save()),
      printType: currentPrintDef.value.printType,
    };

    currentPrintDef.value = req.id
      ? await printTemplateService.put<PrintTemplate>(req.id, req)
      : await printTemplateService.post<PrintTemplate>(req);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
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
  (value) => {
    currentPrintDef.value = value;
  }
);

onMounted(async () => {
  populateFields();
  await initializeDesigner();
});

onBeforeUnmount(() => {
  disposed = true;
  univerObj?.dispose();
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

.drop-active {
  background-color: var(--et-bg-primary-soft);
  border: 2px dashed var(--et-color-primary) !important;
}
</style>

<style lang="scss">
.print-design-container .field-container {
  .el-tabs__nav.is-top {
    float: none;

    .el-tabs__item {
      flex: auto;
    }
  }
}
</style>
