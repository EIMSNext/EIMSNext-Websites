<template>
  <AddEditRoleGroup
    v-if="showAddEditGroupDialog"
    :edit="editMode"
    :p-group="currentGroup"
    @cancel="showAddEditGroupDialog = false"
    @ok="handleGroupSaved"
  />
  <AddEditRole
    v-if="showAddEditRoleDialog"
    :edit="editMode"
    :p-group="currentGroup!"
    :p-role="selectedRole"
    @cancel="showAddEditRoleDialog = false"
    @ok="handleRoleSaved"
  />
  <et-confirm-dialog
    v-model="showDeleteDialog"
    :title="$t('role.confirmDelete')"
    :showNoSave="false"
    :okText="$t('common.confirm')"
    @cancel="showDeleteDialog = false"
    @ok="handleDeleteConfirm"
  >
    {{ $t("role.confirmDeleteData") }}
  </et-confirm-dialog>
  <el-card shadow="never" class="role-card">
    <div class="form-action">
      <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable :placeholder="$t('role.searchPlaceholder')" />
      <el-button v-if="editable" @click="handleAddGroupClick">
        <et-icon icon="el-plus" />
      </el-button>
    </div>
    <div class="role-tree">
      <Draggable
        :list="treeItems"
        item-key="id"
        :group="dragGroup"
        ghost-class="drag-ghost"
        :animation="180"
        :disabled="!editable"
        :move="handleRootMove"
        @start="handleRootDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <div class="tree-drag-item">
            <template v-if="element.kind === 'group'">
              <div
                class="node-data group-drop-target"
                :class="{ selected: currentGroup?.id === element.id && !selectedRole }"
                :title="element.label"
                @dragover.prevent
                @drop.stop.prevent="dropToGroup(element)"
                @click="handleNodeClick(element)"
              >
                <div class="node-wrapper">
                  <et-icon icon="el-folder" icon-class="node-icon" />
                  <span class="node-label">{{ element.label }}</span>
                  <div v-if="editable" class="node-action">
                    <et-icon icon="el-Plus" class="action-item" @click.stop="handleAddRoleClick(element)" />
                    <et-icon icon="el-Edit" class="action-item" @click.stop="handleEditClick(element)" />
                    <et-icon icon="el-Delete" class="action-item" @click.stop="handleDeleteClick(element)" />
                  </div>
                </div>
              </div>
              <Draggable
                v-model="element.children"
                item-key="id"
                :group="dragGroup"
                ghost-class="drag-ghost"
                :animation="180"
                :disabled="!editable"
                :move="handleChildMove"
                @start="handleChildDragStart(element, $event)"
                @end="handleDragEnd"
              >
                <template #item="{ element: child }">
                  <div class="tree-drag-item child">
                    <div class="node-data" :class="{ selected: selectedRole?.id === child.id }" :title="child.label" @click="handleNodeClick(child)">
                      <div class="node-wrapper">
                        <et-icon icon="icon-role" icon-class="node-icon" />
                        <span class="node-label">{{ child.label }}</span>
                        <div v-if="editable" class="node-action">
                          <et-icon icon="el-Edit" class="action-item" @click.stop="handleEditClick(child)" />
                          <et-icon icon="el-Delete" class="action-item" @click.stop="handleDeleteClick(child)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </Draggable>
            </template>
            <div v-else class="node-data" :class="{ selected: selectedRole?.id === element.id }" :title="element.label" @click="handleNodeClick(element)">
              <div class="node-wrapper">
                <et-icon icon="icon-role" icon-class="node-icon" />
                <span class="node-label">{{ element.label }}</span>
                <div v-if="editable" class="node-action">
                  <et-icon icon="el-Edit" class="action-item" @click.stop="handleEditClick(element)" />
                  <et-icon icon="el-Delete" class="action-item" @click.stop="handleDeleteClick(element)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Draggable>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { RoleGroup, Role } from "@eimsnext/models";
import { roleGroupService, roleService } from "@eimsnext/services";
import Draggable from "vuedraggable";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

type RoleTreeNode = {
  id: string;
  label: string;
  kind: "group" | "role";
  data: RoleGroup | Role;
  sortValue: number;
  children: RoleTreeNode[];
};

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
  adminScope: {
    type: Boolean,
    default: false,
  },
});

const treeItems = ref<RoleTreeNode[]>([]);
const allGroups = ref<RoleGroup[]>([]);
const allRoles = ref<Role[]>([]);
const keyword = ref("");
const currentGroup = ref<RoleGroup>();
const selectedRole = ref<Role>();
const showAddEditRoleDialog = ref(false);
const showAddEditGroupDialog = ref(false);
const editMode = ref(false);
const showDeleteDialog = ref(false);
const toDeleteNode = ref<RoleTreeNode>();
const draggingNode = ref<RoleTreeNode>();
const dragGroup = { name: "role-tree", pull: true, put: true };

const emit = defineEmits(["role-click"]);

onBeforeMount(() => {
  loadData();
});

watch(keyword, () => {
  refreshTree();
});

const loadData = () => {
  let roleGroups: RoleGroup[] = [];
  let roles: Role[] = [];
  Promise.all([
    roleGroupService.query<RoleGroup>(props.adminScope ? "adminScope=true" : "").then((data) => {
      roleGroups = data;
    }),
    roleService.query<Role>(props.adminScope ? "adminScope=true" : "").then((data) => {
      roles = data;
    }),
  ]).then(() => {
    allGroups.value = roleGroups;
    allRoles.value = roles;
    refreshTree();
  });
};

const matchKeyword = (label: string) => !keyword.value || label.includes(keyword.value);

const refreshTree = () => {
  const folders = allGroups.value
    .slice()
    .sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0))
    .map<RoleTreeNode>((group) => ({
      id: group.id,
      label: group.name,
      kind: "group",
      data: group,
      sortValue: group.sortValue || 0,
      children: [],
    }));
  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
  const roots: RoleTreeNode[] = [...folders];

  allRoles.value
    .slice()
    .sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0))
    .forEach((role) => {
      const node: RoleTreeNode = {
        id: role.id,
        label: role.name,
        kind: "role",
        data: role,
        sortValue: role.sortValue || 0,
        children: [],
      };
      const parent = folderMap.get(role.roleGroupId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    });

  const filtered = keyword.value
    ? roots
        .map((node) => {
          if (node.kind === "role") return matchKeyword(node.label) ? node : undefined;
          const children = node.children.filter((child) => matchKeyword(child.label));
          if (matchKeyword(node.label) || children.length > 0) return { ...node, children };
          return undefined;
        })
        .filter((node): node is RoleTreeNode => !!node)
    : roots;

  treeItems.value = filtered.sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0));
};

const handleNodeClick = (node: RoleTreeNode) => {
  if (node.kind === "role") {
    selectedRole.value = node.data as Role;
    currentGroup.value = allGroups.value.find((x) => x.id === selectedRole.value?.roleGroupId);
    emit("role-click", node.data);
  } else {
    selectedRole.value = undefined;
    currentGroup.value = node.data as RoleGroup;
  }
};

const handleAddGroupClick = () => {
  editMode.value = false;
  currentGroup.value = undefined;
  showAddEditGroupDialog.value = true;
};

const handleAddRoleClick = (node: RoleTreeNode) => {
  editMode.value = false;
  currentGroup.value = node.data as RoleGroup;
  showAddEditRoleDialog.value = true;
};

const handleEditClick = (node: RoleTreeNode) => {
  editMode.value = true;
  if (node.kind === "role") {
    selectedRole.value = node.data as Role;
    currentGroup.value = allGroups.value.find((x) => x.id === selectedRole.value?.roleGroupId);
    showAddEditRoleDialog.value = true;
  } else {
    currentGroup.value = node.data as RoleGroup;
    showAddEditGroupDialog.value = true;
  }
};

const handleGroupSaved = () => {
  showAddEditGroupDialog.value = false;
  loadData();
};

const handleRoleSaved = () => {
  showAddEditRoleDialog.value = false;
  loadData();
};

const handleDeleteClick = (node: RoleTreeNode) => {
  toDeleteNode.value = node;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!toDeleteNode.value) return;
  if (toDeleteNode.value.kind === "group" && toDeleteNode.value.children.length > 0) {
    ElMessage.warning(t('comp.addEditRoleGroup.cannotDeleteWithRoles'));
    showDeleteDialog.value = false;
    return;
  }

  if (toDeleteNode.value.kind === "role") {
    await roleService.delete(toDeleteNode.value.id);
  } else {
    await roleGroupService.delete(toDeleteNode.value.id);
  }

  loadData();
  showDeleteDialog.value = false;
};

const handleRootDragStart = (event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;
  draggingNode.value = treeItems.value[event.oldIndex];
};

const handleChildDragStart = (group: RoleTreeNode, event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;
  draggingNode.value = group.children[event.oldIndex];
};

const clearDragging = () => {
  draggingNode.value = undefined;
};

const getDragResult = (source: RoleTreeNode) => {
  const rootIndex = treeItems.value.findIndex((item) => item.id === source.id);
  if (rootIndex > -1) {
    return { roleGroupId: "", siblings: treeItems.value };
  }

  for (const group of treeItems.value) {
    if (group.kind !== "group") continue;
    const childIndex = group.children.findIndex((item) => item.id === source.id);
    if (childIndex > -1) return { roleGroupId: group.id, siblings: group.children };
  }

  return undefined;
};

const moveNode = async (source: RoleTreeNode, roleGroupId: string, siblings: RoleTreeNode[]) => {
  const index = siblings.findIndex((item) => item.id === source.id);
  if (index < 0) return;

  await roleService.move({
    id: source.id,
    isGroup: source.kind === "group",
    roleGroupId,
    previousId: siblings[index - 1]?.id || "",
    nextId: siblings[index + 1]?.id || "",
  });
  loadData();
};

const handleDragEnd = async () => {
  const source = draggingNode.value;
  clearDragging();
  if (!source) return;

  if (keyword.value.trim()) {
    refreshTree();
    return;
  }

  const result = getDragResult(source);
  if (!result) {
    refreshTree();
    return;
  }

  await moveNode(source, result.roleGroupId, result.siblings);
};

const handleRootMove = (event: { relatedContext?: { element?: RoleTreeNode }; originalEvent?: { target?: EventTarget | null } }) => {
  if (keyword.value.trim()) return false;
  const target = event.relatedContext?.element;
  const source = draggingNode.value;
  if (!source || !target) return true;
  const onGroupTitle = event.originalEvent?.target instanceof HTMLElement && !!event.originalEvent.target.closest(".group-drop-target");
  return !(onGroupTitle && target.kind === "group" && source.kind === "role");
};

const handleChildMove = () => !keyword.value.trim() && draggingNode.value?.kind === "role";

const dropToGroup = async (group: RoleTreeNode) => {
  if (keyword.value.trim()) {
    ElMessage.warning(t('admin.adminGroup.clearSearchBeforeSort'));
    return;
  }

  const source = draggingNode.value;
  if (!source || source.kind !== "role") return;
  clearDragging();
  await roleService.move({
    id: source.id,
    isGroup: false,
    roleGroupId: group.id,
    previousId: group.children.at(-1)?.id || "",
    nextId: "",
  });
  loadData();
};
</script>

<style scoped lang="scss">
.form-action {
  display: flex;
  margin-bottom: var(--et-space-5);
  padding: var(--et-space-10);
  box-sizing: border-box;
}

.role-card {
  border: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: var(--et-size-300);
  padding: var(--et-space-0);
}

.role-tree {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 0;
  width: 100%;
  max-height: calc(100vh - 200px);
}

.tree-drag-item {
  display: block;
}

.tree-drag-item.child {
  padding-left: var(--et-space-18);
}

.node-data {
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 32px;
  width: 100%;

  &.selected {
    background: var(--et-bg-primary-light);
    color: var(--et-color-primary);
  }
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

.drag-ghost {
  opacity: 0.6;
}
</style>
