<!-- 部门树 -->
<template>
  <AddEditDept v-if="showAddEditDialog" :edit="editMode" :p-dept="selectedDept!" @cancel="showAddEditDialog = false"
    @ok="handleSaved"></AddEditDept>
  <et-confirm-dialog v-model="showDeleteDialog" title="确认要删除吗?" :showNoSave="false" okText="确认"
    @cancel="showDeleteDialog = false" @ok="handleDeleteConfirm">
    确认删除已选中的数据项?
  </et-confirm-dialog>
  <el-card shadow="never" style="border: none;">
    <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable placeholder="请输入" />
    <el-tree ref="deptTreeRef" class="dept-tree mt-2" :data="deptList"
      :props="{ children: 'children', label: 'label', disabled: '' }" :expand-on-click-node="false"
      :filter-node-method="handleFilter" default-expand-all @node-click="handleNodeClick">
      <template #default="{ node, data }">
        <div class="node-data" :title="data.label">
          <div class="node-wrapper">
            <et-icon :icon="data.icon" icon-class="node-icon"></et-icon>
            <span class="node-label">{{ data.label }}</span>
            <div v-if="editable" class="node-action">
              <et-icon icon="el-icon-Plus" class="action-item" @click="handleAddClick(data)" />
              <et-icon icon="el-icon-Edit" class="action-item" @click="handleEditClick(data)" />
              <et-icon icon="el-icon-Delete" class="action-item" @click="handleDeleteClick(data)" />
            </div>
          </div>
        </div>
      </template>
    </el-tree>
  </el-card>
</template>

<script setup lang="ts">
import { Department } from "@eimsnext/models";
import { useDeptStore } from "@eimsnext/store";
import { departmentService } from "@eimsnext/services";
import { ITreeNode, buildDeptTree } from "@eimsnext/components";
import { TreeInstance } from "element-plus";

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
});

const deptStore = useDeptStore();
const deptList = ref<ITreeNode[]>(); // 部门列表
const deptTreeRef = ref<TreeInstance>(); // 部门树
const keyword = ref(); // 部门名称
const selectedDept = ref<Department>();
const showAddEditDialog = ref(false);
const editMode = ref(false);
const showDeleteDialog = ref(false);

const emit = defineEmits(["node-click"]);

watch(keyword, (val) => {
  deptTreeRef.value!.filter(val);
});

onBeforeMount(() => {
  deptStore.load().then((data: Department[]) => {
    deptList.value = buildDeptTree(data);
  });
});

/**
 * 部门筛选
 */
const handleFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }
  return data.label.indexOf(value) !== -1;
};

/** 部门树节点 Click */
const handleNodeClick = (data: ITreeNode) => {
  selectedDept.value = data.data;
  emit("node-click", data.data);
};

const handleAddClick = (data: ITreeNode) => {
  editMode.value = false;
  selectedDept.value = data.data;
  showAddEditDialog.value = true;
};

const handleEditClick = (data: ITreeNode) => {
  editMode.value = true;
  selectedDept.value = data.data;
  showAddEditDialog.value = true;
};
const handleSaved = (data: Department) => {
  showAddEditDialog.value = false;
  deptStore.load().then((depts: Department[]) => {
    deptList.value = buildDeptTree(depts);
  });
};
const handleDeleteClick = (data: ITreeNode) => {
  selectedDept.value = data.data;
  if (selectedDept.value) showDeleteDialog.value = true;
};
const handleDeleteConfirm = async () => {
  await departmentService.delete(selectedDept.value?.id!);

  deptStore.remove(selectedDept.value?.id!);
  showDeleteDialog.value = false;
};
</script>
<style scoped lang="scss">
// 去掉el-card的边框
:deep(.el-card) {
  border: none;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 搜索框样式
.search-input {
  margin-bottom: 8px;
}

// 部门树样式
.dept-tree {
  flex: 1;
  overflow-x: auto; // 启用横向滚动
  overflow-y: auto; // 启用纵向滚动
  min-height: 0; // 解决flex子元素高度问题

  // 确保节点内容不会被截断
  :deep(.el-tree-node) {
    min-width: 100%;
    white-space: nowrap;
  }

  // 调整节点内容样式
  :deep(.el-tree-node__content) {
    min-width: 100%;
  }
}

.node-data {
  // 确保整个节点区域都能触发hover效果
  width: 100%;
  display: flex;
  align-items: center;
}

.node-wrapper {
  // 设置相对定位，作为.node-action的定位基准
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;

  .node-label {
    // 移除固定的margin-right，改为flex布局自动分配空间
    flex: 1;
    padding-left: 5px;
  }

  .node-action {
    // 调整绝对定位，确保和部门名称在同一行
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    white-space: nowrap;

    .action-item {
      margin-right: 5px;
      cursor: pointer;

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        color: #409eff;
      }
    }
  }

  // 确保整个.node-wrapper都能触发hover效果
  &:hover {
    .node-action {
      display: flex;
      align-items: center;
    }
  }
}
</style>
