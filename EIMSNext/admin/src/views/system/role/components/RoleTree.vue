<!-- 部门树 -->
<template>
  <AddEditRoleGroup v-if="showAddEditGroupDialog" :edit="editMode" :p-group="currentGroup"
    @cancel="showAddEditGroupDialog = false" @ok="handleGroupSaved"></AddEditRoleGroup>
  <AddEditRole v-if="showAddEditRoleDialog" :edit="editMode" :p-group="currentGroup!" :p-role="selectedRole"
    @cancel="showAddEditRoleDialog = false" @ok="handleRoleSaved"></AddEditRole>
  <et-confirm-dialog v-model="showDeleteDialog" title="确认要删除吗?" :showNoSave="false" okText="确认"
    @cancel="showDeleteDialog = false" @ok="handleDeleteConfirm">
    确认删除已选中的数据项?
  </et-confirm-dialog>
  <el-card shadow="never">
    <div class="form-action">
      <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable placeholder="请输入" />
      <el-button @click="handleAddGroupClick">
        <et-icon icon="el-icon-plus"> </et-icon>
      </el-button>
    </div>
    <el-tree ref="roleTreeRef" class="dept-tree mt-2" :data="roleList"
      :props="{ children: 'children', label: 'label', disabled: '' }" :expand-on-click-node="false"
      :filter-node-method="handleFilter" default-expand-all @node-click="handleNodeClick">
      <template #default="{ node, data }">
        <div class="node-data" :title="data.label">
          <div class="node-wrapper">
            <et-icon :icon="data.icon" icon-class="node-icon"></et-icon>
            <span class="node-label">{{ data.label }}</span>
            <div v-if="editable" class="node-action">
              <et-icon v-if="data.nodeType == TreeNodeType.Group" icon="el-icon-Plus" class="action-item"
                @click="handleAddRoleClick(data)" />
              <et-icon icon="el-icon-Edit" class="action-item" @click="handleEditClick(data)" />
              <et-icon icon="el-icon-Delete" class="action-item" :disabled="data.children && data.children.length > 0"
                @click="handleDeleteClick(data)" />
            </div>
          </div>
        </div>
      </template>
    </el-tree>
  </el-card>
</template>

<script setup lang="ts">
import { RoleGroup, Role } from "@eimsnext/models";
import { roleGroupService, roleService } from "@eimsnext/services";
import { ITreeNode, TreeNodeType, buildRoleTree } from "@eimsnext/components";
import { TreeInstance } from "element-plus";

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
});

const roleList = ref<ITreeNode[]>(); // 部门列表
const roleTreeRef = ref<TreeInstance>(); // 部门树
const keyword = ref(); // 部门名称
const currentGroup = ref<RoleGroup>()
const selectedRole = ref<Role>();
const showAddEditRoleDialog = ref(false);
const showAddEditGroupDialog = ref(false)
const editMode = ref(false);
const showDeleteDialog = ref(false);
const toDeleteNode = ref<ITreeNode>()

const emit = defineEmits(["role-click"]);

watch(keyword, (val) => {
  roleTreeRef.value!.filter(val);
});

onBeforeMount(() => {
  loadData()
});

const loadData = () => {
  let roleGroups: RoleGroup[] = [];
  let roles: Role[] = []
  Promise.all([
    roleGroupService.query<RoleGroup>().then(data => { roleGroups = data }),
    roleService.query<Role>().then(data => { roles = data })
  ]
  ).then(() => roleList.value = buildRoleTree(roleGroups, roles))
}

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
  if (data.nodeType == TreeNodeType.Role) {
    selectedRole.value = data.data;
    currentGroup.value = roleList.value!.find(x => x.id == selectedRole.value?.roleGroupId)?.data
    emit("role-click", data.data);
  }
  else {
    currentGroup.value = data.data
  }
};

const handleAddGroupClick = () => {
  editMode.value = false;
  showAddEditGroupDialog.value = true;
};
const handleAddRoleClick = (data: ITreeNode) => {
  editMode.value = false;
  currentGroup.value = data.data;
  showAddEditRoleDialog.value = true;
};
const handleEditClick = (data: ITreeNode) => {
  editMode.value = true;

  if (data.nodeType == TreeNodeType.Role) {
    selectedRole.value = data.data;
    currentGroup.value = roleList.value!.find(x => x.id == selectedRole.value?.roleGroupId)?.data
    showAddEditRoleDialog.value = true;
  }
  else {
    currentGroup.value = data.data
    showAddEditGroupDialog.value = true
  }
};
const handleGroupSaved = (data: RoleGroup) => {
  showAddEditGroupDialog.value = false;
  loadData()
};
const handleRoleSaved = (data: Role) => {
  showAddEditRoleDialog.value = false;
  loadData()
};
const handleDeleteClick = (data: ITreeNode) => {
  toDeleteNode.value = data

  if (toDeleteNode.value.data) showDeleteDialog.value = true;
};
const handleDeleteConfirm = async () => {
  if (toDeleteNode.value!.nodeType == TreeNodeType.Role) {
    await roleService.delete(toDeleteNode.value?.id!);
  }
  else {
    await roleGroupService.delete(toDeleteNode.value?.id!);
  }

  showDeleteDialog.value = false;
};
</script>
<style scoped lang="scss">
.form-action {
  display: flex;
  margin-bottom: 5px;
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
  }

  .node-action {
    // 调整绝对定位，确保和部门名称在同一行
    position: absolute;
    right: 0px;
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
