<template>
  <div class="flow-designer">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-button>打印模板设置</el-button>
        <el-button>预览</el-button>
        <el-button @click="save">保存</el-button>
      </div>
    </div>
    <div class="print-design-container">
      <el-tabs v-model="activeTab" class="field-container">
        <el-tab-pane label="表单字段" name="form" class="field-panel">
          <el-tree ref="formFieldsTreeRef" class="mt-2" :data="formFieldNodes" item-key="id"
            :props="{ children: 'children', label: 'label', disabled: '' }" :expand-on-click-node="false">
            <template #default="{ node, data }">
              <Draggable :list="[data]" :sort="false" ghost-class="ghost" @start="onStart"
                :group="{ name: 'fields', pull: 'clone', put: false }" item-key="id">
                <template #item="{ element }">
                  <div class="node-data" :title="data.label">
                    <div class="node-wrapper">
                      <el-icon class="node-icon">
                        <UserFilled />
                      </el-icon>
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
      <div id="univer-container" class="univer-container" ref="container"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LocaleType, merge, Univer, UniverInstanceType } from "@univerjs/core";
import { defaultTheme } from "@univerjs/design";
import { UniverFormulaEnginePlugin } from "@univerjs/engine-formula";
import { UniverRenderEnginePlugin } from "@univerjs/engine-render";
import { UniverUIPlugin } from "@univerjs/ui";
import { UniverDocsPlugin } from "@univerjs/docs";
import { UniverDocsUIPlugin } from "@univerjs/docs-ui";
import { UniverSheetsPlugin } from "@univerjs/sheets";
import { UniverSheetsUIPlugin } from "@univerjs/sheets-ui";
import { UniverSheetsFormulaPlugin } from "@univerjs/sheets-formula";
import { UniverSheetsFormulaUIPlugin } from "@univerjs/sheets-formula-ui";
import { UniverSheetsNumfmtPlugin } from "@univerjs/sheets-numfmt";
import { UniverSheetsNumfmtUIPlugin } from "@univerjs/sheets-numfmt-ui";

//@ts-expect-error
import DesignZhCN from "@univerjs/design/locale/zh-CN";
//@ts-expect-error
import UIZhCN from "@univerjs/ui/locale/zh-CN";
//@ts-expect-error
import DocsUIZhCN from "@univerjs/docs-ui/locale/zh-CN";
//@ts-expect-error
import SheetsZhCN from "@univerjs/sheets/locale/zh-CN";
//@ts-expect-error
import SheetsUIZhCN from "@univerjs/sheets-ui/locale/zh-CN";
//@ts-expect-error
import SheetsFormulaUIZhCN from "@univerjs/sheets-formula-ui/locale/zh-CN";
//@ts-expect-error
import SheetsNumfmtUIZhCN from "@univerjs/sheets-numfmt-ui/locale/zh-CN";

// 这里的 Facade API 是可选的，你可以根据自己的需求来决定是否引入
import "@univerjs/core/facade";
import "@univerjs/engine-formula/facade";
import "@univerjs/ui/facade";
import "@univerjs/docs-ui/facade";
import "@univerjs/sheets/facade";
import "@univerjs/sheets-ui/facade";
import "@univerjs/sheets-formula/facade";
import "@univerjs/sheets-numfmt/facade";

import "@univerjs/design/lib/index.css";
import "@univerjs/ui/lib/index.css";
import "@univerjs/docs-ui/lib/index.css";
import "@univerjs/sheets-ui/lib/index.css";
import "@univerjs/sheets-formula-ui/lib/index.css";
import "@univerjs/sheets-numfmt-ui/lib/index.css";

//@ts-expect-error
import { FUniver } from "@univerjs/core/facade";
//@ts-expect-error
import { FWorkbook, FWorksheet, FRange } from "@univerjs/sheets/facade";
import { useFormStore } from "@eimsnext/store";
import { FieldDef, FormDef, PrintTemplate, PrintTemplateRequest } from "@eimsnext/models";
import { ITreeNode, TreeNodeType } from "@eimsnext/components";
import Draggable from "vuedraggable";
import { printTemplateService } from "@eimsnext/services";
import { IPrintMetadata } from "./type";

defineOptions({
  name: "PdfPrintDesigner",
});

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
let univerObj: Univer;
let univerApi: FUniver;
let workbookApi: FWorkbook;

const populateFields = () => {
  formFieldNodes.value = [];

  if (props.formDef.content && props.formDef.content.items) {
    props.formDef.content.items.forEach((x: FieldDef) => {
      let node: ITreeNode = {
        id: x.field,
        code: x.field,
        label: x.title,
        nodeType: TreeNodeType.Field,
        data: x,
      };
      //TODO: 此处应该循环
      if (x.columns && x.columns.length > 0) {
        node.children = [];
        x.columns.forEach((y) => {
          let subNode: ITreeNode = {
            id: `${node.id}-${y.field}`,
            code: `${node.id}.${y.field}`,
            label: y.title,
            nodeType: TreeNodeType.Field,
            data: y,
          };

          node.children?.push(subNode);
        });
      }
      formFieldNodes.value.push(node);
    });
  }
};

const save = () => {
  let req: PrintTemplateRequest = {
    id: currentPrintDef.value.id,
    name: currentPrintDef.value.name,
    appId: currentPrintDef.value.appId,
    formId: currentPrintDef.value.formId,
    content: JSON.stringify(workbookApi.save()),
    printType: currentPrintDef.value.printType,
  };
  // console.log("print req", req);
  if (req.id)
    printTemplateService
      .put<PrintTemplate>(req.id, req)
      .then((res) => (currentPrintDef.value = res));
  else printTemplateService.post<PrintTemplate>(req).then((res) => (currentPrintDef.value = res));
};

const onStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.originalEvent.srcElement._underlying_vm_;
};

const initSheet = (data = {}) => {
  const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge(
        {},
        DesignZhCN,
        UIZhCN,
        DocsUIZhCN,
        SheetsZhCN,
        SheetsUIZhCN,
        SheetsFormulaUIZhCN,
        SheetsNumfmtUIZhCN
      ),
    },
  });

  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);

  univer.registerPlugin(UniverUIPlugin, {
    container: "univer-container",
  });

  univer.registerPlugin(UniverDocsPlugin);
  univer.registerPlugin(UniverDocsUIPlugin);

  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsUIPlugin, {
    menu: {
      "sheet.command.add-range-protection-from-toolbar": { hidden: true },
      "base-ui.operation.toggle-shortcut-panel": { hidden: true },
      "sheet.contextMenu.permission": { hidden: true },
      "formula-ui.operation.insert-function": { hidden: true },
      "formula-ui.operation.more-functions": { hidden: true },
    },
  });
  univer.registerPlugin(UniverSheetsFormulaPlugin);
  univer.registerPlugin(UniverSheetsFormulaUIPlugin);
  univer.registerPlugin(UniverSheetsNumfmtPlugin);
  univer.registerPlugin(UniverSheetsNumfmtUIPlugin);

  univerObj = univer;
  univerApi = FUniver.newAPI(univer);
  workbookApi = univerApi.createWorkbook(data);

  univerApi.addEvent(univerApi.Event.DragOver, (params: any) => {
    if (draggingNode.value) {
      params.dataTransfer.dropEffect = "move";
      const range: FRange = params.worksheet.getRange(params.row, params.column);
      if (range) params.worksheet.setActiveRange(range);
    }
  });
  univerApi.addEvent(univerApi.Event.Drop, (params: any) => {
    if (draggingNode.value) {
      const cell: FRange = params.worksheet.getRange(params.row, params.column);
      if (cell) {
        cell.setValue(draggingNode.value.label);
        //字段打印设置
        let printMeata: IPrintMetadata = {
          dataType: "field",
          id: draggingNode.value.code!,
          fieldType: draggingNode.value.data.type,
        };
        cell.setCustomMetaData(printMeata);
      }
      draggingNode.value = undefined;
    }
  });
};

onMounted(() => {
  let data = { id: "Sheet1", name: "Sheet1" };
  if (currentPrintDef.value.content) data = JSON.parse(currentPrintDef.value.content);

  initSheet(data);
  populateFields();
});
onBeforeUnmount(() => {
  univerObj?.dispose();
});
</script>
<style lang="scss" scoped>
.print-design-container {
  height: 100%;
  display: flex;

  .field-container {
    width: 300px;
    height: 100%;

    .field-panel {
      height: 100%;
    }
  }

  .univer-container {
    width: 100%;
    height: 100%;
  }
}

.drop-active {
  background-color: #f0f7ff;
  border: 2px dashed #409eff !important;
}
</style>
