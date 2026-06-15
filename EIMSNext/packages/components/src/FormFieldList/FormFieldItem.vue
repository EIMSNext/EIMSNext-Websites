<template>
  <div class="field-item" :class="{ invalid: !!displayError }">
    <div class="field-name" :class="{ missing: field.missing }">
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
      :sibling-fields="siblingFields"
      @change="onInput"
    >
    </FormFieldValue>
    <div v-if="removable" class="remove-action">
      <et-icon icon="el-delete" class="pointer" @click="onRemove"></et-icon>
    </div>
  </div>
  <div v-if="displayError" class="field-error">{{ displayError }}</div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
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
  siblingFields?: IFormFieldItem[];
  errorMessage?: string;
  fieldValueChanging?: (
    field: IFormFieldDef,
    oldVal?: IFormFieldDef,
    newVal?: IFormFieldDef,
  ) => Promise<boolean>;
}>();

const field = ref(props.modelValue.field);
const value = ref(props.modelValue.value);
const displayError = computed(() => props.errorMessage || (field.value.missing ? t("dataflow.deletedField") : ""));

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

.field-item.invalid {
  border-color: var(--et-color-danger);
}

.field-name.missing {
  :deep(.el-input__inner) {
    color: var(--et-color-danger);
  }
}

.field-error {
  color: var(--et-color-danger);
  font-size: 12px;
  margin-top: 4px;
}

.remove-action {
  margin-left: var(--et-space-5);
  align-content: center;
}
</style>
