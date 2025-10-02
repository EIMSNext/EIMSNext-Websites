<template>
   <MetaItemHeader :label="t('目标表单')" :required="true"></MetaItemHeader> 
  <FormList v-model="formItem" :appId="appId" @change="formChanged"></FormList>
  <MetaItemHeader class="mt-[8px]" :label="t('设置字段数据')" :required="true"></MetaItemHeader> 
  <FormFieldList
    v-if="nodes.length > 0"
    v-model="formFieldList"
    :node-id="nodeId"
    :formId="formId"
    :nodes="nodes"
    :show-all="true"
    @change="fieldChanged"
  ></FormFieldList>
</template>
<script lang="ts" setup>
import { FlowNodeType, IFlowContext, IFlowNodeData, createFlowNode } from "../FlowData";
import { FormDef } from "@eimsnext/models";
import { useContextStore, useFormStore } from "@eimsnext/store";
import FormList from "../../FormList/index.vue";
import FormFieldList from "../components/FieldSetting/FormFieldList.vue";
import { useLocale } from "element-plus";
import { IFormItem } from "@/components/FormList/type";
import {
  IFormFieldItem,
  IFormFieldList,
  buildFormFieldList,
  mergeFieldList,
} from "../components/FieldSetting/type";
import { INodeForm } from "../components/NodeFieldList/type";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../components/MetaItemHeader/index.vue";

const { t } = useLocale();

defineOptions({
  name: "InsertNodeMeta",
});

const nodeId = ref("");
const formId = ref("");
const formFieldList = ref<IFormFieldList>({ items: [] });

const formStore = useFormStore();
// const formDef = ref<FormDef>();

const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));

const appId = ref(flowContext!.appId);
const formItem = ref<IFormItem>({ id: "" });
const nodes = ref<INodeForm[]>([]);

const formChanged = async (form: IFormItem) => {
  // console.log("formChanged", form);
  formId.value = form.id;
  formItem.value.id=formId.value;

  let formDef = await formStore.get(formId.value);
  if (formDef) formFieldList.value.items = mergeFieldList(formDef, [], true);

  activeData.value.metadata.insertMeta!.formId = form.id;
  activeData.value.metadata.insertMeta!.formFieldList = formFieldList.value;
};
const fieldChanged = (fields: IFormFieldList) => {
  // console.log("fieldChanged", fields);
  formFieldList.value = fields;

  activeData.value.metadata.insertMeta!.formFieldList = fields;
};

watch(
  flowContextRef,
  async (newValue: IFlowContext) => {
    // console.log("activeData", newValue.activeData);
    activeData.value = newValue.activeData;
    nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

    nodeId.value = activeData.value.id;    
    formId.value = activeData.value.metadata.insertMeta!.formId;
    formItem.value = { id: formId.value };

    let formDef = await formStore.get(formId.value);
    if (formDef)
      formFieldList.value.items = mergeFieldList(
        formDef,
        activeData.value.metadata.insertMeta!.formFieldList.items,
        true
      );

  },
  { immediate: true }
);
</script>
