<!-- 部门树 -->
<template>
  <AddEditDept
    v-if="showAddEditDialog"
    :edit="editMode"
    :p-dept="selectedDept!"
    @cancel="showAddEditDialog = false"
    @ok="handleSaved"
  ></AddEditDept>
  <et-confirm-dialog
    v-model="showDeleteDialog"
    title="确认要删除吗?"
    :showNoSave="false"
    okText="确认"
    @cancel="showDeleteDialog = false"
    @ok="handleDeleteConfirm"
  >
    确认删除已选中的数据项?
  </et-confirm-dialog>
  <el-card shadow="never" class="dept-card">
    <el-input
      v-model="keyword"
      class="search-input"
      prefix-icon="Search"
      clearable
      placeholder="请输入"
    />
    <el-tree
      ref="deptTreeRef"
      class="dept-tree mt-2"
      :data="deptList"
      :props="{ children: 'children', label: 'label', disabled: '' }"
      :expand-on-click-node="false"
      :filter-node-method="handleFilter"
      default-expand-all
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="node-data" :title="data.label">
          <div class="node-wrapper">
            <et-icon :icon="data.icon" icon-class="node-icon"></et-icon>
            <span class="node-label">{{ data.label }}</span>
            <div v-if="editable" class="node-action">
              <et-icon icon="el-Plus" class="action-item" @click="handleAddClick(data)" />
              <et-icon icon="el-Edit" class="action-item" @click="handleEditClick(data)" />
              <et-icon
                icon="el-Delete"
                v-if="data.data.parentId"
                class="action-item"
                @click="handleDeleteClick(data)"
              />
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
  if (selectedDept.value && selectedDept.value.parentId) showDeleteDialog.value = true;
};
const handleDeleteConfirm = async () => {
  await departmentService.delete(selectedDept.value?.id!);

  deptStore.remove(selectedDept.value?.id!);
  departmentService.query<Department>().then((depts: Department[]) => {
    deptList.value = buildDeptTree(depts);
    deptStore.load().then();
  });
  showDeleteDialog.value = false;
};
</script>
<style scoped lang="scss">
.dept-card {
  border: none;
}

:deep(.el-card) {
  border: none;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: var(--et-size-300);
  padding: 0;
}

.search-input {
  margin-bottom: var(--et-space-8);
}

.dept-tree {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-height: 100%;

  :deep(.el-tree-node) {
    white-space: nowrap;
  }

  :deep(.el-tree-node__content) {
    white-space: nowrap;
  }

  :deep(.el-tree) {
    min-width: 100%;
    height: 100%;
  }

  :deep(.el-tree-node__expand-icon) {
    flex-shrink: 0;
  }

  :deep(.el-tree-node__content) {
    flex-shrink: 0;
  }
}

.node-data {
  width: 100%;
  display: flex;
  align-items: center;
}

.node-wrapper {
  width: 100%;
  display: flex;
  align-items: center;

  .node-label {
    flex: 1;
    padding-left: var(--et-space-5);
    white-space: nowrap;
  }

  .node-action {
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: var(--et-space-10);
    pointer-events: none;
    display: none;
    align-items: center;

    .action-item {
      margin-right: var(--et-space-5);
      cursor: pointer;

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        color: var(--et-color-primary);
      }
    }
  }

  &:hover {
    .node-action {
      display: flex;
    }
  }
}
</style>
