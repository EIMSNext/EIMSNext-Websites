<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('修改对象')" :required="true"></MetaItemHeader>
    <div class="mode-container">
      <el-select v-model="mode" size="default" style="width: 300px; margin-right: 5px" @change="modeChanged">
        <el-option label="选择表单修改数据" :value="UpdateMode.Form" />
        <el-option label="选择节点修改数据" :value="UpdateMode.Node" />
      </el-select>
      <FormList v-if="mode == UpdateMode.Form" v-model="formItem" :appId="appId" @change="formChanged"></FormList>
      <el-select v-if="mode == UpdateMode.Node" v-model="activeData.metadata.updateMeta!.nodeId" size="default"
        @change="nodeChanged">
        <el-option v-for="node in nodes" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
      </el-select>
    </div>
    <MetaItemHeader class="mt-[8px]" :label="t('数据筛选条件')" :required="true"></MetaItemHeader>
    <ConditionList v-model="condList" :formId="formId" :nodeId="nodeId" :nodes="nodes" @change="onCondition">
    </ConditionList>
    <div>
      <el-checkbox v-model="activeData.metadata.updateMeta!.insertIfNoData" label="没有可修改的数据时，向对应表单新增数据" />
    </div>
    <MetaItemHeader class="mt-[8px]" :label="t('设置字段数据')" :required="true"></MetaItemHeader>
    <div v-if="activeData.metadata.updateMeta!.insertIfNoData">
      <el-radio-group :model-value="showEditPanel" size="large" @change="showEditPanelChanged">
        <el-radio-button label="修改数据" value="1" />
        <el-radio-button label="新增数据" value="0" />
      </el-radio-group>
    </div>
    <div v-if="!activeData.metadata.updateMeta!.insertIfNoData || showEditPanel == '1'">
      <FormFieldList v-if="nodes.length > 0" v-model="formFieldList" :node-id="nodeId" :formId="formId" :nodes="nodes"
        :show-all="false" @change="fieldChanged"></FormFieldList>
      <div v-if="subCondNeeded" class="mt-[8px]" style="background-color: #f5f6f8; padding: 10px">
        <div class="mb-[8px]">修改数据选择了子表单字段，请设置子表单的修改条件</div>
        <ConditionList v-model="subCondList" :formId="formId" :nodeId="nodeId" :nodes="nodes" :maxLevel="1"
          @change="onSubCondition"></ConditionList>
      </div>
    </div>
    <div v-if="activeData.metadata.updateMeta!.insertIfNoData && showEditPanel == '0'">
      <FormFieldList v-if="nodes.length > 0" v-model="insertFieldList" :node-id="nodeId" :formId="formId" :nodes="nodes"
        :show-all="true" @change="insertFieldChanged"></FormFieldList>
    </div>
  </template>
</template>
<script lang="ts" setup>
import { FlowNodeType, IFlowContext, IFlowNodeData, UpdateMode, createFlowNode } from "../FlowData";
import { FormDef } from "@eimsnext/models";
import { useContextStore, useFormStore } from "@eimsnext/store";
import FormList from "../../FormList/index.vue";
import ConditionList from "../../ConditionList/index.vue";
import FormFieldList from "../components/FieldSetting/FormFieldList.vue";
import { useLocale } from "element-plus";
import { IFormItem } from "@/components/FormList/type";
import {
  FieldValueType,
  IFormFieldItem,
  IFormFieldList,
  buildFormFieldList,
  mergeFieldList,
} from "../components/FieldSetting/type";
import { INodeForm } from "../components/NodeFieldList/type";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../components/MetaItemHeader/index.vue";
import { IConditionList } from "@/components/ConditionList/type";
import { uniqueId } from "@eimsnext/utils";
import { cloneDeep } from "lodash";
const { t } = useLocale();

defineOptions({
  name: "UpdateNodeMeta",
});

const ready = ref(false)
const nodeId = ref("");
const formId = ref("");
const formFieldList = ref<IFormFieldList>({ items: [] });
const insertFieldList = ref<IFormFieldList>({ items: [] });

const formStore = useFormStore();
// const formDef = ref<FormDef>();
const mode = ref(UpdateMode.Form);

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const subCondList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });

const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));

const appId = ref(flowContext!.appId);
const formItem = ref<IFormItem>({ id: "" });
const nodes = ref<INodeForm[]>([]);
const subCondNeeded = ref(false);
const showEditPanel = ref("1");
console.log("showEditPanel", showEditPanel);

const modeChanged = (mode: UpdateMode) => {
  formId.value = "";
  formItem.value.id = "";
  formFieldList.value.items = [];
  // condList.value = { id: uniqueId(), rel: "and", items: [] };
  condList.value.items = []

  activeData.value.metadata.updateMeta!.updateMode = mode;
  activeData.value.metadata.updateMeta!.nodeId = undefined;
  activeData.value.metadata.updateMeta!.formId = "";
  activeData.value.metadata.updateMeta!.formFieldList = formFieldList.value;
  activeData.value.metadata.updateMeta!.condition = condList.value;
};
const nodeChanged = () => {
  if (activeData.value.metadata.updateMeta!.nodeId) {
    var node = nodes.value.find((x) => x.nodeId == activeData.value.metadata.updateMeta!.nodeId);
    if (node) {
      formId.value = node.form?.id ?? "";
      formItem.value.id = formId.value;
      activeData.value.metadata.updateMeta!.formId = formId.value;
    }
  }
};

const formChanged = async (form: IFormItem) => {
  //  console.log("formChanged", form);
  formId.value = form.id;
  formItem.value.id = formId.value;
  formFieldList.value.items = [];
  insertFieldList.value.items = [];
  // condList.value = { id: uniqueId(), rel: "and", items: [] };
  // subCondList.value = { id: uniqueId(), rel: "and", items: [] };
  condList.value.items = []
  subCondList.value.items = []
  subCondNeeded.value = false;

  ////
  let formDef = await formStore.get(formId.value);
  if (formDef) {
    insertFieldList.value.items = mergeFieldList(formDef, [], true);
  }
  ////

  activeData.value.metadata.updateMeta!.formId = form.id;
  activeData.value.metadata.updateMeta!.condition = condList.value;
  activeData.value.metadata.updateMeta!.formFieldList = formFieldList.value;
  activeData.value.metadata.updateMeta!.subCondition = undefined;
  activeData.value.metadata.updateMeta!.insertFieldList = insertFieldList.value;
};
const onCondition = (list: IConditionList) => {
  // condList.value = list;
  activeData.value.metadata.updateMeta!.condition = list;
};
const onSubCondition = (list: IConditionList) => {
  // subCondList.value = list;
  activeData.value.metadata.updateMeta!.subCondition = list;
};
const fieldChanged = (fields: IFormFieldList) => {
  // console.log("fieldChanged", fields.items);
  // formFieldList.value = fields;
  activeData.value.metadata.updateMeta!.formFieldList = fields;
};
const showEditPanelChanged = (val: any) => {
  console.log("showEditPanelChanged", val);
  showEditPanel.value = val;
};
const insertFieldChanged = (fields: IFormFieldList) => {
  // console.log("insertFieldChanged", fields.items);
  // insertFieldList.value = fields;
  activeData.value.metadata.updateMeta!.insertFieldList = fields;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

    mode.value = activeData.value.metadata.updateMeta!.updateMode;
    nodeId.value = activeData.value.id;
    formId.value = activeData.value.metadata.updateMeta!.formId;
    formItem.value = { id: formId.value };

    let formDef = await formStore.get(formId.value);
    if (formDef) {
      formFieldList.value.items = mergeFieldList(
        formDef,
        activeData.value.metadata.updateMeta!.formFieldList.items,
        false
      );

      //TODO: 将来进一步区分需要主字段条件还是子表单字段条件
      subCondNeeded.value = formFieldList.value.items.findIndex((x) => x.field.isSubField || (x.value.type == FieldValueType.Field && (x.value.fieldValue && (!x.value.fieldValue.singleResultNode || x.value.fieldValue.isSubField)))) > -1;

      insertFieldList.value.items = mergeFieldList(
        formDef,
        activeData.value.metadata.updateMeta!.insertFieldList.items,
        true
      );
    }

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    subCondList.value = { id: uniqueId(), rel: "and", items: [] };

    if (activeData.value.metadata.updateMeta!.condition) {
      condList.value = activeData.value.metadata.updateMeta!.condition;
    }

    if (activeData.value.metadata.updateMeta!.subCondition) {
      subCondList.value = activeData.value.metadata.updateMeta!.subCondition;
    }

    ready.value = true
  })
}

init()

// watch(
//   flowContextRef,
//   async (newValue: IFlowContext) => {
//     console.log("activeData", newValue.activeData);
//     // activeData.value = cloneDeep(newValue.activeData);
//     activeData.value = newValue.activeData;
//     nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

//     mode.value = activeData.value.metadata.updateMeta!.updateMode;
//     nodeId.value = activeData.value.id;
//     formId.value = activeData.value.metadata.updateMeta!.formId;
//     formItem.value = { id: formId.value };

//     let formDef = await formStore.get(formId.value);
//     if (formDef) {
//       formFieldList.value.items = mergeFieldList(
//         formDef,
//         activeData.value.metadata.updateMeta!.formFieldList.items,
//         false
//       );

//       //TODO: 将来进一步区分需要主字段条件还是子表单字段条件
//       subCondNeeded.value = formFieldList.value.items.findIndex((x) =>x.field.isSubField || (x.value.type== FieldValueType.Field && (x.value.fieldValue && (!x.value.fieldValue.singleResultNode||x.value.fieldValue.isSubField)) ) ) > -1;

//       insertFieldList.value.items = mergeFieldList(
//         formDef,
//         activeData.value.metadata.updateMeta!.insertFieldList.items,
//         true
//       );
//     }

//     condList.value = { id: uniqueId(), rel: "and", items: [] };
//     subCondList.value = { id: uniqueId(), rel: "and", items: [] };

//     if (activeData.value.metadata.updateMeta!.condition) {
//       condList.value = activeData.value.metadata.updateMeta!.condition;
//     }

//     if (activeData.value.metadata.updateMeta!.subCondition) {
//       subCondList.value = activeData.value.metadata.updateMeta!.subCondition;
//     }
//   },
//   { immediate: true }
// );


//TODO: 将来需要使用mount + save方法防止页面频繁刷新
// onBeforeMount(async () => {
//   console.log("onBeforeMount", flowContextRef.activeData);
//   activeData.value = cloneDeep(flowContextRef.activeData);
//   nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

//   mode.value = activeData.value.metadata.updateMeta!.updateMode;
//   nodeId.value = activeData.value.id;
//   formId.value = activeData.value.metadata.updateMeta!.formId;
//   formItem.value = { id: formId.value };

//   let formDef = await formStore.get(formId.value);
//   if (formDef) {
//     formFieldList.value.items = mergeFieldList(
//       formDef,
//       activeData.value.metadata.updateMeta!.formFieldList.items,
//       false
//     );

//     subCondNeeded.value = formFieldList.value.items.findIndex((x) => x.field.isSubField) > -1;

//     insertFieldList.value.items = mergeFieldList(
//       formDef,
//       activeData.value.metadata.updateMeta!.insertFieldList.items,
//       true
//     );
//   }

//   condList.value = { id: uniqueId(), rel: "and", items: [] };
//   subCondList.value = { id: uniqueId(), rel: "and", items: [] };

//   if (activeData.value.metadata.updateMeta!.condition) {
//     condList.value = activeData.value.metadata.updateMeta!.condition;
//   }

//   if (activeData.value.metadata.updateMeta!.subCondition) {
//     subCondList.value = activeData.value.metadata.updateMeta!.subCondition;
//   }
// });
// onBeforeUnmount(() => {
//   console.log("onBeforeUnmount");
//   flowContextRef.activeData = activeData.value;
// });
</script>
<style lang="scss" scoped>
.mode-container {
  display: flex;
}
</style>
