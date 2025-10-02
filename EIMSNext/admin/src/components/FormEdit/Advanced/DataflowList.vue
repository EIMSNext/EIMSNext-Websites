<template>
  <div class="flow-container">
    <div><el-button @click="addNew(EventSourceType.Form)">Add</el-button></div>
    <el-space direction="vertical" class="flow-space">
      <template v-for="flow in dataflows">
        <et-card class="flow-card">
          <template #header>
            <div class="flex-y-center">
              <div class="flow-header">
                <div class="flow-name" :title="flow.name">
                  <span>{{ flow.name }}</span>
                </div>
                <div style="margin-left: 50px">
                  <el-button @click="edit(flow)">编辑</el-button>
                </div>
              </div>
            </div>
          </template>
          <div class="flow-content">触发: {{ flow.eventSource }}</div>
        </et-card>
      </template>
    </el-space>
  </div>
  <CustomDrawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="selectedFlow!.name" class="title-editor" />
    </template>

    <DataflowDesigner :appId="formDef.appId" :formId="formDef.id" :flow-def="selectedFlow!" />
  </CustomDrawer>
</template>
<script setup lang="ts">
import { createDataflowData } from "@/components/FlowDesigner/FlowData";
import DataflowDesigner from "../../FlowDesigner/Dataflow/index.vue";
import { FormDef, EventSourceType, WfDefinition, FlowType } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import CustomDrawer from "@/components/CustomDrawer/index.vue";
import buildQuery from "odata-query";

defineOptions({
  name: "DataflowList",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDrawer = ref(false);

const dataflows = ref<WfDefinition[]>([]);
const selectedFlow = ref<WfDefinition>();

// console.log("formid", props.formId);

const loadDataflows = (formId: string) => {
  let query = buildQuery({ filter: { flowType: FlowType.Dataflow, sourceId: formId } });
  wfDefinitionService.query<WfDefinition>(query).then((res) => {
    dataflows.value = res;
  });
};

const addNew = (eventSource: EventSourceType) => {
  selectedFlow.value = {
    id: "",
    name: "未命名助手",
    flowType: FlowType.Dataflow,
    externalId: "",
    version: 1,
    isCurrent: true,
    content: "",
    eventSource: eventSource,
    sourceId: props.formDef.id,
  };

  showDrawer.value = true;
};

const edit = (flow: WfDefinition) => {
  // console.log("edit df", flow);
  selectedFlow.value = flow;

  showDrawer.value = true;
};

// const emit = defineEmits(["close"]);

function close() {
  showDrawer.value = false;

  loadDataflows(props.formDef.id);
  // emit("close");
}

onBeforeMount(() => {
  //初始化
  if (props.formDef) {
    loadDataflows(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.flow-container {
  padding: 20px;
  display: flex;
  .flow-space {
    width: 100%;
    align-items: normal !important;
  }

  .flow-card {
    width: 100%;

    .flow-header {
      display: flex;

      .flow-name {
        font-size: 15px;
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .flow-content {
      display: flex;
      font-size: 13px;
      padding: 10px 20px;
    }
  }
}
</style>
