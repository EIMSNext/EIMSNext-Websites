<template>
  <el-select
    v-model="selectedFieldId"
    filterable
    clearable
    placeholder="请选择字段"
    :loading="loading"
    @change="handleChange"
  >
    <el-option
      v-for="field in fields"
      :key="field.id"
      :label="field.label"
      :value="field.id"
    >
      <span>{{ field.label }}</span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { IFormFieldDef, toFormFieldDef } from "@/FieldList/type";
import { ref, watch, computed, onMounted } from "vue";
import { FieldType } from "@eimsnext/models";

defineOptions({
  name: "FormFieldSelect",
});

interface IFieldOption {
  id: string;
  label: string;
  fieldDef: IFormFieldDef;
}

const props = withDefaults(
  defineProps<{
    modelValue: IFormFieldDef;
    formId: string; // 当前选择的表单ID
  }>(),
  {
    modelValue: () => ({
      formId: "",
      field: "",
      label: "",
      type: FieldType.None
    }),
    formId: ""
  }
);

const emit = defineEmits(["update:modelValue", "change"]);

const formStore = useFormStore();
const fields = ref<IFieldOption[]>([]);
const selectedFieldId = ref<string>();
const loading = ref(false);

// 辅助函数：构建字段ID
const buildFieldId = (formId: string, field: string) => `${formId}-${field}`;

// 辅助函数：从字段ID解析表单ID和字段名
const parseFieldId = (fieldId: string): { formId: string; field: string } => {
  const parts = fieldId.split('-');
  if (parts.length >= 2) {
    return {
      formId: parts[0],
      field: parts.slice(1).join('-') // 处理字段名中可能包含'-'的情况
    };
  }
  return { formId: "", field: "" };
};

// 加载指定表单的字段
const loadFields = async () => {
  if (!props.formId) {
    fields.value = [];
    selectedFieldId.value = undefined;
    return;
  }
  
  try {
    loading.value = true;
    // 加载指定表单
    const form = await formStore.get(props.formId);
    
    if (!form) {
      fields.value = [];
      selectedFieldId.value = undefined;
      return;
    }
    
    const fieldOptions: IFieldOption[] = [];
    const formFields = form.content?.items || [];
    
    // 遍历表单中的所有字段
    formFields.forEach(field => {
      if (field.type === FieldType.TableForm && field.columns) {
        // 如果是子表单，遍历子表单的列
        field.columns.forEach(subField => {
          const fieldDef = toFormFieldDef(form.id, subField, field, form.id, !form.isLedger);
          fieldOptions.push({
            id: buildFieldId(form.id, fieldDef.field),
            label: fieldDef.label,
            fieldDef
          });
        });
      } else {
        // 普通字段
        const fieldDef = toFormFieldDef(form.id, field, undefined, form.id, !form.isLedger);
        fieldOptions.push({
          id: buildFieldId(form.id, fieldDef.field),
          label: fieldDef.label,
          fieldDef
        });
      }
    });
    
    fields.value = fieldOptions;
    
    // 如果有外部值，设置选中
    if (props.modelValue?.formId && props.modelValue?.field) {
      const targetFieldId = buildFieldId(props.modelValue.formId, props.modelValue.field);
      selectedFieldId.value = targetFieldId;
    }
  } catch (error) {
    console.error("加载表单字段失败:", error);
    fields.value = [];
    selectedFieldId.value = undefined;
  } finally {
    loading.value = false;
  }
};

// 处理选择变化
const handleChange = (fieldId: string) => {
  if (!fieldId) {
    emit("update:modelValue", {
      formId: "",
      field: "",
      label: "",
      type: FieldType.None
    });
    emit("change", {
      formId: "",
      field: "",
      label: "",
      type: FieldType.None
    });
    return;
  }
  
  const selectedField = fields.value.find(field => field.id === fieldId);
  if (selectedField) {
    emit("update:modelValue", selectedField.fieldDef);
    emit("change", selectedField.fieldDef);
  }
};

// 处理外部modelValue变化
const handleExternalUpdate = (fieldDef: IFormFieldDef) => {
  if (!fieldDef?.formId || !fieldDef?.field) {
    if (selectedFieldId.value) {
      selectedFieldId.value = undefined;
    }
    return;
  }
  
  const targetFieldId = buildFieldId(fieldDef.formId, fieldDef.field);
  
  if (selectedFieldId.value !== targetFieldId) {
    selectedFieldId.value = targetFieldId;
  }
};

// 组件挂载时加载字段
onMounted(() => {
  loadFields();
});

// 监听表单ID变化，重新加载字段
watch(
  () => props.formId,
  (newFormId, oldFormId) => {
    if (newFormId !== oldFormId) {
      // 清空当前选择
      selectedFieldId.value = undefined;
      // 重新加载字段列表
      loadFields();
    }
  }
);

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    handleExternalUpdate(newVal);
  },
  { immediate: true }
);
</script>