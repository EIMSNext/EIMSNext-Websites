<template>
  <el-tree-select
    v-model="selectedNodeId"
    :data="nodeList"
    :props="selectProps"
    :render-after-expand="true"
    node-key="id"
    :default-expanded-keys="defaultExpand"
    filterable
    clearable
    :filter-node-method="filterNode"
    placeholder="请选择字段"
    :loading="loading"
  >
    <template #default="{ data }">
      <span>{{ data.label }}</span>
    </template>
  </el-tree-select>
</template>

<script setup lang="ts">
import { useFormStore, useContextStore } from "@eimsnext/store";
import { FieldBuildRule, IFieldBuildSetting, INodeForm } from "./type";
import { FilterNodeMethodFunction, TreeNodeData } from "element-plus";
import { IFormFieldDef, getFieldIcon, toFormFieldDef } from "@/FieldList/type";
import { ref, toRef, watch, computed, onMounted } from "vue";
import { ITreeNode, TreeNodeType, findNode } from "@/common";
import { FieldType } from "@eimsnext/models";

defineOptions({
  name: "FormFieldSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue: IFormFieldDef;
    fieldBuildSetting: IFieldBuildSetting; //可能将来会用到
  }>(),
  {}
);

const emit = defineEmits(["update:modelValue", "change"]);

const selectProps = computed(() => ({
  value: "id",
  label: 'displayLabel',
  children: 'children',
  disabled: (data: ITreeNode) => data.nodeType === TreeNodeType.Form
}));

const buildSetting = toRef(props.fieldBuildSetting)
const formStore = useFormStore();
const contextStore = useContextStore();
const nodeList = ref<ITreeNode[]>([]);
const defaultExpand = ref<string[]>([]);
const selectedNodeId = ref<string>();
const loading = ref(false);
const appId = computed(() => contextStore.appId);

// 辅助函数：构建节点ID
const buildNodeId = (formId: string, field: string) => `${formId}-${field}`;

// 辅助函数：查找节点
const findNodeById = (nodeId: string) => findNode(nodeList.value, nodeId);

// 辅助函数：从节点获取表单字段数据
const getFieldDefFromNode = (node: ITreeNode | null): IFormFieldDef => {
  if (!node) {
    return { formId: "", field: "", label: "", type: FieldType.None };
  }
  
  // 如果是字段节点，node.data 应该是 IFormFieldDef 类型
  if (node.nodeType === TreeNodeType.Field) {
    const fieldData = node.data as IFormFieldDef;
    return {
      formId: fieldData.formId || "",
      field: fieldData.field || "",
      label: node.displayLabel || fieldData.label || "",
      type: node.data.type || FieldType.None
    };
  }
  
  // 如果是表单节点或其它节点，返回空值
  return { formId: "", field: "", label: "", type: FieldType.None };
};

// 辅助函数：从节点ID解析表单ID和字段名
const parseNodeId = (nodeId: string): { formId: string; field: string } => {
  const parts = nodeId.split('-');
  if (parts.length >= 2) {
    return {
      formId: parts[0],
      field: parts.slice(1).join('-') // 处理字段名中可能包含'-'的情况
    };
  }
  return { formId: "", field: "" };
};

// 处理内部选择
const handleInternalSelect = (nodeId: string | undefined) => {
  if (!nodeId) {
    emit("update:modelValue", { formId: "", field: "", label: "" });
    emit("change", { formId: "", field: "", label: "" });
    return;
  }
  
  const node = findNodeById(nodeId);
  if (!node || node.nodeType !== TreeNodeType.Field) {
    emit("update:modelValue", { formId: "", field: "", label: "" });
    emit("change", { formId: "", field: "", label: "" });
    return;
  }
  
  // 从节点ID解析表单ID和字段名（更可靠的方式）
  const { formId, field } = parseNodeId(nodeId);
  const label = node.displayLabel || node.label || "";
  
  const fieldDef: IFormFieldDef = {
    formId,
    field,
    label,
    type: node.data.type || FieldType.None
  };
  
  console.log('内部选择:', { nodeId, node, fieldDef });
  
  emit("update:modelValue", fieldDef);
  emit("change", fieldDef);
};

// 处理外部更新
const handleExternalUpdate = (fieldDef: IFormFieldDef) => {
  if (!fieldDef?.formId || !fieldDef?.field) {
    if (selectedNodeId.value) {
      selectedNodeId.value = undefined;
    }
    return;
  }
  
  const targetNodeId = buildNodeId(fieldDef.formId, fieldDef.field);
  
  if (selectedNodeId.value === targetNodeId) {
    return; // 已经是选中状态，避免不必要的更新
  }
  
  // 如果树数据已加载，立即查找
  if (nodeList.value.length > 0) {
    const foundNode = findNodeById(targetNodeId);
    selectedNodeId.value = foundNode?.id;
    return;
  }
  
  // 如果树数据未加载，延迟设置
  setTimeout(() => {
    if (nodeList.value.length > 0) {
      const foundNode = findNodeById(targetNodeId);
      selectedNodeId.value = foundNode?.id;
    }
  }, 100);
};

const filterNode: FilterNodeMethodFunction = (value: string, data: TreeNodeData) => {
  if (!value) return true;
  
  const node = data as unknown as Record<string, any>;
  const searchValue = value.toLowerCase();
  
  return [node.label, node.displayLabel].some(
    text => text && typeof text === 'string' && text.toLowerCase().includes(searchValue)
  );
};

async function buildTree(): Promise<ITreeNode[]> {
  try {
    const forms = await formStore.load(`$filter=appId eq '${appId.value}'`, false);
    const treeNodes: ITreeNode[] = [];
    
    forms.forEach(form => {
      const formNode: ITreeNode = {
        id: form.id,
        code: form.id,
        label: form.name,
        displayLabel: form.name,
        nodeType: TreeNodeType.Form,
        children: [],
        data: form
      };

      const fields = form.content?.items || [];
      
      fields.forEach(field => {
        if (field.type === FieldType.TableForm && field.columns) {
          field.columns.forEach(subField => {
            const fieldDef = toFormFieldDef(form.id, subField, field, form.id, !form.isLedger);
            formNode.children?.push(createFieldNode(form, fieldDef));
          });
        } else {
          const fieldDef = toFormFieldDef(form.id, field, undefined, form.id, !form.isLedger);
          formNode.children?.push(createFieldNode(form, fieldDef));
        }
      });
      
      treeNodes.push(formNode);
    });

    return treeNodes;
  } catch (error) {
    console.error("构建表单树失败:", error);
    return [];
  }
}

// 辅助函数：创建字段节点
const createFieldNode = (form: any, fieldDef: IFormFieldDef): ITreeNode => ({
  id: buildNodeId(form.id, fieldDef.field),
  code: fieldDef.field,
  displayLabel: `${form.name}-${fieldDef.label}`,
  label: fieldDef.label,
  nodeType: TreeNodeType.Field,
  children: [],
  data: fieldDef, // 这里保存完整的 fieldDef 对象
  icon: getFieldIcon(fieldDef.type)
});

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const data = await buildTree();
    nodeList.value = data;
    
    // 设置默认展开
    defaultExpand.value = data
      .filter(x => x.nodeType === TreeNodeType.Form)
      .map(x => x.id);
    
    // 树加载完成后，如果有外部值，设置选中
    handleExternalUpdate(props.modelValue);
  } catch (error) {
    console.error("加载表单树失败:", error);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载
onMounted(() => {
  loadData();
});

// 监听内部选择变化
watch(selectedNodeId, (newNodeId) => {
  handleInternalSelect(newNodeId);
});

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    handleExternalUpdate(newVal);
  },
  { immediate: true }
);

// 监听nodeList变化，确保在树加载完成后设置初始值
watch(
  () => nodeList.value,
  (newList) => {
    if (newList.length > 0) {
      handleExternalUpdate(props.modelValue);
    }
  }
);

// 监听buildSetting变化，重新加载
watch(
  () => buildSetting.value,
  () => {
    loadData();
  },
  { deep: true }
);
</script>