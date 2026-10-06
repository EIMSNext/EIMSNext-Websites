<template>
  <AddEditEmployeeGroupCategory
    v-if="showAddEditGroupDialog"
    :edit="editMode"
    :p-category="currentGroup"
    @cancel="showAddEditGroupDialog = false"
    @ok="handleGroupSaved"
  />
  <AddEditEmployeeGroup
    v-if="showAddEditEmployeeGroupDialog"
    :edit="editMode"
    :p-category="currentGroup!"
    :p-empgrp="selectedEmployeeGroup"
    @cancel="showAddEditEmployeeGroupDialog = false"
    @ok="handleEmployeeGroupSaved"
  />
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
  <el-card shadow="never" class="employeeGroup-card">
    <div class="form-action">
      <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable :placeholder="$t('employeeGroup.searchPlaceholder')" />
      <el-button v-if="editable" @click="handleAddGroupClick">
        <et-icon icon="el-plus" />
      </el-button>
    </div>
    <div v-if="keyword.trim()" class="employeeGroup-search" v-loading="searchLoading">
      <div v-if="searchError" class="search-state">{{ searchError }}</div>
      <div v-else-if="!searchResults.length && !searchLoading" class="search-state">
        {{ $t("comp.memberSelect.noResults") }}
      </div>
      <div
        v-for="item in searchResults"
        :key="item.kind + ':' + item.id"
        class="search-result-item"
        @click="handleSearchResultClick(item)"
      >
        <et-icon :icon="item.kind === 'group' ? 'el-folder' : 'icon-employee-group'" class="search-result-icon" />
        <div class="search-result-label">
          <span>{{ item.label }}</span>
          <small v-if="item.parentLabel">{{ item.parentLabel }}</small>
        </div>
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
    <div v-else class="employeeGroup-tree">
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
                :class="{ selected: currentGroup?.id === element.id && !selectedEmployeeGroup }"
                :title="element.label"
                @dragover.prevent
                @drop.stop.prevent="dropToGroup(element)"
                @click="handleNodeClick(element)"
              >
                <div class="node-wrapper">
                  <et-icon icon="el-folder" icon-class="node-icon" />
                  <span class="node-label">{{ element.label }}</span>
                  <div v-if="editable && element.id!='__uncategorized__'" class="node-action">                    
                    <et-icon icon="el-Plus" class="action-item" @click.stop="handleAddEmployeeGroupClick(element)" />
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
                    <div class="node-data" :class="{ selected: selectedEmployeeGroup?.id === child.id }" :title="child.label" @click="handleNodeClick(child)">
                      <div class="node-wrapper">
                        <et-icon icon="icon-employee-group" icon-class="node-icon" />
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
            <div v-else class="node-data" :class="{ selected: selectedEmployeeGroup?.id === element.id }" :title="element.label" @click="handleNodeClick(element)">
              <div class="node-wrapper">
                <et-icon icon="icon-employee-group" icon-class="node-icon" />
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
import { EmployeeGroupCategory, EmployeeGroup } from "@eimsnext/models";
import { employeeGroupCategoryService, employeeGroupService } from "@eimsnext/services";
import Draggable from "vuedraggable";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

type EmployeeGroupTreeNode = {
  id: string;
  label: string;
  kind: "group" | "employeeGroup";
  data: EmployeeGroupCategory | EmployeeGroup;
  sortValue: number;
  children: EmployeeGroupTreeNode[];
  categoryId?: string;
  isVirtualCategory?: boolean;
};

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
});

const treeItems = ref<EmployeeGroupTreeNode[]>([]);
const allGroups = ref<EmployeeGroupCategory[]>([]);
const allEmployeeGroups = ref<EmployeeGroup[]>([]);
const loadedCategoryIds = new Set<string>();
const loadingCategoryIds = new Set<string>();
const treePageSize = 1000;
const searchPageSize = 200;
const keyword = ref("");
const searchResults = ref<Array<EmployeeGroupTreeNode & { parentLabel?: string }>>([]);
const searchLoading = ref(false);
const searchHasMore = ref(false);
const searchSkip = ref(0);
const searchCategorySkip = ref(0);
const searchCategoryHasMore = ref(false);
const searchError = ref("");
const searchRequestId = ref(0);
let dataRequestId = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;
const currentGroup = ref<EmployeeGroupCategory>();
const selectedEmployeeGroup = ref<EmployeeGroup>();
const showAddEditEmployeeGroupDialog = ref(false);
const showAddEditGroupDialog = ref(false);
const editMode = ref(false);
const showDeleteDialog = ref(false);
const toDeleteNode = ref<EmployeeGroupTreeNode>();
const draggingNode = ref<EmployeeGroupTreeNode>();
const dragGroup = { name: "employeeGroup-tree", pull: true, put: true };

const emit = defineEmits(["employeeGroupClick"]);

onBeforeMount(() => {
  loadData();
});

watch(keyword, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  const text = value.trim();
  if (!text) {
    searchRequestId.value++;
    searchResults.value = [];
    searchHasMore.value = false;
    searchError.value = "";
    refreshTree();
    return;
  }
  searchTimer = setTimeout(() => void searchEmployeeGroups(text, false), 300);
});

const loadGroupsPage = async (categoryId: string) => {
  const filter = categoryId
    ? "EmployeeGroupCategoryId eq '" + categoryId.replaceAll("'", "''") + "'"
    : "EmployeeGroupCategoryId eq ''";
  const query = "$filter=" + encodeURIComponent(filter);
  const result = await employeeGroupService.query<EmployeeGroup>(
    query + "&$orderby=SortValue,Name&$top=" + treePageSize,
  );
  return result;
};

const loadData = async () => {
  const requestId = ++dataRequestId;
  loadedCategoryIds.clear();
  loadingCategoryIds.clear();
  try {
    const categoriesResult = await employeeGroupCategoryService.query<EmployeeGroupCategory>(
      "$orderby=SortValue,Name&$top=" + treePageSize,
    );
    if (requestId !== dataRequestId) return;
    const categories = categoriesResult;
    allGroups.value = categories;
    allEmployeeGroups.value = [];
    refreshTree();
  } catch (error) {
    if (requestId === dataRequestId) {
      console.error(error);
      ElMessage.error(t("comp.memberSelect.loadFailed", "加载员工组失败"));
    }
  }
};

const loadCategoryGroups = async (categoryId: string) => {
  if (loadedCategoryIds.has(categoryId) || loadingCategoryIds.has(categoryId)) return;
  loadingCategoryIds.add(categoryId);
  try {
    const page = await loadGroupsPage(categoryId);
    const pageIds = new Set(page.map((item) => item.id));
    allEmployeeGroups.value = [
      ...allEmployeeGroups.value.filter((item) => !pageIds.has(item.id)),
      ...page,
    ];
    loadedCategoryIds.add(categoryId);
    refreshTree();
  } catch (error) {
    console.error(error);
    ElMessage.error(t("comp.memberSelect.loadFailed", "加载员工组失败"));
  } finally {
    loadingCategoryIds.delete(categoryId);
  }
};

const matchKeyword = (label: string) => !keyword.value || label.includes(keyword.value);

const searchEmployeeGroups = async (text: string, append: boolean) => {
  const requestId = ++searchRequestId.value;
  searchLoading.value = true;
  searchError.value = "";
  if (!append) {
    searchSkip.value = 0;
    searchCategorySkip.value = 0;
    searchCategoryHasMore.value = true;
  }
  const escaped = text.replaceAll("'", "''");
    const groupFilter = "contains(Name, '" + escaped + "')";
    const query = "$filter=" + encodeURIComponent(groupFilter);
    const categoryQuery = "$filter=" + encodeURIComponent(groupFilter);
    try {
    const [groupsResult, categoriesResult] = await Promise.all([
      employeeGroupService.query<EmployeeGroup>(
        query + "&$orderby=Name&$skip=" + searchSkip.value + "&$top=" + (searchPageSize + 1),
      ),
      !append || searchCategoryHasMore.value
        ? employeeGroupCategoryService.query<EmployeeGroupCategory>(
            categoryQuery + "&$orderby=Name&$skip=" + searchCategorySkip.value + "&$top=" + (searchPageSize + 1),
          )
        : Promise.resolve([] as EmployeeGroupCategory[]),
    ]);
    if (requestId !== searchRequestId.value) return;
    const groups = groupsResult.slice(0, searchPageSize);
    const categories = categoriesResult.slice(0, searchPageSize);
    const categoryMap = new Map(allGroups.value.map((item) => [item.id, item.name]));
    const groupResults = groups.map((item) => ({
      id: item.id,
      label: item.name,
      kind: "employeeGroup" as const,
      data: item,
      sortValue: item.sortValue || 0,
      children: [],
      parentLabel: item.employeeGroupCategory?.name
        || categoryMap.get(item.employeeGroupCategoryId)
        || item.employeeGroupCategoryId,
    }));
    const categoryResults = categories.map((item) => ({
          id: item.id,
          label: item.name,
          kind: "group" as const,
          data: item,
          sortValue: item.sortValue || 0,
          children: [],
          categoryId: item.id,
        }));
    const results = [...categoryResults, ...groupResults];
    searchResults.value = append ? [...searchResults.value, ...results] : results;
    searchSkip.value += groups.length;
    searchCategorySkip.value += categories.length;
    searchCategoryHasMore.value = categoriesResult.length > searchPageSize;
    searchHasMore.value = groupsResult.length > searchPageSize;
    searchHasMore.value = searchHasMore.value || searchCategoryHasMore.value;
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
  const text = keyword.value.trim();
  if (text && !searchLoading.value && searchHasMore.value) {
    void searchEmployeeGroups(text, true);
  }
};

const handleSearchResultClick = async (node: EmployeeGroupTreeNode) => {
  keyword.value = "";
  await handleNodeClick(node);
};

const refreshTree = () => {
  const folders = allGroups.value
    .slice()
    .sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0))
    .map<EmployeeGroupTreeNode>((group) => ({
      id: group.id,
      label: group.name,
      kind: "group",
      data: group,
      sortValue: group.sortValue || 0,
      children: [],
      categoryId: group.id,
    }));
  folders.push({
    id: "__uncategorized__",
    label: "未分类",
    kind: "group",
    data: { id: "", name: "未分类" } as EmployeeGroupCategory,
    sortValue: Number.MAX_SAFE_INTEGER,
    children: [],
    categoryId: "",
    isVirtualCategory: true,
  });
  const folderMap = new Map(folders.map((folder) => [folder.categoryId ?? folder.id, folder]));
  const roots: EmployeeGroupTreeNode[] = [...folders];
  allEmployeeGroups.value
    .slice()
    .sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0))
    .forEach((employeeGroup) => {
      const node: EmployeeGroupTreeNode = {
        id: employeeGroup.id,
        label: employeeGroup.name,
        kind: "employeeGroup",
        data: employeeGroup,
        sortValue: employeeGroup.sortValue || 0,
        children: [],
      };
      const parent = folderMap.get(employeeGroup.employeeGroupCategoryId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    });

  const filtered = keyword.value
    ? roots
        .map((node) => {
          if (node.kind === "employeeGroup") return matchKeyword(node.label) ? node : undefined;
          const children = node.children.filter((child) => matchKeyword(child.label));
          if (matchKeyword(node.label) || children.length > 0) return { ...node, children };
          return undefined;
        })
        .filter((node): node is EmployeeGroupTreeNode => !!node)
    : roots;

  treeItems.value = filtered.sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0));
};

const handleNodeClick = async (node: EmployeeGroupTreeNode) => {
  if (node.kind === "employeeGroup") {
    selectedEmployeeGroup.value = node.data as EmployeeGroup;
    currentGroup.value = allGroups.value.find((x) => x.id === selectedEmployeeGroup.value?.employeeGroupCategoryId);
    emit("employeeGroupClick", node.data);
  } else {
    selectedEmployeeGroup.value = undefined;
    currentGroup.value = node.isVirtualCategory ? undefined : node.data as EmployeeGroupCategory;
    if (node.categoryId !== undefined) {
      await loadCategoryGroups(node.categoryId);
    }
  }
};

const handleAddGroupClick = () => {
  editMode.value = false;
  currentGroup.value = undefined;
  showAddEditGroupDialog.value = true;
};

const handleAddEmployeeGroupClick = (node: EmployeeGroupTreeNode) => {
  if (node.isVirtualCategory) return;
  editMode.value = false;
  currentGroup.value = node.data as EmployeeGroupCategory;
  showAddEditEmployeeGroupDialog.value = true;
};

const handleEditClick = (node: EmployeeGroupTreeNode) => {
  editMode.value = true;
  if (node.kind === "employeeGroup") {
    selectedEmployeeGroup.value = node.data as EmployeeGroup;
    currentGroup.value = allGroups.value.find((x) => x.id === selectedEmployeeGroup.value?.employeeGroupCategoryId);
    showAddEditEmployeeGroupDialog.value = true;
  } else {
    if (node.isVirtualCategory) return;
    currentGroup.value = node.data as EmployeeGroupCategory;
    showAddEditGroupDialog.value = true;
  }
};

const handleGroupSaved = () => {
  showAddEditGroupDialog.value = false;
  loadData();
};

const handleEmployeeGroupSaved = () => {
  showAddEditEmployeeGroupDialog.value = false;
  loadData();
};

const handleDeleteClick = (node: EmployeeGroupTreeNode) => {
  toDeleteNode.value = node;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!toDeleteNode.value) return;
  if (toDeleteNode.value.kind === "group" && toDeleteNode.value.isVirtualCategory) {
    showDeleteDialog.value = false;
    return;
  }
  if (toDeleteNode.value.kind === "group" && toDeleteNode.value.children.length > 0) {
    ElMessage.warning(t('comp.addEditEmployeeGroupCategory.cannotDeleteWithEmployeeGroups'));
    showDeleteDialog.value = false;
    return;
  }

  try {
    if (toDeleteNode.value.kind === "employeeGroup") {
      await employeeGroupService.delete(toDeleteNode.value.id);
    } else {
      await employeeGroupCategoryService.delete(toDeleteNode.value.id);
    }

    await loadData();
    showDeleteDialog.value = false;
  } catch (error) {
    console.error(error);
    ElMessage.error(t("comp.memberSelect.loadFailed", "删除员工组失败"));
  }
};

const handleRootDragStart = (event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;
  const node = treeItems.value[event.oldIndex];
  draggingNode.value = node;
};

const handleChildDragStart = (group: EmployeeGroupTreeNode, event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;
  const node = group.children[event.oldIndex];
  draggingNode.value = node;
};

const clearDragging = () => {
  draggingNode.value = undefined;
};

const getDragResult = (source: EmployeeGroupTreeNode) => {
  const rootIndex = treeItems.value.findIndex((item) => item.id === source.id);
  if (rootIndex > -1) {
    return {
      employeeGroupCategoryId: source.categoryId ?? "",
      siblings: treeItems.value.filter((item) => !item.isVirtualCategory),
    };
  }

  for (const group of treeItems.value) {
    if (group.kind !== "group") continue;
    const childIndex = group.children.findIndex((item) => item.id === source.id);
    if (childIndex > -1) {
      return {
        employeeGroupCategoryId: group.categoryId ?? group.id,
        siblings: group.children,
      };
    }
  }

  return undefined;
};

const moveNode = async (source: EmployeeGroupTreeNode, employeeGroupCategoryId: string, siblings: EmployeeGroupTreeNode[]) => {
  const index = siblings.findIndex((item) => item.id === source.id);
  if (index < 0) return;

  await employeeGroupService.move({
    id: source.id,
    isGroup: source.kind === "group",
    employeeGroupCategoryId,
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

  await moveNode(source, result.employeeGroupCategoryId, result.siblings);
};

const handleRootMove = (event: { relatedContext?: { element?: EmployeeGroupTreeNode }; originalEvent?: { target?: EventTarget | null } }) => {
  if (keyword.value.trim()) return false;
  const target = event.relatedContext?.element;
  const source = draggingNode.value;
  if (!source || !target) return true;
  const onGroupTitle = event.originalEvent?.target instanceof HTMLElement && !!event.originalEvent.target.closest(".group-drop-target");
  return !(onGroupTitle && target.kind === "group" && source.kind === "employeeGroup");
};

const handleChildMove = () => !keyword.value.trim() && draggingNode.value?.kind === "employeeGroup";

const dropToGroup = async (group: EmployeeGroupTreeNode) => {
  if (keyword.value.trim()) {
    ElMessage.warning(t('admin.tenantAdminGroup.clearSearchBeforeSort'));
    return;
  }

  const source = draggingNode.value;
  if (!source || source.kind !== "employeeGroup") return;
  clearDragging();
  await employeeGroupService.move({
    id: source.id,
    isGroup: false,
    employeeGroupCategoryId: group.categoryId ?? group.id,
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

.employeeGroup-card {
  border: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: var(--et-size-300);
  padding: var(--et-space-0);
}

.employeeGroup-tree {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 0;
  width: 100%;
  max-height: calc(100vh - 200px);
}

.employeeGroup-search {
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
  display: flex;
  min-width: 0;
  flex-direction: column;

  span,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--et-text-secondary);
  }
}

.search-more {
  display: flex;
  width: 100%;
  justify-content: center;
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
