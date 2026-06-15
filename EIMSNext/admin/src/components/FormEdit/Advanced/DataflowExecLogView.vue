<template>
  <div class="dataflow-exec-log-view">
    <div v-if="mode === 'list'" class="log-list-page">
      <div class="log-toolbar">
        <div class="toolbar-item">
          <span class="toolbar-label">触发时间</span>
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            value-format="x"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            clearable
          />
        </div>
        <div class="toolbar-item">
          <span class="toolbar-label">执行结果</span>
          <el-select v-model="successFilter" placeholder="请选择" clearable class="result-select">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </div>
        <el-button type="primary" @click="reloadRuns">筛选</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="runs"
        height="100%"
        row-key="id"
        class="log-table"
        @row-click="openRunDetail"
      >
        <el-table-column prop="triggerTime" label="触发时间" width="220">
          <template #default="{ row }">{{ formatDate(row.triggerTime) }}</template>
        </el-table-column>
        <el-table-column prop="triggerBy" label="触发人" width="180">
          <template #default="{ row }">{{ row.triggerBy?.label || "匿名用户" }}</template>
        </el-table-column>
        <el-table-column label="触发动作" min-width="180">
          <template #default="{ row }">{{ getTriggerLabel(row) }}</template>
        </el-table-column>
        <el-table-column label="执行结果" min-width="260">
          <template #default="{ row }">
            <div class="result-cell">
              <el-tag :type="row.success ? 'success' : 'danger'" effect="dark">
                {{ row.success ? "成功" : "失败" }}
              </el-tag>
              <span v-if="!row.success" class="result-error">{{ row.errMsg }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="log-pagination">
        <span>共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="pageIndex"
          v-model:page-size="pageSize"
          background
          layout="prev, pager, next, sizes"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @current-change="loadRuns"
          @size-change="reloadRuns"
        />
      </div>
    </div>

    <div v-else class="log-detail-page">
      <div class="detail-header">
        <el-button link icon="el-arrow-left" @click="backToList">返回日志列表</el-button>
        <div class="detail-title">
          <span>{{ flowDef.name }}</span>
          <span v-if="detail?.run.dataflowVersion" class="version">V{{ detail.run.dataflowVersion }}</span>
          <el-tag v-if="detail" :type="detail.run.success ? 'success' : 'danger'" effect="dark">
            {{ detail.run.success ? "成功" : "失败" }}
          </el-tag>
        </div>
      </div>

      <div v-loading="detailLoading" class="detail-body">
        <div class="diagram-panel">
          <DataflowDiagram :flow-data="flowData" />
        </div>
        <aside class="node-detail-panel">
          <template v-if="selectedNode">
            <div class="node-detail-title">
              <div>
                <span :class="['node-status-mark', selectedLog?.success === false ? 'failed' : 'success']"></span>
                <strong>{{ selectedNode.name }}</strong>
                <span class="node-type">{{ selectedLog?.nodeName && selectedLog.nodeName !== selectedNode.name ? selectedLog.nodeName : "" }}</span>
              </div>
              <el-button link type="primary" @click="viewNodeConfig">查看节点配置</el-button>
            </div>

            <el-button v-if="selectedLog && !selectedLog.success" type="primary" disabled class="retry-button">
              重试
            </el-button>

            <div class="detail-section">
              <div class="detail-label">执行时间</div>
              <div class="detail-value">{{ formatExecTime(selectedLog) }}</div>
            </div>

            <template v-if="selectedLog">
              <template v-if="selectedLog.success">
                <div class="detail-section">
                  <div class="detail-label">执行结果</div>
                  <div class="detail-value success-text">执行成功</div>
                </div>
              </template>
              <template v-else>
                <div class="detail-section">
                  <div class="detail-label">失败原因</div>
                  <div class="detail-value danger-text">{{ selectedLog.failureReason || selectedLog.errMsg || "执行失败" }}</div>
                </div>
                <div class="detail-section">
                  <div class="detail-label">修改建议</div>
                  <div class="detail-value">{{ selectedLog.troubleshootingSuggestion || "检查该节点配置及前置节点输出数据" }}</div>
                </div>
              </template>
            </template>
            <div v-else class="empty-node-log">该节点未执行</div>
          </template>
          <el-empty v-else description="请选择节点" />
        </aside>
      </div>

      <el-drawer v-model="showConfig" title="查看节点配置" direction="rtl" size="520px">
        <div class="config-readonly">
          <DataflowMetaEditor />
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DataflowDiagram,
  DataflowMetaEditor,
  FlowNodeType,
  IFlowContext,
  IFlowData,
  IFlowLogState,
  IFlowNodeData,
  createDataflowData,
  createFlowNode,
  getFlowNodeById,
} from "@eimsnext/components";
import { DfExecLog, DfRunLog, DfRunLogDetail, EventSourceType, FlowType, FormDef, WfDefinition } from "@eimsnext/models";
import { dfExecLogService } from "@eimsnext/services";
import { dateFormat } from "@/utils/common";
import { useLocale } from "element-plus";

defineOptions({
  name: "DataflowExecLogView",
});

const props = defineProps<{
  formDef: FormDef;
  flowDef: WfDefinition;
}>();

const { t } = useLocale();
const mode = ref<"list" | "detail">("list");
const loading = ref(false);
const detailLoading = ref(false);
const runs = ref<DfRunLog[]>([]);
const total = ref(0);
const pageIndex = ref(1);
const pageSize = ref(10);
const timeRange = ref<string[]>();
const successFilter = ref<"" | "success" | "failed">("");
const detail = ref<DfRunLogDetail>();
const selectedNode = ref<IFlowNodeData>();
const selectedLog = ref<DfExecLog>();
const showConfig = ref(false);

const flowData = ref<IFlowData>(createFlowData());
const logState = reactive<IFlowLogState>({
  executedNodeIds: new Set<string>(),
  failedNodeIds: new Set<string>(),
  isNodeExecuted,
  isLineExecuted,
  isBranchExecuted,
  onNodeClick: selectNode,
});
const flowContext = reactive<IFlowContext>({
  definitionId: props.flowDef.id,
  appId: props.formDef.appId,
  formId: props.formDef.id,
  eventSource: props.flowDef.eventSource,
  sourceId: props.flowDef.sourceId,
  flowType: FlowType.Dataflow,
  clonedData: createFlowNode(FlowNodeType.None, t),
  activeData: flowData.value.startNode,
  flowData: flowData.value,
  structureReadonly: true,
  logState,
});

provide("flowContext", flowContext);

const nodeLogMap = computed(() => {
  const map = new Map<string, DfExecLog>();
  detail.value?.nodes.forEach((item) => {
    if (item.nodeId) map.set(item.nodeId, item);
  });
  return map;
});

function createFlowData() {
  if (props.flowDef.content) {
    return JSON.parse(props.flowDef.content) as IFlowData;
  }

  const data = createDataflowData(props.flowDef.eventSource ?? EventSourceType.Form, t);
  data.startNode.metadata.triggerMeta!.formId = props.formDef.id;
  return data;
}

function syncFlowContext() {
  flowData.value = createFlowData();
  flowContext.flowData = flowData.value;
  flowContext.eventSource = props.flowDef.eventSource;
  flowContext.sourceId = props.flowDef.sourceId;
  flowContext.activeData = flowData.value.startNode;
}

async function loadRuns() {
  loading.value = true;
  try {
    const [startTime, endTime] = timeRange.value ?? [];
    const result = await dfExecLogService.queryRuns({
      dataflowId: props.flowDef.id,
      startTime: startTime ? Number(startTime) : undefined,
      endTime: endTime ? Number(endTime) : undefined,
      success: successFilter.value ? successFilter.value === "success" : undefined,
      skip: (pageIndex.value - 1) * pageSize.value,
      top: pageSize.value,
    });
    runs.value = result.items;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function reloadRuns() {
  pageIndex.value = 1;
  loadRuns();
}

async function openRunDetail(run: DfRunLog) {
  mode.value = "detail";
  detailLoading.value = true;
  selectedNode.value = undefined;
  selectedLog.value = undefined;
  try {
    detail.value = await dfExecLogService.getRunDetail(run.id);
    logState.executedNodeIds = new Set(detail.value.executedNodeIds);
    logState.failedNodeIds = new Set(detail.value.failedNodeIds);
    syncFlowContext();
    selectNode(flowData.value.startNode);
  } finally {
    detailLoading.value = false;
  }
}

function backToList() {
  mode.value = "list";
  detail.value = undefined;
  logState.executedNodeIds = new Set<string>();
  logState.failedNodeIds = new Set<string>();
  selectedNode.value = undefined;
  selectedLog.value = undefined;
}

function selectNode(node: IFlowNodeData) {
  selectedNode.value = node;
  selectedLog.value = nodeLogMap.value.get(node.id);
  flowContext.activeData = node;
}

function viewNodeConfig() {
  if (!selectedNode.value) return;
  flowContext.activeData = selectedNode.value;
  showConfig.value = true;
}

function formatDate(value?: number) {
  return value ? dateFormat(value, "YYYY-MM-DD HH:mm:ss") : "-";
}

function formatExecTime(log?: DfExecLog) {
  if (!log) return "-";
  if (log.startTime && log.endTime && log.startTime !== log.endTime) {
    return `${formatDate(log.startTime)} ~ ${formatDate(log.endTime)}`;
  }

  return formatDate(log.startTime || log.execTime);
}

function getTriggerLabel(run: DfRunLog) {
  const source = `${run.eventSource}`;
  if (source === `${EventSourceType.Http}` || source === "4") return "HTTP触发";
  if (source === `${EventSourceType.Schedule}` || source === "3") return "定时触发";
  return "数据推送触发";
}

function isNodeExecuted(node: IFlowNodeData): boolean {
  if (logState.executedNodeIds.has(node.id) || logState.failedNodeIds.has(node.id)) return true;
  if (node.nodeType === FlowNodeType.Branch || node.nodeType === FlowNodeType.Branch2) {
    return node.childNodes?.some(isBranchExecuted) ?? false;
  }
  if (node.nodeType === FlowNodeType.BranchItem) return isBranchExecuted(node);
  return node.childNodes?.some(isNodeExecuted) ?? false;
}

function isLineExecuted(node: IFlowNodeData, branchItemData?: IFlowNodeData): boolean {
  if (branchItemData) return isBranchExecuted(branchItemData);
  if (node.nodeType === FlowNodeType.Branch || node.nodeType === FlowNodeType.Branch2) {
    return node.childNodes?.some(isBranchExecuted) ?? false;
  }

  const nextNode = node.nextId ? getFlowNodeById(flowData.value, node.nextId) : undefined;
  return nextNode ? isNodeExecuted(nextNode) : false;
}

function isBranchExecuted(branchItemData: IFlowNodeData): boolean {
  return branchItemData.childNodes?.some(isNodeExecuted) ?? false;
}

onBeforeMount(loadRuns);
</script>

<style lang="scss" scoped>
.dataflow-exec-log-view {
  height: 100%;
  min-height: 0;
  background: var(--et-bg-page);
}

.log-list-page,
.log-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.log-toolbar {
  display: flex;
  gap: var(--et-space-24);
  align-items: center;
  padding: var(--et-space-20);
  background: var(--et-bg-container);
  border-bottom: 1px solid var(--et-border-color);
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
}

.toolbar-label {
  font-weight: 600;
  color: var(--et-text-primary);
}

.result-select {
  width: var(--et-size-180);
}

.log-table {
  flex: 1;
}

.result-cell {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
}

.result-error {
  color: var(--et-color-danger);
}

.log-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--et-space-16);
  padding: var(--et-space-8) var(--et-space-20);
  background: var(--et-bg-container);
  border-top: 1px solid var(--et-border-color);
}

.detail-header {
  height: var(--et-size-48);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--et-space-20);
  background: var(--et-bg-container);
  border-bottom: 1px solid var(--et-border-color);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  font-weight: 600;
}

.version {
  color: var(--et-color-primary);
  font-weight: 400;
}

.detail-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.diagram-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.node-detail-panel {
  width: 420px;
  background: var(--et-bg-container);
  border-left: 1px solid var(--et-border-color);
  padding: var(--et-space-16) var(--et-space-20);
  overflow: auto;
}

.node-detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--et-space-12);
  border-bottom: 1px solid var(--et-border-color);
}

.node-status-mark {
  display: inline-block;
  width: var(--et-size-10);
  height: var(--et-size-10);
  border-radius: var(--et-radius-round);
  margin-right: var(--et-space-8);
  background: var(--et-color-success);

  &.failed {
    background: var(--et-color-danger);
  }
}

.node-type {
  margin-left: var(--et-space-4);
  color: var(--et-text-tertiary);
}

.retry-button {
  margin: var(--et-space-16) 0 0;
}

.detail-section {
  padding: var(--et-space-16) 0;
  border-bottom: 1px solid var(--et-border-color);
}

.detail-label {
  font-weight: 600;
  color: var(--et-text-primary);
  margin-bottom: var(--et-space-8);
}

.detail-value {
  color: var(--et-text-secondary);
  line-height: var(--et-line-height-24);
  word-break: break-word;
}

.success-text {
  color: var(--et-color-success);
}

.danger-text {
  color: var(--et-color-danger);
}

.empty-node-log {
  margin-top: var(--et-space-20);
  color: var(--et-text-tertiary);
}

.config-readonly {
  pointer-events: none;
}
</style>
