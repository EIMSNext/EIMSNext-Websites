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
    :title="$t('employeeGroup.confirmDelete')"
    :showNoSave="false"
    :okText="$t('common.confirm')"
    @cancel="showDeleteDialog = false"
    @ok="handleDeleteConfirm"
  >
    {{ $t("employeeGroup.confirmDeleteData") }}
  </et-confirm-dialog>
  <el-card shadow="never" class="dept-card">
    <el-input
      v-model="keyword"
      class="search-input"
      prefix-icon="Search"
      clearable
      :placeholder="$t('employeeGroup.searchPlaceholder')"
    />
    <div v-if="keyword.trim()" class="search-results" v-loading="searchLoading">
      <div v-if="searchError" class="search-state">{{ searchError }}</div>
      <div v-else-if="!searchResults.length && !searchLoading" class="search-state">
        {{ $t("comp.memberSelect.noResults") }}
      </div>
      <div
        v-for="department in searchResults"
        :key="department.id"
        class="search-result-item"
        @click="handleNodeClick(toNode(department))"
      >
        <et-icon icon="icon-organization" class="search-result-icon" color="var(--et-color-success)" />
        <span class="search-result-label">{{ department.code }} - {{ department.name }}</span>
      </div>
      <el-button
        v-if="searchHasMore"
        link
        type="primary"
        class="search-more"
        :loading="searchLoading"
        :disabled="searchLoading"
        @click="loadMoreSearch"
      >
        {{ $t("common.loadMore") }}
      </el-button>
    </div>
    <el-tree
      v-else
      ref="deptTreeRef"
      :key="treeVersion"
      class="dept-tree mt-2"
      :data="deptList"
      :props="{ children: 'children', label: 'label', disabled: '' }"
      :expand-on-click-node="false"
      lazy
      :load="loadTreeNode"
      :filter-node-method="handleFilter"
      node-key="id"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="node-data" :title="data.label">
          <div class="node-wrapper">
            <et-icon
              :icon="data.icon"
              icon-class="node-icon"
               :color="getNodeIconColor()"
            ></et-icon>
            <span class="node-label">{{ data.label }}</span>
            <div v-if="editable" class="node-action">
              <et-icon icon="el-Plus" class="action-item" @click.stop="handleAddClick(data)" />
              <et-icon icon="el-Edit" class="action-item" @click.stop="handleEditClick(data)" />
              <et-icon
                icon="el-Delete"
                v-if="data.data.parentId"
                class="action-item"
                @click.stop="handleDeleteClick(data)"
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
import { departmentService } from "@eimsnext/services";
import { ITreeNode } from "@eimsnext/components";
import { TreeInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { nextTick } from "vue";

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
});

const deptList = ref<ITreeNode[]>([]); // 部门列表
const treeVersion = ref(0);
const deptTreeRef = ref<TreeInstance>(); // 部门树
const keyword = ref(""); // 部门名称
const searchResults = ref<Department[]>([]);
const searchLoading = ref(false);
const searchHasMore = ref(false);
const searchError = ref("");
const searchSkip = ref(0);
const searchRequestId = ref(0);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
const selectedDept = ref<Department>();
const showAddEditDialog = ref(false);
const editMode = ref(false);
const showDeleteDialog = ref(false);

const emit = defineEmits(["node-click"]);

watch(keyword, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  const text = String(val || "").trim();
  if (!text) {
    searchRequestId.value++;
    searchResults.value = [];
    searchHasMore.value = false;
    searchError.value = "";
    deptTreeRef.value?.filter("");
    return;
  }
  searchTimer = setTimeout(() => void searchDepartments(text, false), 300);
});

const pageSize = 200;
type DepartmentTreeNode = ITreeNode & { isLeaf?: boolean };
const escapeOData = (value: string) => value.replaceAll("'", "''");
const toNode = (department: Department, isLeaf = false): DepartmentTreeNode => ({
  id: department.id,
  value: department.code,
  label: department.code + " - " + department.name,
  type: 1,
  children: [],
  data: department,
  icon: "icon-organization",
  isLeaf,
});

const loadDepartments = async (parentId: string) => {
  const filter = parentId
    ? "ParentId eq '" + escapeOData(parentId) + "'"
    : "ParentId eq ''";
  const query = "$filter=" + encodeURIComponent(filter);
  const result = await departmentService.query<Department>(
    query + "&$orderby=Code&$top=1000",
  );
  return result.map((item) => toNode(item));
};

const loadTreeNode = async (node: any, resolve: (nodes: ITreeNode[]) => void) => {
  const parentId = node.level === 0 ? "" : node.data.id;
  try {
    resolve(await loadDepartments(parentId));
  } catch (error) {
    console.error(error);
    ElMessage.error("加载部门失败");
    resolve([]);
  }
};

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

/** 树节点图标颜色 —— 与 memberSelect 保持一致（部门统一绿色） */
const getNodeIconColor = () => "var(--et-color-success)";

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
  void refreshTree();
};

const refreshTree = async () => {
  deptList.value = [];
  treeVersion.value++;
  await nextTick();
};

const searchDepartments = async (text: string, append: boolean) => {
  const requestId = ++searchRequestId.value;
  searchLoading.value = true;
  searchError.value = "";
  if (!append) searchSkip.value = 0;
  const escaped = text.replaceAll("'", "''");
  const filter = "contains(Name, '" + escaped + "') or contains(Code, '" + escaped + "')";
  const query = "$filter=" + encodeURIComponent(filter);
  try {
    const result = await departmentService.query<Department>(
      query + "&$orderby=Name&$skip=" + searchSkip.value + "&$top=" + (pageSize + 1),
    );
    if (requestId !== searchRequestId.value) return;
    const items = result.slice(0, pageSize);
    searchResults.value = append ? [...searchResults.value, ...items] : items;
    searchSkip.value += items.length;
    searchHasMore.value = result.length > pageSize;
  } catch {
    if (requestId === searchRequestId.value) {
      searchError.value = "加载失败";
    }
  } finally {
    if (requestId === searchRequestId.value) {
      searchLoading.value = false;
    }
  }
};

const loadMoreSearch = () => {
  const text = String(keyword.value || "").trim();
  if (text && !searchLoading.value && searchHasMore.value) {
    void searchDepartments(text, true);
  }
};
const handleDeleteClick = (data: ITreeNode) => {
  selectedDept.value = data.data;
  if (selectedDept.value && selectedDept.value.parentId) showDeleteDialog.value = true;
};
const handleDeleteConfirm = async () => {
  try {
    await departmentService.delete(selectedDept.value?.id!);
    await refreshTree();
    showDeleteDialog.value = false;
  } catch (error) {
    console.error(error);
    ElMessage.error("删除部门失败");
  }
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

.search-results {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.search-state {
  padding: var(--et-space-20);
  color: var(--et-text-secondary);
  text-align: center;
}

.search-result-item {
  display: flex;
  align-items: center;
  min-height: var(--et-size-40);
  padding: 0 var(--et-space-10);
  border-radius: var(--et-radius-4);
  cursor: pointer;

  &:hover {
    background: var(--et-bg-hover);
  }
}

.search-result-icon {
  flex: none;
  margin-right: var(--et-space-8);
}

.search-result-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-more {
  display: flex;
  width: 100%;
  justify-content: center;
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
