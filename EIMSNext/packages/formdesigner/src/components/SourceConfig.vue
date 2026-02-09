<template>
  <div class="source-config">
    <!-- 表单选择 -->
    <div class="form-select-item">
      <div class="el-form-item__label"><span>{{ t('props.form') }}</span></div>
      <form-select v-model="source.formId" :appId="contextStore.appId" :options="{ exclude: [formId] }"
        @change="onFormChange" />
    </div>

    <!-- Label字段选择 -->
    <div class="field-select-item">
      <div class="el-form-item__label"><span>{{ t('props.labelField') }}</span></div>
      <form-field-select v-model="source.label" :form-id="source.formId" />
    </div>

    <!-- Value字段选择 -->
    <div class="field-select-item">
      <div class="el-form-item__label"><span>{{ t('props.valueField') }}</span></div>
      <form-field-select v-model="source.value" :form-id="source.formId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, inject } from "vue";
import { IFormFieldDef, IFormItem } from "@eimsnext/components";
import { FieldType } from "@eimsnext/models";
import { useContextStore } from "@eimsnext/store"

interface ISourceConfig {
  formId: string;
  label: IFormFieldDef;
  value: IFormFieldDef;
}

defineOptions({
  name: "SourceConfig",
});

const props = defineProps<{
  modelValue: ISourceConfig;
  fieldBuildSetting: any;
}>();

const emit = defineEmits(["update:modelValue", "change"]);

const designer: any = inject('designer');
const t = computed(() => designer.setupState.t);
const formId = computed(() => designer.setupState.formId);
const contextStore = useContextStore()

const source = ref<ISourceConfig>({
  formId: props.modelValue?.formId || '',
  label: {
    formId: props.modelValue?.formId || '',
    field: props.modelValue?.label?.field || '',
    label: props.modelValue?.label?.label || '',
    type: props.modelValue?.label?.type || ''
  },
  value: {
    formId: props.modelValue?.formId || '',
    field: props.modelValue?.value?.field || '',
    label: props.modelValue?.value?.label || '',
    type: props.modelValue?.value?.type || ''
  }
});

// 监听表单变化，更新label和value的formId，并清空之前的选择

const onFormChange = (form: IFormItem) => {
  // console.log("form...", form)
  if (form) {
    source.value.formId = form.id
    // 清空之前选择的label和value字段
    source.value.label = {
      formId: form.id,
      field: '',
      label: '',
      type: FieldType.None
    };
    source.value.value = {
      formId: form.id,
      field: '',
      label: '',
      type: FieldType.None
    };
    emitChange();
  }
};

// 监听source变化，通知父组件
const emitChange = () => {
  emit("update:modelValue", source.value);
  emit("change", source.value);
};

// 监听label变化
watch(() => source.value.label, () => {
  emitChange();
}, { deep: true });

// 监听value变化
watch(() => source.value.value, () => {
  emitChange();
}, { deep: true });

// 监听外部modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    source.value = {
      formId: newVal.formId || '',
      label: newVal.label || {
        formId: '',
        field: '',
        label: '',
        type: ''
      },
      value: newVal.value || {
        formId: '',
        field: '',
        label: '',
        type: ''
      }
    };
  }
}, { deep: true, immediate: true });
</script>

<style scoped>
.source-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-select-item,
.field-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-form-item__label {
  width: 80px;
  text-align: right;
  margin-right: 8px;
}
</style>
