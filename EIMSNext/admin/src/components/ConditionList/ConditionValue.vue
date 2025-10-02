<template>
  <div class="cond-value">
    <div v-if="nodes && nodes.length > 0" class="value-type">
      <el-select
        size="default"
        default-first-option
        v-model="condValueType"
        @change="onValueTypeChange"
      >
        <el-option
          v-for="opt in condValueTypes"
          :label="opt.label"
          :value="opt.id"
          :key="opt.id"
        ></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="nodes && condValueType == ConditionValueType.Field">
        <NodeFieldList
          v-model="condFieldValue"
          :nodes="nodes"
          :fieldBuildRule="fieldBuildRule"
          @change="onValueChange"
        ></NodeFieldList>
      </template>
      <template v-else>
        <template v-if="dataTypeRef == ConditionFieldType.Number">
          <el-input-number
            size="default"
            v-bind="props || {}"
            v-model="value"
            @change="onInput"
          ></el-input-number>
        </template>
        <template v-else-if="dataTypeRef == ConditionFieldType.Select">
          <el-select
            size="default"
            filterable
            allow-create
            default-first-option
            v-bind="props || {}"
            v-model="value"
            @change="onInput"
          >
            <el-option
              v-for="opt in options"
              :label="opt.label"
              :value="opt.id"
              :key="opt.id"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="dataTypeRef == ConditionFieldType.Switch">
          <el-switch
            size="default"
            v-bind="props || {}"
            v-model="value"
            @change="onInput"
          ></el-switch>
        </template>
        <template v-else>
          <el-input size="default" v-bind="props || {}" v-model="value" @blur="onInput"></el-input>
        </template>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IListItem } from "@eimsnext/components";
import { ConditionFieldType, ConditionValueType, IConditonValue } from "./type";
import { FieldBuildRule, INodeForm } from "../FlowDesigner/components/NodeFieldList/type";
import { FieldType } from "@eimsnext/models";
import { IFormFieldDef } from "../FieldList/type";
import NodeFieldList from "../FlowDesigner/components/NodeFieldList/index.vue";

// import { useLocale } from "element-plus";
// const { t } = useLocale();

defineOptions({
  name: "ConditionValue",
});
const props = defineProps<{
  dataType: ConditionFieldType;
  options?: IListItem[];
  props?: object;
  modelValue: IConditonValue;
  nodes?: INodeForm[];
  fieldBuildRule?: FieldBuildRule;
}>();

const dataTypeRef = ref(props.dataType);
const condValueType = ref(props.modelValue.type);
const value = ref<any>(props.modelValue.value);
const condFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  }
);

const condValueTypes: IListItem[] = [
  { id: ConditionValueType.Custom, label: "自定义" },
  { id: ConditionValueType.Field, label: "字段值" },
];

const emit = defineEmits(["update:modelValue", "change"]);

const onValueTypeChange = () => {
  props.modelValue.type = condValueType.value;

  emitChange();
};
const onInput = () => {
  props.modelValue.value = value.value;

  emitChange();
};
const onValueChange = () => {
  props.modelValue.fieldValue = condFieldValue.value;

  emitChange();
};
const emitChange = () => {
  emit("update:modelValue", props.modelValue);
  emit("change", props.modelValue);
};
</script>

<style scoped lang="scss">
.cond-value {
  width: 100%;
  display: flex;

  .value-type {
    width: 100px;
    margin-right: 5px;
  }
  .value-value {
    flex: 1;
  }
}
</style>
