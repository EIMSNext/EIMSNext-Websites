<template>
  <div class="field-item">
    <div class="field-name">
      <el-input :value="field.label" :title="field.label" size="default"></el-input>
    </div>
    <div class="field-op">=</div>
    <FormFieldValue :fieldDef="field" v-model="value" :nodes="nodes" @change="onInput"></FormFieldValue>
    <div v-if="removable" class="ml-[5px]" style="align-content: center">
      <et-icon icon="el-icon-delete" class="pointer" @click="onRemove"></et-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { INodeForm } from "../NodeFieldList/type";
import FormFieldValue from "./FormFieldValue.vue";
import { IFormFieldItem, FieldValueType } from "./type";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "FormFieldItem",
});

const props = defineProps<{
  modelValue: IFormFieldItem;
  nodes: INodeForm[];
  removable?: boolean;
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
const emitChange = () => {
  let newModel = { field: field.value, value: value.value };
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
