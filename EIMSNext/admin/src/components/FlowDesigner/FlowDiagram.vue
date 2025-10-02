<template>
  <div class="flow-diagram bg-grid">
    <div style="transform: scale(1)">
      <StartNode :p-node-datas="flowData.nodes" :node-data="flowData.startNode" />
      <template v-for="node in flowData.nodes">
        <ApproveNode
          v-if="node.nodeType == FlowNodeType.Approve"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <CopyToNode
          v-if="node.nodeType == FlowNodeType.CopyTo"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <QueryOneNode
          v-if="node.nodeType == FlowNodeType.QueryOne"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <QueryManyNode
          v-if="node.nodeType == FlowNodeType.QueryMany"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <InsertNode
          v-if="node.nodeType == FlowNodeType.Insert"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <UpdateNode
          v-if="node.nodeType == FlowNodeType.Update"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <DeleteNode
          v-if="node.nodeType == FlowNodeType.Delete"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <PrintNode
          v-if="node.nodeType == FlowNodeType.Print"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <PluginNode
          v-if="node.nodeType == FlowNodeType.Plugin"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
        <BranchNode
          v-if="node.nodeType == FlowNodeType.Branch || node.nodeType == FlowNodeType.Branch2"
          :p-node-datas="flowData.nodes"
          :node-data="node"
        />
      </template>
      <EndNode :p-node-datas="flowData.nodes" :node-data="flowData.endNode" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import StartNode from "./StartNode.vue";
import EndNode from "./EndNode.vue";
import ApproveNode from "./ApproveNode.vue";
import CopyToNode from "./CopyToNode.vue";
import QueryOneNode from "./QueryOneNode.vue";
import QueryManyNode from "./QueryManyNode.vue";
import InsertNode from "./InsertNode.vue";
import UpdateNode from "./UpdateNode.vue";
import DeleteNode from "./DeleteNode.vue";
import PrintNode from "./PrintNode.vue";
import PluginNode from "./PluginNode.vue";
import BranchNode from "./BranchNode.vue";
import { FlowNodeType, IFlowData } from "./FlowData";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "FowDiagram",
});
const props = defineProps<{
  flowData: IFlowData;
}>();
</script>
<style lang="scss"></style>
