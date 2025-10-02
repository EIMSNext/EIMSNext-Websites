<template>
  <MetaItemHeader :label="t('目标表单')" :required="true"></MetaItemHeader>
  <FormList v-model="formItem" :appId="appId" @change="formChanged"></FormList>
  <MetaItemHeader class="mt-[8px]" :label="t('查询条件')" :required="true"></MetaItemHeader>
  <ConditionList
    v-model="condList"
    :formId="formId"
    :nodeId="nodeId"
    :nodes="nodes"
    @change="onCondition"
  ></ConditionList>
  <MetaItemHeader class="mt-[8px]" :label="t('排序规则')"></MetaItemHeader>
  <FieldSortList v-model="sortList" :form-id="formId" @change="onSort"></FieldSortList>
</template>
<script lang="ts" setup>
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  IFlowNodeMetaData,
  createFlowNode,
} from "../FlowData";
import { useLocale } from "element-plus";
import FormList from "../../FormList/index.vue";
import { IConditionList } from "../../ConditionList/type";
import ConditionList from "../../ConditionList/index.vue";
import { uniqueId } from "@eimsnext/utils";
import { INodeForm } from "../components/NodeFieldList/type";
import { getPrevNodes } from "./type";
import { IFormItem } from "@/components/FormList/type";
import FieldSortList from "../../FieldSortList/index.vue";
import { IFieldSortList } from "@/components/FieldSortList/type";
import MetaItemHeader from "../components/MetaItemHeader/index.vue";
const { t } = useLocale();

defineOptions({
  name: "QueryOneNodeMeta",
});

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const sortList = ref<IFieldSortList>({ items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));

const appId = ref(flowContext!.appId);
const nodeId = ref("");
const formId = ref("");
const formItem = ref<IFormItem>({ id: "" });
const nodes = ref<INodeForm[]>([]);

const formChanged = async (form: IFormItem) => {
  // console.log("formChanged", form);
  formId.value = form.id;
  formItem.value.id = formId.value;

  activeData.value.metadata.queryOneMeta!.formId = form.id;
  activeData.value.metadata.queryOneMeta!.condition = { id: uniqueId(), rel: "and", items: [] };
  activeData.value.metadata.queryOneMeta!.sort = { items: [] };
};

const onCondition = (list: IConditionList) => {
  activeData.value.metadata.queryOneMeta!.condition = list;
};
const onSort = (list: IFieldSortList) => {
  activeData.value.metadata.queryOneMeta!.sort = list;
};
watch(
  flowContextRef,
  async (newValue: IFlowContext) => {
    activeData.value = newValue.activeData;
    nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

    nodeId.value = activeData.value.id;
    formId.value = activeData.value.metadata.queryOneMeta!.formId;
    formItem.value = { id: formId.value };

    // console.log("query one cond nodes", newValue, nodes.value);

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    if (activeData.value.metadata.queryOneMeta!.condition) {
      condList.value = activeData.value.metadata.queryOneMeta!.condition;
    }
    sortList.value = { items: [] };
    if (activeData.value.metadata.queryOneMeta!.sort) {
      sortList.value = activeData.value.metadata.queryOneMeta!.sort;
    }
  },
  { immediate: true }
);
</script>
