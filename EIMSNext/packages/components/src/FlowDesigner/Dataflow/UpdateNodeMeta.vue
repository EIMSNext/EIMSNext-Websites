<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('dataflow.editFrom')" :required="true"></MetaItemHeader>
    <div class="mode-container">
      <el-select v-model="mode" size="default" style="width: 300px; margin-right: 5px" @change="modeChanged">
        <el-option :label="t('dataflow.recordInForm')" :value="UpdateMode.Form" />
        <el-option :label="t('dataflow.recordInNode')" :value="UpdateMode.Node" />
      </el-select>
      <FormList v-if="mode == UpdateMode.Form" v-model="formItem" :appId="appId" @change="formChanged"></FormList>
      <el-select v-if="mode == UpdateMode.Node" v-model="activeData.metadata.updateMeta!.nodeId" size="default"
        @change="nodeChanged">
        <el-option v-for="node in nodes" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
      </el-select>
    </div>
    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.dataCondition')" :required="true"></MetaItemHeader>
    <ConditionList v-model="condList" :formId="formId" :nodeId="nodeId" :nodes="nodes" @change="onCondition">
    </ConditionList>
    <div>
      <el-checkbox v-model="activeData.metadata.updateMeta!.insertIfNoData"
        :label="t('dataflow.createIfNoMatched_Tips')" @change="insertIfNoDataChanged" />
    </div>
    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.setFieldValue')" :required="true"></MetaItemHeader>
    <div v-if="activeData.metadata.updateMeta!.insertIfNoData">
      <el-radio-group :model-value="showEditPanel" size="large" @change="showEditPanelChanged">
        <el-radio-button :label="t('dataflow.editRecord')" value="1" />
        <el-radio-button :label="t('dataflow.addRecord')" value="0" />
      </el-radio-group>
    </div>
    <div v-if="
      !activeData.metadata.updateMeta!.insertIfNoData || showEditPanel == '1'
    ">
      <FormFieldList v-if="nodes.length > 0" v-model="formFieldList" :node-id="nodeId" :formId="formId" :nodes="nodes"
        :show-all="false" :fieldSelecting="fieldSelecting" :fieldValueChanging="fieldValueChanging"
        @change="fieldChanged">
      </FormFieldList>
      <div v-if="subCondNeeded" class="mt-[8px]" style="background-color: #f5f6f8; padding: 10px">
        <div class="mb-[8px]">
          {{ t("dataflow.subCondition_Tips") }}
        </div>
        <ConditionList v-model="subCondList" :formId="formId" :nodeId="nodeId" :nodes="nodes" :maxLevel="1"
          :field-build-setting="subCondBuildSetting" @change="onSubCondition"></ConditionList>
      </div>
    </div>
    <div v-if="
      activeData.metadata.updateMeta!.insertIfNoData && showEditPanel == '0'
    ">
      <FormFieldList v-if="nodes.length > 0" v-model="insertFieldList" :node-id="nodeId" :formId="formId" :nodes="nodes"
        :show-all="true" @change="insertFieldChanged"></FormFieldList>
    </div>
  </template>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  UpdateMode,
  createFlowNode,
} from "../Common/FlowData";
import { FormDef } from "@eimsnext/models";
import { useContextStore, useFormStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { uniqueId } from "@eimsnext/utils";
import {
  FieldValueType,
  FormFieldListInstance,
  IFormFieldItem,
  IFormFieldList,
  mergeFieldList,
} from "@/FormFieldList/type";
import { IConditionList } from "@/ConditionList/type";
import {
  FieldBuildRule,
  FieldLimitType,
  IFieldBuildSetting,
  IFieldLimit,
  INodeForm,
} from "@/NodeFieldList/type";
import { IFormItem } from "@/FormSelect/type";
import { IFormFieldDef, splitSubField } from "@/FieldSelect/type";
import { EtConfirm } from "@/dialog/EtConfirm";
import { MessageIcon } from "@/dialog/type";

const { t } = useLocale();

defineOptions({
  name: "UpdateNodeMeta",
});

const ready = ref(false);
const nodeId = ref("");
const formId = ref("");
const formDef = ref<FormDef>();
const formFieldList = ref<IFormFieldList>({ items: [] });
const insertFieldList = ref<IFormFieldList>({ items: [] });

const formStore = useFormStore();
// const formDef = ref<FormDef>();
const mode = ref(UpdateMode.Form);

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const subCondList = ref<IConditionList>({
  id: uniqueId(),
  rel: "and",
  items: [],
});
const subCondBuildSetting = ref<IFieldBuildSetting>({
  version: 0,
  rule: FieldBuildRule.All,
  matchType: false,
});

const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));

const appId = ref(flowContext!.appId);
const formItem = ref<IFormItem>({ id: "" });
const nodes = ref<INodeForm[]>([]);
const subCondNeeded = ref(false);
const showEditPanel = ref("1");
// console.log("showEditPanel", showEditPanel);

const modeChanged = (mode: UpdateMode) => {
  formId.value = "";
  formItem.value.id = "";
  formFieldList.value.items = [];
  // condList.value = { id: uniqueId(), rel: "and", items: [] };
  condList.value.items = [];

  activeData.value.metadata.updateMeta!.updateMode = mode;
  activeData.value.metadata.updateMeta!.nodeId = undefined;
  activeData.value.metadata.updateMeta!.formId = "";
  activeData.value.metadata.updateMeta!.formFieldList = formFieldList.value;
  activeData.value.metadata.updateMeta!.condition = condList.value;
};
const nodeChanged = () => {
  if (activeData.value.metadata.updateMeta!.nodeId) {
    var node = nodes.value.find(
      (x) => x.nodeId == activeData.value.metadata.updateMeta!.nodeId
    );
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
  condList.value.items = [];
  subCondList.value.items = [];
  subCondNeeded.value = false;
  subCondBuildSetting.value.fieldLimit = undefined;

  ////
  formDef.value = await formStore.get(formId.value);
  if (formDef.value) {
    insertFieldList.value.items = mergeFieldList(formDef.value, [], true);
  }
  ////

  activeData.value.metadata.updateMeta!.formId = form.id;
  activeData.value.metadata.updateMeta!.condition = condList.value;
  activeData.value.metadata.updateMeta!.formFieldList = formFieldList.value;
  activeData.value.metadata.updateMeta!.subCondition = undefined;
  activeData.value.metadata.updateMeta!.insertFieldList = insertFieldList.value;
};
const onCondition = (list: IConditionList) => {
  activeData.value.metadata.updateMeta!.condition = list;
};
const onSubCondition = (list: IConditionList) => {
  activeData.value.metadata.updateMeta!.subCondition = list;
};
const fieldSelecting = async (field: IFormFieldItem) => {
  let allowed = true;
  let fieldLimit = subCondBuildSetting.value.fieldLimit
  if (subCondNeeded.value && fieldLimit) {
    if (field.field.isSubField) {
      let mainField = splitSubField(field.field.field)[0]
      if (mainField != fieldLimit.limitField) {
        let confirm = await EtConfirm.showDialog(t("dataflow.fieldConflict_MsgContent"), {
          title: t("dataflow.fieldConflict_MsgTitle"),
          icon: MessageIcon.Warning
        });
        if (confirm) {
          if (fieldLimit.limitType == FieldLimitType.MultiResult) {
            // console.log("sub1111", mainField, formFieldList.value.items)
            formFieldList.value.items = formFieldList.value.items.filter(x => x.value.type != FieldValueType.Field || !x.value.fieldValue || x.value.fieldValue.singleResultNode)
          }
          else {
            // console.log("sub222", mainField, formFieldList.value.items)
            formFieldList.value.items = formFieldList.value.items.filter(x => !x.field.isSubField || x.field.field.startsWith(mainField))
          }
          activeData.value.metadata.updateMeta!.formFieldList = formFieldList.value;

          subCondList.value.items = [];
          activeData.value.metadata.updateMeta!.subCondition = undefined;

          updateSubCondList(formFieldList.value)
        }
        else { allowed = false }
      }
    }
  }

  return allowed;
};
const fieldValueChanging = async (
  field: IFormFieldDef,
  oldVal?: IFormFieldDef,
  newVal?: IFormFieldDef
) => {
  // console.log("new-old", newVal, oldVal)
  if (!newVal || !newVal.field) return true;

  let allowed = true;

  if (field.isSubField) {

  }
  else {
    if (!newVal.singleResultNode || newVal.isSubField) {
      if ((subCondBuildSetting.value.fieldLimit && subCondBuildSetting.value.fieldLimit.limitField != "master")
        || formFieldList.value.items.findIndex(x => x.field.isSubField) > -1) {
        let confirm = await EtConfirm.showDialog(t("dataflow.fieldConflict_MsgContent"), {
          title: t("dataflow.fieldConflict_MsgTitle"),
          icon: MessageIcon.Warning
        });

        if (confirm) {
          formFieldList.value.items = formFieldList.value.items.filter(x => !x.field.isSubField)
          activeData.value.metadata.updateMeta!.formFieldList = formFieldList.value;

          subCondList.value.items = [];
          activeData.value.metadata.updateMeta!.subCondition = undefined;

          updateSubCondList(formFieldList.value)
        }
        else { allowed = false }
      }
    }
  }

  return allowed;
};

const fieldChanged = (fields: IFormFieldList) => {
  // console.log("fieldChanged", fields.items);

  updateSubCondList(fields);
  activeData.value.metadata.updateMeta!.formFieldList = fields;
};

const getSubFieldMap = (fields: IFormFieldList) => {
  let mappedField = fields.items.find(
    (x) =>
      x.field.isSubField ||
      (x.value.type == FieldValueType.Field &&
        x.value.fieldValue &&
        (!x.value.fieldValue.singleResultNode || x.value.fieldValue.isSubField))
  );

  if (mappedField) {
    let limitField = mappedField.field.isSubField
      ? splitSubField(mappedField.field.field)[0]
      : "master";
    return { limitField, limitType: mappedField.value.fieldValue == undefined ? FieldLimitType.None : (mappedField.value.fieldValue?.isSubField ? FieldLimitType.SubField : FieldLimitType.MultiResult) }
  }

  return undefined
};
const updateSubCondList = (fields: IFormFieldList) => {
  let mappedField = getSubFieldMap(fields);
  // console.log("mapped", mappedField, fields)
  if (mappedField) {
    subCondNeeded.value = true;
    subCondBuildSetting.value.fieldLimit = mappedField
  } else {
    subCondNeeded.value = false;
    subCondBuildSetting.value.fieldLimit = undefined;
    subCondList.value.items = [];
    activeData.value.metadata.updateMeta!.subCondition = undefined;
  }
};

const showEditPanelChanged = (val: any) => {
  showEditPanel.value = val;
};
const insertFieldChanged = (fields: IFormFieldList) => {
  activeData.value.metadata.updateMeta!.insertFieldList = fields;
};
const insertIfNoDataChanged = () => {
  if (activeData.value.metadata.updateMeta!.insertIfNoData && formDef.value) {
    insertFieldList.value.items = mergeFieldList(
      formDef.value,
      activeData.value.metadata.updateMeta!.insertFieldList.items,
      true
    );
  }
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

    mode.value = activeData.value.metadata.updateMeta!.updateMode;
    nodeId.value = activeData.value.id;
    formId.value = activeData.value.metadata.updateMeta!.formId;
    formItem.value = { id: formId.value };

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    subCondList.value = { id: uniqueId(), rel: "and", items: [] };

    if (activeData.value.metadata.updateMeta!.condition) {
      condList.value = activeData.value.metadata.updateMeta!.condition;
    }

    if (activeData.value.metadata.updateMeta!.subCondition) {
      subCondList.value = activeData.value.metadata.updateMeta!.subCondition;
    }

    formDef.value = await formStore.get(formId.value);
    if (formDef.value) {
      formFieldList.value.items = mergeFieldList(
        formDef.value,
        activeData.value.metadata.updateMeta!.formFieldList.items,
        false
      );

      updateSubCondList(formFieldList.value);

      insertFieldList.value.items = mergeFieldList(
        formDef.value,
        activeData.value.metadata.updateMeta!.insertFieldList.items,
        true
      );
    }

    ready.value = true;
  });
};

init();

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
