<template>
  <div class="field-item">
    <div class="field-name">
      <el-input
        :value="field.label"
        :title="field.label"
        size="default"
      ></el-input>
    </div>
    <div class="field-op">=</div>
    <FormFieldValue
      :fieldDef="field"
      v-model="value"
      :nodes="nodes"
      :fieldSetting="fieldSetting"
      :fieldValueChanging="fieldValueChanging"
      @change="onInput"
    >
    </FormFieldValue>
    <div v-if="removable" class="remove-action">
      <et-icon icon="el-delete" class="pointer" @click="onRemove"></et-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {
  FieldBuildRule,
  IFieldBuildSetting,
  INodeForm,
} from "../NodeFieldList/type";
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
  fieldValueChanging?: (
    field: IFormFieldDef,
    oldVal?: IFormFieldDef,
    newVal?: IFormFieldDef,
  ) => Promise<boolean>;
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
  if (
    value.value.type == FieldValueType.Custom &&
    (field.value.type == FieldType.Department1 ||
      field.value.type == FieldType.Employee1) &&
    Array.isArray(value.value.value)
  ) {
    newModel.value = value.value.value[0];
  }
  emit("update:modelValue", newModel);
  emit("change", newModel);
};
</script>
<style lang="scss" scoped>
.field-item {
  border: 1px dashed var(--et-border-color-light);
  background: var(--et-bg-container);
  padding: var(--et-space-10);
  border-radius: var(--et-radius-3);
  display: flex;

  .field-name {
    margin-right: var(--et-space-5);
    width: var(--et-size-120);
  }

  .field-op {
    margin-right: var(--et-space-5);
    align-content: center;
  }
}

.remove-action {
  margin-left: var(--et-space-5);
  align-content: center;
}
</style>
