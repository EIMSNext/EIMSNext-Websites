<template>
  <div class="field-value">
    <div class="value-type">
      <el-select
        size="default"
        default-first-option
        v-model="fieldValueType"
        @change="onValueTypeChange"
      >
        <el-option
          v-for="opt in fieldValueTypes"
          :label="opt.label"
          :value="opt.id"
          :key="opt.id"
        ></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="fieldValueType == FieldValueType.Custom">
        <template v-if="fieldType == FieldType.Input">
          <el-input v-model="value" size="default" @change="onInput"></el-input>
        </template>
        <template v-if="fieldType == FieldType.InputNumber">
          <el-input-number
            v-model="value"
            size="default"
            style="width: auto"
            @change="onInput"
          ></el-input-number>
        </template>
      </template>
      <template v-if="fieldValueType == FieldValueType.Field">
        <NodeFieldList
          v-model="fieldFieldValue"
          :nodes="nodes"
          :fieldBuildRule="FieldBuildRule.OneLevelTable"
          @change="onValueChange"
        ></NodeFieldList>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IListItem } from "@eimsnext/components";
import { IFormFieldValue, FieldTypeMapping, FieldValueType } from "./type";
import { FieldType } from "@eimsnext/models";
import NodeFieldList from "../NodeFieldList/index.vue";
import { FieldBuildRule, INodeForm } from "../NodeFieldList/type";

import { useLocale } from "element-plus";
import { IFormFieldDef } from "@/components/FieldList/type";
const { t } = useLocale();

defineOptions({
  name: "FormFieldValue",
});
const props = defineProps<{
  fieldDef: IFormFieldDef;
  nodes: INodeForm[];
  modelValue: IFormFieldValue;
}>();

const fieldValueType = ref(props.modelValue.type);
const value = ref<any>(props.modelValue.value);
const fieldFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  }
);

const fieldValueTypes: IListItem[] = [
  { id: FieldValueType.Custom, label: "自定义" },
  { id: FieldValueType.Field, label: "字段值" },
  { id: FieldValueType.Empty, label: "空值" },
];

const fieldType = computed(() => props.fieldDef.type);

const emit = defineEmits(["update:modelValue", "change"]);
const onValueTypeChange = () => {
  props.modelValue.type = fieldValueType.value;

  emitChange();
};
const onInput = () => {
  props.modelValue.value = value.value;

  emitChange();
};
const onValueChange = () => {
  props.modelValue.fieldValue = fieldFieldValue.value;

  emitChange();
};
const emitChange = () => {
  emit("update:modelValue", props.modelValue);
  emit("change", props.modelValue);
};
</script>

<style scoped lang="scss">
.field-value {
  flex: 1;
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
