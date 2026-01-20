<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('dataflow.targetForm')" :required="true"></MetaItemHeader>
    <FormList v-model="formItem" :appId="appId" @change="formChanged"></FormList>
    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.queryCondition')" :required="true"></MetaItemHeader>
    <ConditionList v-model="condList" :formId="formId" :nodeId="nodeId" :nodes="nodes" @change="onCondition">
    </ConditionList>
    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.sortRule')"></MetaItemHeader>
    <FieldSortList v-model="sortList" :form-id="formId" @change="onSort"></FieldSortList>
    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.numberOfTake')" :required="true"></MetaItemHeader>
    <div>
      <el-input-number v-model="activeData.metadata.queryManyMeta!.take"></el-input-number>
      {{ t("dataflow.records") }}
    </div>
  </template></template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
} from "../Common/FlowData";
import { uniqueId } from "@eimsnext/utils";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";

import { useLocale } from "element-plus";
import { IConditionList } from "@/ConditionList/type";
import { IFieldSortList } from "@/FieldSortList/type";
import { IFormItem } from "@/FormSelect/type";
import { INodeForm } from "@/NodeFieldList/type";
const { t } = useLocale();

defineOptions({
  name: "QueryManyNodeMeta",
});

const ready = ref(false)
const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const sortList = ref<IFieldSortList>({ items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));

const appId = ref(flowContext!.appId);
const nodeId = ref("");
const formId = ref("");
const formItem = ref<IFormItem>({ id: "" });
const nodes = ref<INodeForm[]>([]);

const formChanged = async (form: IFormItem) => {
  // console.log("formChanged", form);
  formId.value = form.id;
  formItem.value.id = formId.value;

  condList.value.items = []
  sortList.value.items = []

  activeData.value.metadata.queryManyMeta!.formId = form.id;
  activeData.value.metadata.queryManyMeta!.condition = condList.value;
  activeData.value.metadata.queryManyMeta!.sort = sortList.value;
};

const onCondition = (list: IConditionList) => {
  activeData.value.metadata.queryManyMeta!.condition = list;
};
const onSort = (list: IFieldSortList) => {
  activeData.value.metadata.queryManyMeta!.sort = list;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

    nodeId.value = activeData.value.id;
    formId.value = activeData.value.metadata.queryManyMeta!.formId;
    formItem.value = { id: formId.value };

    // console.log("query one cond nodes", newValue, nodes.value);

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    if (activeData.value.metadata.queryManyMeta!.condition) {
      condList.value = activeData.value.metadata.queryManyMeta!.condition;
    }
    sortList.value = { items: [] };
    if (activeData.value.metadata.queryManyMeta!.sort) {
      sortList.value = activeData.value.metadata.queryManyMeta!.sort;
    }

    ready.value = true
  })
}

init()

// watch(
//   flowContextRef,
//   async (newValue: IFlowContext) => {
//     activeData.value = newValue.activeData;
//     nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

//     nodeId.value = activeData.value.id;
//     formId.value = activeData.value.metadata.queryManyMeta!.formId;
//     formItem.value = { id: formId.value };

//     // console.log("query one cond nodes", newValue, nodes.value);

//     condList.value = { id: uniqueId(), rel: "and", items: [] };
//     if (activeData.value.metadata.queryManyMeta!.condition) {
//       condList.value = activeData.value.metadata.queryManyMeta!.condition;
//     }
//     sortList.value = { items: [] };
//     if (activeData.value.metadata.queryManyMeta!.sort) {
//       sortList.value = activeData.value.metadata.queryManyMeta!.sort;
//     }
//   },
//   { immediate: true }
// );
</script>
