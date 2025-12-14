<template>
  <el-tree-select
    v-model="selectedNode"
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
    fieldBuildSetting: IFieldBuildSetting;
    nodes: INodeForm[];
    fieldDef?: IFormFieldDef;
  }>(),
  {}
);

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
const selectedNode = ref<string>();
const loading = ref(false);
const appId = computed(() => contextStore.appId);

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const data = await buildTree();
    nodeList.value = data;
    
    // 设置默认展开
    if (data.length > 1) {
      data.forEach((x) => {
        if (x.nodeType === TreeNodeType.Form) {
          defaultExpand.value.push(x.id);
        }
      });
    }
    
    // 如果有初始值，设置选中
    if (props.modelValue?.nodeId && props.modelValue?.field) {
      const nodeId = `${props.modelValue.nodeId}-${props.modelValue.field}`;
      const foundNode = findNode(data, nodeId);
      if (foundNode) {
        selectedNode.value = foundNode.id;
      }
    }
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

const filterNode: FilterNodeMethodFunction = (value: string, data: TreeNodeData) => {
  if (!value) return true;
  
  // 安全的类型处理
  const node = data as unknown as Record<string, any>;
  
  // 转换为小写进行不区分大小写的搜索
  const searchValue = value.toLowerCase();
  
  // 检查 label
  if (node.label && typeof node.label === 'string') {
    if (node.label.toLowerCase().includes(searchValue)) {
      return true;
    }
  }
  
  // 检查 displayLabel
  if (node.displayLabel && typeof node.displayLabel === 'string') {
    if (node.displayLabel.toLowerCase().includes(searchValue)) {
      return true;
    }
  }
  
  return false;
};

async function buildTree(): Promise<ITreeNode[]> {
  try {
    const forms = await formStore.load(`$filter=appId eq '${appId.value}'`, false);
    const treeNodes: ITreeNode[] = [];
    console.log('forms 数据:', forms); // 添加这行，看返回了几个表单
    console.log('forms 数量:', forms?.length);
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
            const fieldNode: ITreeNode = {
              id: `${form.id}-${fieldDef.field}`,
              code: fieldDef.field,
              displayLabel: `${form.name}-${fieldDef.label}`,
              label: fieldDef.label,
              nodeType: TreeNodeType.Field,
              children: [],
              data: fieldDef,
              icon: getFieldIcon(fieldDef.type)
            };
            formNode.children?.push(fieldNode);
          });
        } else {
          const fieldDef = toFormFieldDef(form.id, field, undefined, form.id, !form.isLedger);
          const fieldNode: ITreeNode = {
            id: `${form.id}-${fieldDef.field}`,
            code: fieldDef.field,
            displayLabel: `${form.name}-${fieldDef.label}`,
            label: fieldDef.label,
            nodeType: TreeNodeType.Field,
            children: [],
            data: fieldDef,
            icon: getFieldIcon(fieldDef.type)
          };
          formNode.children?.push(fieldNode);
        }
      });
      console.log('form load: ' + formNode.label);
      treeNodes.push(formNode);
    });

    return treeNodes;
  } catch (error) {
    console.error("构建表单树失败:", error);
    return [];
  }
}

const emit = defineEmits(["update:modelValue", "change"]);

// 监听 selectedNode 变化
watch(selectedNode, (newNode) => {
  let data = {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  };
  if(newNode)
  {
      var node = findNode(nodeList.value, newNode);
      if(node)
      {
        data.nodeId = node.id;
        data.formId = node.data.formId;
        data.field = node.data.field;
        data.label = node.data.label;
        data.type = node.data.type;
      }
    }
  console.log('newNode:', newNode);
  console.log('node:', node);
  console.log("data:", data);
  
  // 只有当数据实际发生变化时才触发更新，避免死循环
  if (props.modelValue?.nodeId !== data.nodeId) {
    emit("update:modelValue", data);
    emit("change", data);
  }
});

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal?.nodeId && nodeList.value.length > 0) {
      const nodeId = `${newVal.nodeId}-${newVal.field}`;
      const foundNode = findNode(nodeList.value, nodeId);
      if (foundNode) {
        // 只有当选中的节点ID实际发生变化时才更新，避免死循环
        if (selectedNode.value !== foundNode.id) {
          selectedNode.value = foundNode.id;
        }
      }
    }
  },
  { immediate: true }
);

// 监听 buildSetting 变化，重新加载
watch(
  () => buildSetting.value,
  () => {
    loadData();
  },
  { deep: true }
);
</script>