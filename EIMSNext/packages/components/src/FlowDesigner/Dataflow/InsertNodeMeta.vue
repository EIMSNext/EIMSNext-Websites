<template>
  <template v-if="ready">
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
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import { FlowNodeType, IFlowContext, IFlowNodeData, createFlowNode } from "../Common/FlowData";
import { FormDef } from "@eimsnext/models";
import { useContextStore, useFormStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { IFormFieldList, mergeFieldList } from "@/FormFieldList/type";
import { IFormItem } from "@/FormList/type";
import { INodeForm } from "@/NodeFieldList/type";

const { t } = useLocale();

defineOptions({
  name: "InsertNodeMeta",
});

const ready = ref(false);
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
  formItem.value.id = formId.value;

  let formDef = await formStore.get(formId.value);
  if (formDef) formFieldList.value.items = mergeFieldList(formDef, [], true);

  activeData.value.metadata.insertMeta!.formId = form.id;
  activeData.value.metadata.insertMeta!.formFieldList = formFieldList.value;
};
const fieldChanged = (fields: IFormFieldList) => {
  // console.log("fieldChanged", fields);
  // formFieldList.value.items = fields.items;

  activeData.value.metadata.insertMeta!.formFieldList = fields;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

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

    ready.value = true;
  });
};

init();

// watch(
//   flowContextRef,
//   async (newValue: IFlowContext) => {
//     // console.log("activeData", newValue.activeData);
//     activeData.value = newValue.activeData;
//     nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

//     nodeId.value = activeData.value.id;
//     formId.value = activeData.value.metadata.insertMeta!.formId;
//     formItem.value = { id: formId.value };

//     let formDef = await formStore.get(formId.value);
//     if (formDef)
//       formFieldList.value.items = mergeFieldList(
//         formDef,
//         activeData.value.metadata.insertMeta!.formFieldList.items,
//         true
//       );

//   },
//   { immediate: true }
// );
</script>
