<template>
  <div class="field-item">
    <div class="field-name">
      <el-input :value="field.label" :title="field.label" size="default"></el-input>
    </div>
    <div class="field-op">=</div>
    <FormFieldValue :fieldDef="field" v-model="value" :nodes="nodes" :fieldSetting="fieldSetting"
      :fieldValueChanging="fieldValueChanging" @change="onInput">
    </FormFieldValue>
    <div v-if="removable" class="ml-[5px]" style="align-content: center">
      <et-icon icon="el-icon-delete" class="pointer" @click="onRemove"></et-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { FieldBuildRule, IFieldBuildSetting, INodeForm } from "../NodeFieldList/type";
import { IFormFieldItem, FieldValueType, IFormFieldList } from "./type";
import { useLocale } from "element-plus";
import { IFormFieldDef } from "@/FieldSelect/type";
import { FieldType } from "@eimsnext/models";
const { t } = useLocale();

defineOptions({
  name: "FormFieldItem",
});

const props = defineProps<{
  modelValue: IFormFieldItem;
  nodes: INodeForm[];
  fieldSetting: IFieldBuildSetting;
  removable?: boolean;
  fieldValueChanging?: (field: IFormFieldDef, oldVal?: IFormFieldDef, newVal?: IFormFieldDef) => Promise<boolean>;
}>();

const field = ref(props.modelValue.field);
const value = ref(props.modelValue.value);

const emit = defineEmits(["update:modelValue", "change", "remove"]);

const onRemove = () => {
  emit("remove", props.modelValue);
};

const onInput = () => {
  emitChange();
};

// watch(() => props.fieldItems, (newVal) => {
//   console.log("field mapping1111", newVal)
//   let mapping: Record<string, IFormFieldDef> = {}
//   newVal.items.forEach(x => {
//     if (x.value.type == FieldValueType.Field && x.value.fieldValue && x.value.fieldValue.isSubField) {
//       if (x.field.isSubField && !mapping[x.field.field]) {
//         mapping[x.field.field] = x.value.fieldValue
//       }
//       else if (!mapping["master"]) {
//         mapping["master"] = x.value.fieldValue
//       }
//     }
//   })
//   console.log("field mapping", mapping)
//   fieldSetting.value.fieldMapping = mapping
// })

const emitChange = () => {
  let newModel = { field: field.value, value: value.value };
  if (value.value.type == FieldValueType.Custom && (field.value.type == FieldType.DepartmentSelect ||
    field.value.type == FieldType.EmployeeSelect) && Array.isArray(value.value.value)
  ) {
    newModel.value = value.value.value[0]
  }
  emit("update:modelValue", newModel);
  emit("change", newModel);
};
</script>
<style lang="scss" scoped>
.field-item {
  border: 1px dashed #eee;
  background: #fcfcfc;
  padding: 10px;
  border-radius: 3px;
  display: flex;

  .field-name {
    margin-right: 5px;
    width: 120px;
  }

  .field-op {
    margin-right: 5px;
    align-content: center;
  }
}
</style>
