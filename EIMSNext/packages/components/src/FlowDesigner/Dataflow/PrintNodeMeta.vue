<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('dataflow.printObject')" :required="true" />
    <el-select
      v-model="sourceNodeId"
      class="full-width-input"
      :placeholder="t('dataflow.selectPrintObject')"
      :disabled="sourceOptions.length === 0"
      @change="sourceChanged"
    >
      <el-option
        v-for="item in sourceOptions"
        :key="item.nodeId"
        :label="item.nodeName"
        :value="item.nodeId"
      />
    </el-select>
    <div v-if="sourceOptions.length === 0" class="print-empty-text">
      {{ t('dataflow.noPrintObject') }}
    </div>

    <div class="print-template-header">
      <MetaItemHeader :label="t('dataflow.printTemplate')" :required="true" />
      <span v-if="selectedSource" class="print-source">
        {{ t('dataflow.printTemplateSource', { name: selectedSource.nodeName }) }}
        <el-link type="primary" :underline="false" @click="openPrintTemplates">
          {{ t('dataflow.printTemplateLink') }}
        </el-link>
      </span>
    </div>
    <el-select
      v-model="printDefId"
      class="full-width-input"
      :placeholder="t('dataflow.selectPrintTemplate')"
      :disabled="!formId || loadingTemplates"
      :loading="loadingTemplates"
      @change="templateChanged"
    >
      <el-option
        v-for="item in templates"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
    <div v-if="formId && !loadingTemplates && templates.length === 0" class="print-empty-text">
      {{ t('dataflow.noPrintTemplate') }}
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref } from "vue";
import { useLocale } from "element-plus";
import buildQuery from "odata-query";
import { printDefService } from "@eimsnext/services";
import { PrintDef } from "@eimsnext/models";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
} from "../Common/FlowData";
import { getPrevNodes } from "./type";
import { INodeForm } from "@/NodeFieldList/type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";

const { t } = useLocale();

defineOptions({ name: "PrintNodeMeta" });

const flowContext = inject<IFlowContext>("flowContext")!;
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const ready = ref(false);
const nodes = ref<INodeForm[]>([]);
const templates = ref<PrintDef[]>([]);
const sourceNodeId = ref("");
const formId = ref("");
const printDefId = ref("");
const loadingTemplates = ref(false);

const sourceOptions = computed(() => nodes.value.filter((node) => {
  const source = findNode(node.nodeId);
  return source?.nodeType !== FlowNodeType.Print
    && source?.nodeType !== FlowNodeType.Plugin
    && !!node.form?.id;
}));

const selectedSource = computed(() => sourceOptions.value.find((item) => item.nodeId === sourceNodeId.value));

function findNode(id: string): IFlowNodeData | undefined {
  const walk = (items: IFlowNodeData[]): IFlowNodeData | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      const nested = item.childNodes ? walk(item.childNodes) : undefined;
      if (nested) return nested;
    }
    return undefined;
  };

  if (flowContext.flowData.startNode.id === id) return flowContext.flowData.startNode;
  return walk(flowContext.flowData.nodes);
}

async function loadTemplates() {
  templates.value = [];
  if (!formId.value) return;

  loadingTemplates.value = true;
  try {
    templates.value = await printDefService.query<PrintDef>(buildQuery({ filter: { formId: formId.value } }));
  } finally {
    loadingTemplates.value = false;
  }
}

async function sourceChanged(nodeId: string) {
  const source = sourceOptions.value.find((item) => item.nodeId === nodeId);
  formId.value = source?.form?.id || "";
  printDefId.value = "";
  activeData.value.metadata.printMeta!.sourceNodeId = nodeId;
  activeData.value.metadata.printMeta!.formId = formId.value;
  activeData.value.metadata.printMeta!.printDefId = "";
  await loadTemplates();
}

function templateChanged(id: string) {
  activeData.value.metadata.printMeta!.printDefId = id;
}

function openPrintTemplates() {
  // The dataflow editor is opened from app administration; keep the action
  // non-destructive and expose the existing template manager as a new tab.
  if (formId.value) {
    window.open(`/app/${flowContext.appId}/form/${formId.value}?mode=editform&tab=ext-print`, "_blank");
  }
}

async function init() {
  await nextTick();
  activeData.value = flowContext.activeData;
  nodes.value = await getPrevNodes(flowContext.flowData, activeData.value);

  const meta = activeData.value.metadata.printMeta!;
  sourceNodeId.value = meta.sourceNodeId || "";
  formId.value = meta.formId || "";
  printDefId.value = meta.printDefId || "";

  if (!sourceOptions.value.some((item) => item.nodeId === sourceNodeId.value)) {
    sourceNodeId.value = "";
    formId.value = "";
    printDefId.value = "";
    meta.sourceNodeId = "";
    meta.formId = "";
    meta.printDefId = "";
  }

  await loadTemplates();
  ready.value = true;
}

init();
</script>

<style scoped>
.full-width-input {
  width: 100%;
}

.print-template-header {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin-top: var(--et-space-8);
}

.print-source {
  color: var(--el-text-color-secondary);
  font-size: var(--el-font-size-small);
  margin-bottom: var(--et-space-8);
}

.print-source .el-link {
  margin-left: var(--et-space-4);
}

.print-empty-text {
  color: var(--el-text-color-secondary);
  font-size: var(--el-font-size-small);
  margin-top: var(--et-space-4);
}
</style>
