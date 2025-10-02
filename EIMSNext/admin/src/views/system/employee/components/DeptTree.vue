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
  <el-card shadow="never">
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
            <el-icon class="node-icon"><UserFilled /></el-icon>
            <span class="node-label">{{ data.label }}</span>
            <div v-if="editable" class="node-action">
              <el-icon class="action-item" @click="handleAddClick(data)"><Plus /></el-icon>
              <el-icon class="action-item" @click="handleEditClick(data)"><Edit /></el-icon>
              <el-icon class="action-item" @click="handleDeleteClick(data)"><Delete /></el-icon>
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
import AddEditDept from "./AddEditDept.vue";

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
});

const deptStore = useDeptStore();
const deptList = ref<ITreeNode[]>(); // 部门列表
const deptTreeRef = ref(ElTree); // 部门树
const keyword = ref(); // 部门名称
const selectedDept = ref<Department>();
const showAddEditDialog = ref(false);
const editMode = ref(false);
const showDeleteDialog = ref(false);

const emits = defineEmits(["node-click"]);

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
  emits("node-click", data.data);
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
.node-wrapper {
  .node-label {
    margin-right: 55px;
  }
  .node-action {
    position: absolute;
    right: 0px;
    display: none;

    .action-item {
      margin-right: 5px;
      &:last-child {
        margin-right: 0;
      }
      &:hover {
        color: #409eff;
      }
    }
  }

  &:hover {
    .node-action {
      display: block;
    }
  }
}
</style>
