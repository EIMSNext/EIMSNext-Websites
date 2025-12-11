<template>
  <div class="field-value">
    <div class="value-type">
      <el-select size="default" default-first-option v-model="fieldValueType" @change="onValueTypeChange">
        <el-option v-for="opt in fieldValueTypes" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="fieldValueType == FieldValueType.Custom">
        <template
          v-if="fieldType == FieldType.Input || fieldType == FieldType.Radio || fieldType == FieldType.CheckBox || fieldType == FieldType.Select || fieldType == FieldType.Select2">
          <el-input v-model="value" size="default" @change="onInput"></el-input>
        </template>
        <template v-if="fieldType == FieldType.Number">
          <el-input-number v-model="value" size="default" style="width: auto" @change="onInput"></el-input-number>
        </template>
        <template v-if="fieldType == FieldType.TimeStamp">
          <el-date-picker size="default" v-model="value" value-format="x" :format="fieldDef?.format" :type="dateType"
            @change="onInput"></el-date-picker>
        </template>
        <!-- <template v-else-if="fieldType == FieldType.Select || fieldType == FieldType.Radio">
          <el-select size="default" filterable allow-create default-first-option v-model="value" @change="onInput">
            <el-option v-for="opt in fieldDef." :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Select2">
          <el-select size="default" multiple filterable allow-create default-first-option v-model="value"
            @change="onInput">
            <el-option v-for="opt in options" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
          </el-select>
        </template> -->
      </template>
      <template v-if="fieldValueType == FieldValueType.Field">
        <NodeFieldList ref="nodefieldlist" v-model="fieldFieldValue" :nodes="nodes" :field-def="fieldDef"
          :fieldBuildSetting="fieldSetting" @change="onValueChange"></NodeFieldList>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IFormFieldValue, FieldValueType } from "./type";
import { FieldDef, FieldType } from "@eimsnext/models";
import { FieldBuildRule, IFieldBuildSetting, INodeForm } from "../NodeFieldList/type";
import { useLocale } from "element-plus";
import { IFormFieldDef } from "@/FieldList/type";
import { computed, ref } from "vue";
import { IListItem } from "@/list/type";

const { t } = useLocale();

defineOptions({
  name: "FormFieldValue",
});
const props = defineProps<{
  modelValue: IFormFieldValue;
  fieldDef: IFormFieldDef;
  nodes: INodeForm[];
  fieldSetting: IFieldBuildSetting;
  fieldValueChanging?: (oldVal?: IFormFieldDef, newVal?: IFormFieldDef) => boolean;
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
const dateType = computed(() => ((props.fieldDef.type == FieldType.TimeStamp ? props.fieldDef.format : undefined) ?? "yyyy-MM-dd").includes("HH") ? "datetime" : "date");

const emit = defineEmits(["update:modelValue", "change"]);
const onValueTypeChange = () => {
  props.modelValue.type = fieldValueType.value;
  // if (props.modelValue.type == FieldValueType.Field && nodefieldlist.value)
  //   nodefieldlist.value.rebuildValueNodes();

  emitChange();
};
const onInput = () => {
  props.modelValue.value = value.value;

  emitChange();
};
const onValueChange = (oldVal?: IFormFieldDef, newVal?: IFormFieldDef) => {
  console.log("value change", fieldFieldValue.value, props.modelValue.fieldValue)
  if (!props.fieldValueChanging || props.fieldValueChanging(props.modelValue.fieldValue, fieldFieldValue.value)) {
    if (fieldFieldValue.value.field == "")
      delete props.modelValue.fieldValue
    else
      props.modelValue.fieldValue = fieldFieldValue.value;

    emitChange();
  }
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
