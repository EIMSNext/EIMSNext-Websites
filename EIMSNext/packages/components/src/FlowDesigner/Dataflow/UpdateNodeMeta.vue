<template>
  <template v-if="ready">
    <MetaItemHeader
      :label="t('dataflow.editFrom')"
      :required="true"
    ></MetaItemHeader>
    <div class="mode-container">
      <el-select
        v-model="mode"
        size="default"
        class="mode-select"
        @change="modeChanged"
      >
        <el-option
          :label="t('dataflow.recordInForm')"
          :value="UpdateMode.Form"
        />
        <el-option
          :label="t('dataflow.recordInNode')"
          :value="UpdateMode.Node"
        />
      </el-select>
      <FormSelect
        v-if="mode == UpdateMode.Form"
        v-model="formItem"
        :appId="appId"
        @change="formChanged"
      ></FormSelect>
      <el-select
        v-if="mode == UpdateMode.Node"
        v-model="activeData.metadata.updateMeta!.nodeId"
        size="default"
        @change="nodeChanged"
      >
        <el-option
          v-for="node in nodes"
          :key="node.nodeId"
          :label="node.nodeName"
          :value="node.nodeId"
        />
      </el-select>
    </div>
    <MetaItemHeader
      class="mt-[8px]"
      :label="t('dataflow.dataCondition')"
      :required="true"
    ></MetaItemHeader>
    <ConditionList
      v-model="condList"
      :formId="formId"
      :nodeId="nodeId"
      :nodes="nodes"
      @change="onCondition"
      @remove="onCondClear"
    >
    </ConditionList>
    <div>
      <el-checkbox
        v-model="activeData.metadata.updateMeta!.insertIfNoData"
        :label="t('dataflow.createIfNoMatched_Tips')"
        @change="insertIfNoDataChanged"
      />
    </div>
    <MetaItemHeader
      class="mt-[8px]"
      :label="t('dataflow.setFieldValue')"
      :required="true"
    ></MetaItemHeader>
    <div v-if="formulaErrorMsg" class="formula-error-banner">
      {{ formulaErrorMsg }}
    </div>
    <div v-if="activeData.metadata.updateMeta!.insertIfNoData">
      <el-radio-group
        :model-value="showEditPanel"
        size="large"
        @change="showEditPanelChanged"
      >
        <el-radio-button :label="t('dataflow.editRecord')" value="1" />
        <el-radio-button :label="t('dataflow.addRecord')" value="0" />
      </el-radio-group>
    </div>
    <div
      v-if="
        !activeData.metadata.updateMeta!.insertIfNoData || showEditPanel == '1'
      "
    >
      <FormFieldList
        v-if="nodes.length > 0"
        v-model="formFieldList"
        :node-id="nodeId"
        :formId="formId"
        :nodes="nodes"
        :show-all="false"
        :fieldSelecting="fieldSelecting"
        :fieldValueChanging="fieldValueChanging"
        @change="fieldChanged"
      >
      </FormFieldList>
      <div v-if="subCondNeeded" class="sub-cond-panel mt-[8px]">
        <div class="mb-[8px]">
          {{ t("dataflow.subCondition_Tips") }}
        </div>
        <ConditionList
          v-model="subCondList"
          :formId="formId"
          :nodeId="nodeId"
          :nodes="nodes"
          :maxLevel="1"
          :field-build-setting="subCondBuildSetting"
          @change="onSubCondition"
          @remove="onSubCondClear"
        ></ConditionList>
      </div>
    </div>
    <div
      v-if="
        activeData.metadata.updateMeta!.insertIfNoData && showEditPanel == '0'
      "
    >
      <FormFieldList
        v-if="nodes.length > 0"
        v-model="insertFieldList"
        :node-id="nodeId"
        :formId="formId"
        :nodes="nodes"
        :show-all="true"
        @change="insertFieldChanged"
      ></FormFieldList>
    </div>
  </template>
</template>
<script lang="ts" setup>
import { computed, inject, nextTick, reactive, ref } from "vue";
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
import { ConfirmResult, EtConfirm } from "@/dialog/EtConfirm";
import { MessageIcon } from "@/dialog/type";
import { validateFormulaFieldList } from "./formula";

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
const formulaErrorMsg = computed(() => {
  const result = validateFormulaFieldList(
    showEditPanel.value == "0"
      ? insertFieldList.value.items
      : formFieldList.value.items,
    t("dataflow.formulaInferenceError"),
  );
  return result.valid ? "" : t("dataflow.formulaInferenceError");
});

const ensureUpdateMeta = () => {
  if (activeData.value.metadata.updateMeta) {
    return activeData.value.metadata.updateMeta;
  }

  activeData.value.metadata.updateMeta = {
    updateMode: UpdateMode.Form,
    formId: "",
    condition: { id: uniqueId(), rel: "and", items: [] },
    formFieldList: { items: [] },
    singleResult: false,
    insertIfNoData: false,
    insertFieldList: { items: [] },
  };

  return activeData.value.metadata.updateMeta;
};

const modeChanged = (mode: UpdateMode) => {
  const updateMeta = ensureUpdateMeta();
  formId.value = "";
  formItem.value.id = "";
  formFieldList.value.items = [];
  // condList.value = { id: uniqueId(), rel: "and", items: [] };
  condList.value.items = [];

  updateMeta.updateMode = mode;
  updateMeta.nodeId = undefined;
  updateMeta.formId = "";
  updateMeta.formFieldList = formFieldList.value;
  updateMeta.condition = condList.value;
};
const nodeChanged = () => {
  const updateMeta = ensureUpdateMeta();
  if (updateMeta.nodeId) {
    var node = nodes.value.find(
      (x) => x.nodeId == updateMeta.nodeId,
    );
    if (node) {
      formId.value = node.form?.id ?? "";
      formItem.value.id = formId.value;
      updateMeta.formId = formId.value;
    }
  }
};

const formChanged = async (form: IFormItem) => {
  const updateMeta = ensureUpdateMeta();
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

  updateMeta.formId = form.id;
  updateMeta.condition = condList.value;
  updateMeta.formFieldList = formFieldList.value;
  updateMeta.subCondition = undefined;
  updateMeta.insertFieldList = insertFieldList.value;
};
const onCondition = (list: IConditionList) => {
  ensureUpdateMeta().condition = list;
};
const onCondClear = () => {
  condList.value.items = [];
  ensureUpdateMeta().condition = condList.value;
};

const onSubCondition = (list: IConditionList) => {
  ensureUpdateMeta().subCondition = list;
};
const onSubCondClear = () => {
  subCondList.value.items = [];
  ensureUpdateMeta().subCondition = undefined;
};

const getSourceField = (fieldItem: IFormFieldItem) => {
  if (fieldItem.value.type == FieldValueType.Field) {
    return fieldItem.value.fieldValue;
  }

  if (fieldItem.value.type == FieldValueType.Formula) {
    return fieldItem.value.formulaValue?.drivingField;
  }

  return undefined;
};

const isSubConditionSourceField = (fieldItem: IFormFieldItem) => {
  const sourceField = getSourceField(fieldItem);
  return !!sourceField && (!sourceField.singleResultNode || sourceField.isSubField);
};

const fieldSelecting = async (field: IFormFieldItem) => {
  let allowed = true;
  let fieldLimit = subCondBuildSetting.value.fieldLimit;
  if (subCondNeeded.value && fieldLimit) {
    if (field.field.isSubField) {
      let mainField = splitSubField(field.field.field)[0];
      if (mainField != fieldLimit.limitField) {
        let confirm = await EtConfirm.showDialog(
          t("dataflow.fieldConflict_MsgContent"),
          {
            title: t("dataflow.fieldConflict_MsgTitle"),
            icon: MessageIcon.Warning,
          },
        );
        if (confirm == ConfirmResult.Yes) {
          if (fieldLimit.limitType == FieldLimitType.MultiResult) {
            formFieldList.value.items = formFieldList.value.items.filter(
              (x) => !isSubConditionSourceField(x) || getSourceField(x)?.isSubField,
            );
          } else {
            formFieldList.value.items = formFieldList.value.items.filter(
              (x) => !x.field.isSubField || x.field.field.startsWith(mainField),
            );
          }
          ensureUpdateMeta().formFieldList = formFieldList.value;

          subCondList.value.items = [];
          ensureUpdateMeta().subCondition = undefined;

          updateSubCondList(formFieldList.value);
        } else {
          allowed = false;
        }
      }
    }
  }

  return allowed;
};
const fieldValueChanging = async (
  field: IFormFieldDef,
  oldVal?: IFormFieldDef,
  newVal?: IFormFieldDef,
) => {
  if (!newVal || !newVal.field) return true;

  let allowed = true;

  if (field.isSubField) {
  } else {
    if (!newVal.singleResultNode || newVal.isSubField) {
      if (
        (subCondBuildSetting.value.fieldLimit &&
          subCondBuildSetting.value.fieldLimit.limitField != "master") ||
        formFieldList.value.items.findIndex((x) => x.field.isSubField) > -1
      ) {
        let confirm = await EtConfirm.showDialog(
          t("dataflow.fieldConflict_MsgContent"),
          {
            title: t("dataflow.fieldConflict_MsgTitle"),
            icon: MessageIcon.Warning,
          },
        );

        if (confirm == ConfirmResult.Yes) {
          formFieldList.value.items = formFieldList.value.items.filter(
            (x) => !x.field.isSubField,
          );
          ensureUpdateMeta().formFieldList = formFieldList.value;

          subCondList.value.items = [];
          ensureUpdateMeta().subCondition = undefined;

          updateSubCondList(formFieldList.value);
        } else {
          allowed = false;
        }
      }
    }
  }

  return allowed;
};

const fieldChanged = (fields: IFormFieldList) => {
  updateSubCondList(fields);
  ensureUpdateMeta().formFieldList = fields;
};

const getSubFieldMap = (fields: IFormFieldList) => {
  let mappedField = fields.items.find(
    (x) => x.field.isSubField || isSubConditionSourceField(x),
  );

  if (mappedField) {
    const sourceField = getSourceField(mappedField);
    let limitField = mappedField.field.isSubField
      ? splitSubField(mappedField.field.field)[0]
      : "master";
    return {
      limitField,
      limitType:
        sourceField == undefined
          ? FieldLimitType.None
          : sourceField.isSubField
            ? FieldLimitType.SubField
            : FieldLimitType.MultiResult,
    };
  }

  return undefined;
};
const updateSubCondList = (fields: IFormFieldList) => {
  let mappedField = getSubFieldMap(fields);
  if (mappedField) {
    subCondNeeded.value = true;
    subCondBuildSetting.value.fieldLimit = mappedField;
  } else {
    subCondNeeded.value = false;
    subCondBuildSetting.value.fieldLimit = undefined;
    subCondList.value.items = [];
    ensureUpdateMeta().subCondition = undefined;
  }
};

const showEditPanelChanged = (val: any) => {
  showEditPanel.value = val;
};
const insertFieldChanged = (fields: IFormFieldList) => {
  ensureUpdateMeta().insertFieldList = fields;
};
const insertIfNoDataChanged = () => {
  const updateMeta = ensureUpdateMeta();
  if (updateMeta.insertIfNoData && formDef.value) {
    insertFieldList.value.items = mergeFieldList(
      formDef.value,
      updateMeta.insertFieldList.items,
      true,
    );
  }
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    const updateMeta = ensureUpdateMeta();
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

    mode.value = updateMeta.updateMode;
    nodeId.value = activeData.value.id;
    formId.value = updateMeta.formId;
    formItem.value = { id: formId.value };

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    subCondList.value = { id: uniqueId(), rel: "and", items: [] };

    if (updateMeta.condition) {
      condList.value = updateMeta.condition;
    }

    if (updateMeta.subCondition) {
      subCondList.value = updateMeta.subCondition;
    }

    formDef.value = await formStore.get(formId.value);
    if (formDef.value) {
      formFieldList.value.items = mergeFieldList(
        formDef.value,
        updateMeta.formFieldList.items,
        false,
      );

      updateSubCondList(formFieldList.value);

      insertFieldList.value.items = mergeFieldList(
        formDef.value,
        updateMeta.insertFieldList.items,
        true,
      );
    }

    ready.value = true;
  });
};

init();
</script>
<style lang="scss" scoped>
.mode-container {
  display: flex;
}

.mode-select {
  width: var(--et-size-300);
  margin-right: var(--et-space-5);
}

.sub-cond-panel {
  background-color: var(--et-bg-muted);
  padding: var(--et-space-10);
}

.formula-error-banner {
  margin-bottom: var(--et-space-8);
  padding: var(--et-space-8);
  color: var(--et-color-danger);
  background: var(--et-color-danger-light-9);
  border: 1px solid var(--et-color-danger-light-5);
  border-radius: var(--et-radius-2);
}
</style>
