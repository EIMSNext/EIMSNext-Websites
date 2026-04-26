<template>
  <div class="flow-designer">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-dropdown trigger="click">
          <el-button>
            流程版本（V{{ currentWfDef.version }}）
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in versions"
                :key="item.id || `draft-${item.version}`"
                @click="selectVersion(item)"
              >
                <div class="wf-version-item">
                  <span>流程版本(V{{ item.version }})</span>
                  <el-tag v-if="item.isCurrent" size="small" type="success">启用中</el-tag>
                  <el-tag v-else-if="!item.released" size="small" type="warning">设计中</el-tag>
                  <el-tag v-else size="small" type="info">历史</el-tag>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided @click="createVersion">添加新版本</el-dropdown-item>
              <el-dropdown-item @click="showVersionDialog = true">管理已有版本</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button>预览</el-button>
        <el-button @click="save">保存</el-button>
        <el-button type="success" @click="activateCurrentVersion">启用</el-button>
      </div>
    </div>
    <div class="flow-editor-wrapper">
      <div class="flow-editor">
        <!-- <div class="flow-toolbar">帮助</div> -->
        <WorkflowDiagram :flow-data="flowData" />
      </div>
      <div class="flow-meta-container">
        <WorkflowMetaEditor v-if="ready" />
      </div>
    </div>

    <et-dialog
      :modelValue="showVersionDialog"
      class="version-manage-dialog"
      title="管理已有版本"
      width="760px"
      :showNoSave="false"
      :showCancel="false"
      okText="关闭"
      @cancel="showVersionDialog = false"
      @ok="showVersionDialog = false"
    >
      <div class="version-dialog-body">
        <div
          v-for="item in versions"
          :key="item.id"
          class="version-row"
        >
          <div class="version-row-main">
            <div class="version-row-title">
              <span class="version-name">流程版本(V{{ item.version }})</span>
              <el-tag v-if="item.isCurrent" size="small" effect="plain" type="success">启用中</el-tag>
              <el-tag v-else-if="!item.released" size="small" effect="plain" type="warning">设计中</el-tag>
              <el-tag v-else size="small" effect="plain" type="info">历史</el-tag>
            </div>
            <div class="version-row-meta">
              <span v-if="item.updateTime">最近更新：{{ formatTime(item.updateTime) }}</span>
            </div>
          </div>
          <div class="version-row-actions">
            <el-button v-if="!item.isCurrent" link type="primary" @click="activateVersion(item)">启用流程</el-button>
            <el-button link type="primary" @click="selectVersion(item, true)">编辑</el-button>
            <el-button
              v-if="!item.released && !item.isCurrent"
              link
              type="danger"
              @click="deleteVersion(item)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </et-dialog>
  </div>
</template>
<script lang="ts" setup>
import {
  ConfirmResult,
  EtConfirm,
  FlowNodeType,
  IFlowContext,
  IFlowData,
  MessageIcon,
  createFlowNode,
  createWorkflowData,
} from "@eimsnext/components";
import { EventSourceType, FlowType, WfDefinition, WfDefinitionRequest } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { useLocale } from "element-plus";
const { t } = useLocale();

const formatTime = (value?: number) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

defineOptions({
  name: "WorkflowDesigner",
});
const props = defineProps<{
  appId: string;
  formId: string;
}>();

const ready = ref(false);
const oldFlowDataStr = ref("");
const showVersionDialog = ref(false);
const versions = ref<WfDefinition[]>([]);

const createDraftDefinition = (): WfDefinition => ({
  id: "",
  appId: props.appId,
  name: "",
  flowType: FlowType.Workflow,
  externalId: props.formId,
  version: 1,
  isCurrent: false,
  released: false,
  content: JSON.stringify(createWorkflowData(t)),
  eventSource: EventSourceType.None,
  sourceId: props.formId,
});

const currentWfDef = ref<WfDefinition>({
  ...createDraftDefinition(),
});

const flowData = ref<IFlowData>(createWorkflowData(t));
const flowContext: IFlowContext = {
  appId: props.appId,
  formId: props.formId,
  flowType: FlowType.Workflow,
  clonedData: createFlowNode(FlowNodeType.None, t),
  activeData: flowData.value.startNode,
  flowData: flowData.value,
  structureReadonly: false,
};
provide("flowContext", flowContext);

const applyDefinition = (definition: WfDefinition) => {
  currentWfDef.value = definition;
  flowData.value = definition.content
    ? JSON.parse(definition.content)
    : createWorkflowData(t);
  flowContext.flowData = flowData.value;
  flowContext.activeData = flowData.value.startNode;
  flowContext.structureReadonly = !!definition.released;
  oldFlowDataStr.value = JSON.stringify(flowData.value);
};

const loadVersions = async () => {
  const query = buildQuery({
    filter: { ExternalId: props.formId },
    orderBy: "Version desc",
  });
  const res = await wfDefinitionService.query<WfDefinition>(query);
  versions.value = res;

  if (res.length === 0) {
    applyDefinition(createDraftDefinition());
    return;
  }

  const selected =
    res.find((x) => x.id === currentWfDef.value.id) ??
    res.find((x) => x.isCurrent) ??
    res[0];
  applyDefinition(selected);
};

onBeforeMount(async () => {
  await loadVersions();
  ready.value = true;
});

const save = async () => {
  const req: WfDefinitionRequest = {
    id: currentWfDef.value.id,
    appId: currentWfDef.value.appId,
    name: currentWfDef.value.name,
    flowType: FlowType.Workflow,
    externalId: currentWfDef.value.externalId,
    content: JSON.stringify(flowData.value),
    eventSource: EventSourceType.None,
    sourceId: currentWfDef.value.sourceId,
    disabled: currentWfDef.value.disabled,
  };

  const res = req.id
    ? await wfDefinitionService.put<WfDefinition>(req.id, req)
    : await wfDefinitionService.post<WfDefinition>(req);

  currentWfDef.value = res;
  currentWfDef.value.content = req.content!;
  flowContext.structureReadonly = !!res.released;
  oldFlowDataStr.value = JSON.stringify(flowData.value);
  await loadVersions();
  ElMessage.success("保存成功");
  return res;
};

const confirmUnsavedChange = async () => {
  if (!isDirty()) return true;

  const confirm = await EtConfirm.showDialog(
    "你修改了流程设定但没有保存，是否需要先保存当前版本？",
    {
      title: "流程设定有修改，是否保存？",
      icon: MessageIcon.Question,
      showCancel: true,
      showNoSave: true,
      okText: "保存并继续",
    },
    t,
  );

  if (confirm === ConfirmResult.Yes) {
    await save();
  }

  return confirm !== ConfirmResult.Cancel;
};

const selectVersion = async (definition: WfDefinition, closeDialog = false) => {
  const canContinue = await confirmUnsavedChange();
  if (!canContinue) return;

  applyDefinition(definition);
  if (closeDialog) {
    showVersionDialog.value = false;
  }
};

const createVersion = async () => {
  if (!currentWfDef.value.id) {
    await save();
  } else if (isDirty()) {
    await save();
  }

  const created = await wfDefinitionService.createVersion(currentWfDef.value.id);
  await loadVersions();
  const target = versions.value.find((x) => x.id === created.id);
  if (target) {
    applyDefinition(target);
  }
  showVersionDialog.value = false;
  ElMessage.success("已创建新版本");
};

const activateVersion = async (definition: WfDefinition) => {
  if (currentWfDef.value.id !== definition.id) {
    const canContinue = await confirmUnsavedChange();
    if (!canContinue) return;
    applyDefinition(definition);
  }

  if (isDirty() || !currentWfDef.value.id) {
    await save();
  }

  const activated = await wfDefinitionService.activate(currentWfDef.value.id);
  await loadVersions();
  const target = versions.value.find((x) => x.id === activated.id);
  if (target) {
    applyDefinition(target);
  }
  ElMessage.success("启用成功");
};

const activateCurrentVersion = async () => {
  await activateVersion(currentWfDef.value);
};

const deleteVersion = async (definition: WfDefinition) => {
  const canContinue = await confirmUnsavedChange();
  if (!canContinue) return;

  await wfDefinitionService.delete(definition.id);
  await loadVersions();
  const current = versions.value.find((x) => x.isCurrent) ?? versions.value[0];
  if (current) {
    applyDefinition(current);
  } else {
    applyDefinition(createDraftDefinition());
  }
  ElMessage.success("删除成功");
};

const isDirty = () => {
  const curFlowDataStr = JSON.stringify(flowData.value);
  return oldFlowDataStr.value !== curFlowDataStr;
};

defineExpose({
  save,
  isDirty,
});
</script>
<style lang="scss">
.wf-version-item {
  width: 220px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-8);
}

.version-dialog-body {
  margin: var(--et-space-20);
  max-height: 500px;
  overflow: auto;
  padding-right: var(--et-space-6);
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--et-space-18) var(--et-space-16);
  border-radius: var(--et-space-8);
  background: var(--et-bg-secondary-container);
  border: 1px solid var(--et-border-color-light);
}

.version-row + .version-row {
  margin-top: var(--et-space-12);
}

.version-row-main,
.version-row-title,
.version-row-actions {
  display: flex;
  align-items: center;
  gap: var(--et-space-10);
}

.version-row-main {
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--et-space-6);
}

.version-name {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-16);
  font-weight: 600;
}

.version-row-meta {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  line-height: var(--et-line-height-20);
}

.version-row-actions {
  flex-shrink: 0;
  gap: var(--et-space-16);
}

@media (max-width: 900px) {
  .version-row {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--et-space-14);
  }

  .version-row-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--et-space-12);
  }
}

:deep(.version-manage-dialog .el-dialog__header) {
  padding: var(--et-space-20) var(--et-space-24) var(--et-space-16);
  border-bottom: 1px solid var(--et-border-color-light);
}

:deep(.version-manage-dialog .el-dialog__body) {
  padding: 0;
}

:deep(.version-manage-dialog .el-dialog__footer) {
  padding: var(--et-space-8) var(--et-space-24) var(--et-space-20);
}
</style>
