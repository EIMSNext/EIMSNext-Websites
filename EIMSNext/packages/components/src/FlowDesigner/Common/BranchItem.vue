<template>
  <div class="branch-item">
    <SvgLine />
    <div class="branch-item-panel">
      <div class="branch-item-condition" style="min-height: 40px" />
      <ConditionNode
        :branch-item-datas="pNodeDatas"
        :branch-item-data="nodeData"
        :p-node-datas="nodeData.childNodes!"
        :node-data="nodeData.conditionData!"
        :data-index="dataIndex"
      />
      <template v-for="item in nodeData.childNodes">
        <ApproveNode
          v-if="item.nodeType == FlowNodeType.Approve"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <CopyToNode
          v-if="item.nodeType == FlowNodeType.CopyTo"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />

        <QueryOneNode
          v-if="item.nodeType == FlowNodeType.QueryOne"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <QueryManyNode
          v-if="item.nodeType == FlowNodeType.QueryMany"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <InsertNode
          v-if="item.nodeType == FlowNodeType.Insert"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <UpdateNode
          v-if="item.nodeType == FlowNodeType.Update"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <DeleteNode
          v-if="item.nodeType == FlowNodeType.Delete"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <PrintNode
          v-if="item.nodeType == FlowNodeType.Print"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <PluginNode
          v-if="item.nodeType == FlowNodeType.Plugin"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <BranchNode
          v-if="item.nodeType == FlowNodeType.Branch || item.nodeType == FlowNodeType.Branch2"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ConditionNode from "./ConditionNode.vue";
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
import { FlowNodeType, IFlowNodeData } from "./FlowData";
import SvgLine from "./SvgLine.vue";

defineOptions({
  name: "BranchItem",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
  dataIndex: number;
}>();
</script>
