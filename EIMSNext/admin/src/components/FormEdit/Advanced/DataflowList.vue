<template>
  <EtConfirmDialog
    v-model="showDeleteConfirmDialog"
    title="你确定要删除所选数据吗？"
    :icon="MessageIcon.Warning"
    :showNoSave="false"
    okText="确定"
    @ok="execDelete"
  >
    <div>数据删除后将不可恢复</div>
  </EtConfirmDialog>
  <et-drawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="selectedFlow!.name" class="title-editor" />
    </template>
    <DataflowDesigner :appId="formDef.appId" :formId="formDef.id" :flow-def="selectedFlow!" />
  </et-drawer>
  <AdvanceLayout title="智能助手" desc="实现自动同步更新表单数据、执行插件等智能化操作">
    <div class="flow-container">
      <div class="panel-header">
        <div class="header-left">
          <el-button type="primary" icon="plus" @click="addNew(EventSourceType.Form)">
            新建智能助手
          </el-button>
        </div>
        <div class="header-right"></div>
      </div>
      <div>
        <el-space direction="vertical" class="flow-space">
          <template v-for="flow in dataflows">
            <et-card class="flow-card" :title="flow.name">
              <template #action>
                <div class="flow-header">
                  <el-button @click="edit(flow)">编辑</el-button>
                  <el-button @click="remove(flow)">删除</el-button>
                  <el-switch
                    :model-value="!flow.disabled"
                    @change="toggleDisable(flow)"
                  ></el-switch>
                </div>
              </template>
              <div class="flow-content">触发: {{ getTriggerSource(flow) }}</div>
            </et-card>
          </template>
        </el-space>
      </div>
    </div>
  </AdvanceLayout>
</template>
<script setup lang="ts">
import DataflowDesigner from "../../DataflowDesigner/index.vue";
import { FormDef, EventSourceType, WfDefinition, FlowType } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AdvanceLayout from "./AdvanceLayout.vue";
import { MessageIcon } from "@eimsnext/components";

defineOptions({
  name: "DataflowList",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDrawer = ref(false);
const showDeleteConfirmDialog = ref(false);
const dataflows = ref<WfDefinition[]>([]);
const selectedFlow = ref<WfDefinition>();

const loadDataflows = (formId: string) => {
  let query = buildQuery({ filter: { flowType: FlowType.Dataflow, sourceId: formId } });
  wfDefinitionService.query<WfDefinition>(query).then((res) => {
    dataflows.value = res;
  });

  // formStore.get(formId).then(form => { if (form) formNamesCache.add(formId, form.name) })
};

const getTriggerSource = (flow: WfDefinition) => {
  if (flow.eventSource == EventSourceType.Form) {
    return props.formDef.name;
  }

  return "定时触发";
};

const addNew = (eventSource: EventSourceType) => {
  selectedFlow.value = {
    id: "",
    appId: props.formDef.appId,
    name: "未命名助手",
    flowType: FlowType.Dataflow,
    externalId: "",
    version: 1,
    isCurrent: true,
    released: false,
    content: "",
    eventSource: eventSource,
    sourceId: props.formDef.id,
  };

  showDrawer.value = true;
};

const edit = (flow: WfDefinition) => {
  selectedFlow.value = flow;

  showDrawer.value = true;
};

const remove = (flow: WfDefinition) => {
  selectedFlow.value = flow;
  showDeleteConfirmDialog.value = true;
};
const execDelete = () => {
  wfDefinitionService.delete<WfDefinition>(selectedFlow.value!.id).then(() => {
    loadDataflows(props.formDef.id);
    showDeleteConfirmDialog.value = false;
  });
};
const toggleDisable = (flow: WfDefinition) => {
  wfDefinitionService
    .patch<WfDefinition>(flow.id, { id: flow.id, disabled: !flow.disabled })
    .then(() => {
      flow.disabled = !flow.disabled;
    });
};

function close() {
  showDrawer.value = false;

  loadDataflows(props.formDef.id);
}

onBeforeMount(() => {
  if (props.formDef) {
    loadDataflows(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.flow-container {
  display: flex;
  flex-direction: column;

  .panel-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--et-space-16);
  }

  .flow-space {
    width: 100%;
    align-items: normal !important;
  }

  .flow-card {
    width: 100%;

    .flow-header {
      display: flex;
      justify-content: space-between;

      .flow-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-button {
        margin: var(--et-space-0);
        border: none;
      }
    }

    .flow-content {
      display: flex;
      font-size: var(--et-font-size-13);
      padding: var(--et-space-10) var(--et-space-20);
    }
  }
}
</style>
