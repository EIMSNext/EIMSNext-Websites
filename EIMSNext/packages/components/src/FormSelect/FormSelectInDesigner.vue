<template>
  <el-select v-model="selectedFormId" filterable clearable placeholder="请选择表单" :loading="loading"
    @change="handleChange">
    <el-option v-for="option in formOptions" :key="option.value" :label="option.label" :value="option.value">
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
  name: "FormSelectInDesigner",
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

    // 从URL中取当前表单id
    let currentFormId = '';

    // 处理哈希路由，从哈希路径中提取表单ID（如 #/app/xxx/form/xxx）
    const hash = window.location.hash;
    const formIdRegex = /\/form\/([^/]+)/;
    const match = hash.match(formIdRegex);

    if (match && match[1]) {
      // 从哈希路径中提取表单ID
      currentFormId = match[1];
    } else {
      // 尝试从查询参数中获取，兼容传统URL
      const urlObj = new URL(window.location.href);
      currentFormId = urlObj.searchParams.get('id') || '';
    }

    // 加载所有表单数据
    const forms = await formStore.load(`$filter=appId eq '${appId.value}'`, false);

    // 循环过滤表单，排除当前表单
    const options: IFormOption[] = [];
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      // 如果循环中的项的表单id不等于当前表单id，就添加到下拉框里
      if (form.id !== currentFormId) {
        options.push({
          value: form.id,
          label: form.name,
          data: form
        });
      }
    }

    // 更新表单选项
    formOptions.value = options;
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