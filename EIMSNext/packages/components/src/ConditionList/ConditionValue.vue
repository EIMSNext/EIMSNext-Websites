<template>
  <div class="cond-value">
    <div v-if="nodes && nodes.length > 0" class="value-type">
      <el-select size="default" default-first-option v-model="condValueType" @change="onValueTypeChange">
        <el-option v-for="opt in condValueTypes" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="nodes && condValueType == ConditionValueType.Field">
        <NodeFieldList v-model="condFieldValue" :nodes="nodes" :field-def="props.fieldDef"
          :fieldBuildSetting="fieldBuildSetting" @change="onValueChange">
        </NodeFieldList>
      </template>
      <template v-else>
        <template v-if="dataType == ConditionFieldType.Input">
          <el-input size="default" v-model="value" @blur="onInput"></el-input>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Number">
          <el-input-number size="default" v-model="value" @change="onInput"></el-input-number>
        </template>
        <template v-else-if="dataType == ConditionFieldType.TimeStamp">
          <el-date-picker size="default" v-model="value" value-format="x" :format="fieldDef?.format"
            @change="onInput"></el-date-picker>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Select">
          <el-select size="default" filterable allow-create default-first-option v-model="value" @change="onInput">
            <el-option v-for="opt in props.options" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Select2">
          <el-select size="default" multiple filterable allow-create default-first-option v-model="value"
            @change="onInput">
            <el-option v-for="opt in props.options" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
          </el-select>
        </template>
        <!-- <template v-else-if="dataType == ConditionFieldType.Switch">
          <el-switch size="default" v-bind="props || {}" v-model="value" @change="onInput"></el-switch>
        </template> -->
        <template v-else>
          <el-input size="default" v-model="value" @blur="onInput"></el-input>
        </template>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ConditionValueType, IConditonValue } from "./type";
import { FieldType } from "@eimsnext/models";
import { IFormFieldDef } from "../FieldList/type";
import { IFieldBuildSetting, INodeForm, getConditionFieldType, ConditionFieldType } from "@/NodeFieldList/type";
import { IListItem } from "@/list/type";
import { computed, ref, toRef } from "vue";

import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "ConditionValue",
});
const props = defineProps<{
  modelValue: IConditonValue;
  fieldBuildSetting: IFieldBuildSetting;
  nodes?: INodeForm[];
  fieldDef?: IFormFieldDef;
  options?: IListItem[];
}>();

const dataType = computed(() => {
  return getConditionFieldType(props.fieldDef?.type ?? FieldType.None)
});

const condValueType = toRef(props.modelValue.type);
const value = toRef<any>(props.modelValue.value);
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
  { id: ConditionValueType.Custom, label: t("comp.value_Custom") },
  { id: ConditionValueType.Field, label: t("comp.value_Field") },
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
