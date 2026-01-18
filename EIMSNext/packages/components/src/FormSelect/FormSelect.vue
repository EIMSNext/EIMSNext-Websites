<template>
  <el-select
    v-model="selectedFormId"
    filterable
    clearable
    placeholder="请选择表单"
    :loading="loading"
    @change="handleChange"
  >
    <el-option
      v-for="option in formOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      <span>{{ option.label }}</span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { useFormStore, useContextStore } from "@eimsnext/store";
import { ref, watch, computed, onMounted } from "vue";

interface IFormOption {
  value: string;
  label: string;
  data: any;
}

defineOptions({
  name: "FormSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue: string;
  }>(),
  {
    modelValue: ""
  }
);

const emit = defineEmits(["update:modelValue", "change"]);

const formStore = useFormStore();
const contextStore = useContextStore();
const formOptions = ref<IFormOption[]>([]);
const selectedFormId = ref<string>(props.modelValue);
const loading = ref(false);
const appId = computed(() => contextStore.appId);

// 加载表单数据
const loadForms = async () => {
  try {
    loading.value = true;
    const forms = await formStore.load(`$filter=appId eq '${appId.value}'`, false);
    formOptions.value = forms.map(form => ({
      value: form.id,
      label: form.name,
      data: form
    }));
  } catch (error) {
    console.error("加载表单失败:", error);
    formOptions.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理选择变化
const handleChange = (formId: string) => {
  const selectedForm = formOptions.value.find(option => option.value === formId);
  emit("update:modelValue", formId);
  emit("change", selectedForm);
};

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (selectedFormId.value !== newVal) {
      selectedFormId.value = newVal;
    }
  },
  { immediate: true }
);

// 组件挂载时加载数据
onMounted(() => {
  loadForms();
});
</script>