<template>
  <div class="member-select">
    <selected-tags v-model="tagsRef" :closable="true" @tagRemoved="removeTag" />
    <el-input
      v-model="keyword"
      class="search-input"
      prefix-icon="Search"
      clearable
      :placeholder="$t('common.pleaseInput')"
    />
    <div class="search-result">
      <div class="result-container">
        <el-tabs
          v-model="activeTab"
          style="flex: 1"
          :class="{ 'hide-tabs-header': activeTab == options.showTabs }"
        >
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.Department)"
            :label="$t('comp.memberSelect.tabs.department')"
            :name="MemberTabs.Department"
          >
            <div class="dept-select">
              <el-tree
                ref="deptTree"
                class="dept-tree"
                :data="deptData"
                :props="defaultProps"
                :expand-on-click-node="false"
                node-key="id"
                :check-strictly="true"
                :filter-node-method="deptFilter"
              >
                <template #default="{ node, data }">
                  <div
                    class="node-data"
                    :title="data.label"
                    @click="handleNodeClick(node, data, deptFilter, false)"
                  >
                    <div class="node-wrapper">
                      <et-icon
                        :icon="data.icon"
                        class="node-icon"
                        :color="getNodeIconColor(data)"
                      />
                      <span class="node-label">{{ data.label }}</span>
                      <div v-if="!data.readonly" class="node-action">
                        <el-checkbox
                          v-if="options.multiple"
                          v-model="data.checked"
                          @click.stop=""
                          :disabled="
                            data.disabled || !deptFilter(keyword, data)
                          "
                          @change="
                            (val: any) =>
                              handleCheckedChanged(
                                node,
                                data,
                                deptFilter,
                                false,
                              )
                          "
                        />
                        <el-radio
                          v-if="!options.multiple"
                          v-model="singleDeptId"
                          :value="data.id"
                          @click.stop=""
                          @change="
                            (val: string) => singleDeptChecked(data, val)
                          "
                          :disabled="!deptFilter(keyword, data)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
              <div v-if="options.showCascade" class="options-footer">
                <el-checkbox :model-value="orgCascade" @change="cascadeChanged"
                  >{{ $t("comp.memberSelect.cascadeSubDepts") }}</el-checkbox
                >
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.Role)"
            :label="$t('comp.memberSelect.tabs.role')"
            :name="MemberTabs.Role"
          >
            <div class="dept-select">
              <el-tree
                ref="roleTree"
                class="dept-tree"
                :data="roleData"
                :props="defaultProps"
                :expand-on-click-node="false"
                node-key="id"
                :check-strictly="true"
                :filter-node-method="roleFilter"
              >
                <template #default="{ node, data }">
                  <div
                    class="node-data"
                    :title="data.label"
                    @click="handleNodeClick(node, data, roleFilter, true)"
                  >
                    <div class="node-wrapper">
                      <et-icon
                        :icon="data.icon"
                        class="node-icon"
                        :color="getNodeIconColor(data)"
                      />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox
                          v-model="data.checked"
                          @click.stop=""
                          :disabled="!roleFilter(keyword, data)"
                          @change="
                            (val: any) =>
                              handleCheckedChanged(node, data, roleFilter, true)
                          "
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.Employee)"
            :label="$t('comp.memberSelect.tabs.employee')"
            :name="MemberTabs.Employee"
          >
            <div class="emp-select">
              <div class="left-panel">
                <div class="filter-items">
                  <div
                    class="filter-item"
                    :class="{ active: selectedEmpDeptId == 'all' }"
                    @click.stop="selectEmpDept('all')"
                  >
                    {{ $t("comp.memberSelect.allEmployees") }}
                  </div>
                </div>
                <el-tree
                  ref="empDeptTree"
                  class="dept-tree"
                  :data="empDeptData"
                  :props="defaultProps"
                  :expand-on-click-node="true"
                  node-key="id"
                  :filter-node-method="deptFilter"
                >
                  <template #default="{ node, data }">
                    <div
                      class="node-data"
                      :title="data.label"
                      @click.stop="selectEmpDept(data.id)"
                    >
                      <div class="node-wrapper">
                        <et-icon
                          :icon="data.icon"
                          icon-class="node-icon"
                          :color="getNodeIconColor(data)"
                        ></et-icon>
                        <span class="node-label">{{ data.label }}</span>
                      </div>
                    </div>
                  </template>
                </el-tree>
              </div>
              <div class="right-panel">
                <et-list
                  v-model="selectedEmps"
                  :data="empData"
                  :selectable="true"
                  :multiple="options.multiple"
                  item-class="custom-list-item"
                  class="full-height-list"
                  @item-check="empChecked"
                  @all-check="empCheckAll"
                >
                </et-list>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="
              options.dynamicMembers &&
              FlagEnum.has(options.showTabs!, MemberTabs.Dynamic)
            "
            :label="$t('comp.memberSelect.tabs.dynamic')"
            :name="MemberTabs.Dynamic"
          >
            <div class="dynamic-member-panel">
              <div class="dynamic-member-groups">
                <div
                  v-for="group in dynamicGroups"
                  :key="group.id"
                  class="dynamic-member-group"
                  :class="{ active: group.id === selectedDynamicGroupId }"
                  @click="selectDynamicGroup(group.id)"
                >
                  <span class="dynamic-member-item-label">{{ group.label }}</span>
                </div>
              </div>
              <div class="dynamic-member-content">
                <div class="dynamic-member-items" :class="{ 'manager-mode': isManagerGroup }">
                  <div
                    v-for="item in currentDynamicItems"
                    :key="item.id"
                  class="dynamic-member-item"
                    :class="{ active: item.id === selectedDynamicMemberId && isManagerGroup }"
                    @click="selectDynamicItem(item)"
                  >
                    <span class="dynamic-member-item-label">{{ getDynamicItemLabelByGroup(item) }}</span>
                    <el-checkbox
                      v-if="!isManagerGroup"
                      :model-value="isDynamicItemChecked(item)"
                      @click.stop=""
                      @change="(checked: boolean) => dymChecked(item, checked)"
                    />
                  </div>
                </div>
                <div v-if="isManagerGroup" class="dynamic-member-managers">
                    <template v-if="selectedDynamicItem">
                      <div class="dynamic-manager-title">
                        {{ $t("comp.memberSelect.managerLevels", { label: selectedDynamicItem.label }) }}
                      </div>
                    <div
                      v-for="level in dynamicManagerLevels"
                      :key="level"
                      class="dynamic-manager-option"
                    >
                      <span>{{ getManagerLevelLabel(level) }}</span>
                      <el-checkbox
                        :model-value="selectedDynamicManagerLevels.includes(level)"
                        @change="(checked: boolean) => toggleManagerLevel(level, checked)"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.CurDept)"
            :label="$t('comp.memberSelect.tabs.curDept')"
            :name="MemberTabs.CurDept"
          >
            <div class="dept-select">
              <el-tree
                ref="curDeptTree"
                class="dept-tree"
                :data="curDeptData"
                :props="defaultProps"
                :expand-on-click-node="false"
                :check-strictly="true"
                node-key="id"
                :filter-node-method="deptFilter"
              >
                <template #default="{ node, data }">
                  <div
                    class="node-data"
                    :title="data.label"
                    @click="handleNodeClick(node, data, deptFilter, false)"
                  >
                    <div class="node-wrapper">
                      <et-icon
                        :icon="data.icon"
                        class="node-icon"
                        :color="getNodeIconColor(data)"
                      />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox
                          v-if="options.multiple"
                          v-model="data.checked"
                          @click.stop=""
                          :disabled="!deptFilter(keyword, data)"
                        />
                        <el-radio
                          v-if="!options.multiple"
                          v-model="singleDeptId"
                          :value="data.id"
                          @click.stop=""
                          @change="
                            (val: string) => singleDeptChecked(data, val)
                          "
                          :disabled="!deptFilter(keyword, data)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.CurUser)"
            :label="$t('comp.memberSelect.tabs.curUser')"
            :name="MemberTabs.CurUser"
          >
            <div class="dept-select">
              <et-list
                v-model="selectedEmps"
                :data="curEmpData"
                :selectable="true"
                :multiple="options.multiple"
                :showCount="false"
                class="borderless-list"
                @item-check="empChecked"
                @all-check="curEmpCheckAll"
              >
              </et-list>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.scss";
import { computed, ref, watch, onBeforeMount, toRef } from "vue";
import { TreeInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  DataItemType,
  deptToTreeNode,
  employeeToListItem,
  ITreeNode,
  buildDeptTree,
  buildRoleTree,
} from "../common";
import { ISelectedTag } from "../selectedTags/type";
import { Department, Employee, RoleGroup, Role } from "@eimsnext/models";
import { useDeptStore, useUserStore } from "@eimsnext/store";
import {
  departmentService,
  employeeService,
  roleGroupService,
  roleService,
} from "@eimsnext/services";
import { IListItem } from "../list/type";
import {
  IDynamicMemberGroup,
  IMemberLimit,
  IMemberSelectOptions,
  MemberTabs,
} from "./type";
import { deepMerge, FlagEnum } from "@eimsnext/utils";

defineOptions({
  name: "MemberSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue: ISelectedTag[];
    options?: IMemberSelectOptions;
  }>(),
  {},
);

const options = deepMerge<IMemberSelectOptions>(
  {
    showTabs: 7,
    cascadedDept: false,
    showCascade: false,
    multiple: true,
  },
  props.options || {},
);

const { t } = useI18n();
const orgCascade = ref(options.cascadedDept ?? false);
const userStore = useUserStore();
const defaultProps = { children: "children", label: "label" };
const tagsRef = toRef(props.modelValue);
const keyword = ref("");
const activeTab = ref(FlagEnum.getMinValue(MemberTabs, options.showTabs!));
const deptTree = ref<TreeInstance>();
const deptStore = useDeptStore();
const deptData = ref<ITreeNode[]>(); // 部门列表
const empDeptTree = ref<TreeInstance>();
const empDeptData = ref<ITreeNode[]>(); // 员工部门列表
const empData = ref<IListItem[]>([]); //员工列表
const selectedEmpDeptId = ref("");
const selectedEmps = ref<string[]>([]);
const deptChanging = ref(false);
const roleTree = ref<TreeInstance>();
const roleData = ref<ITreeNode[]>(); // 角色列表
const curDeptTree = ref<TreeInstance>();
const curDeptData = ref<ITreeNode[]>();
const singleDeptId = ref<string>("");
const curEmpData = ref<IListItem[]>([]);
const selectedDynamicGroupId = ref<string>("");
const selectedDynamicMemberId = ref<string>("");
const dynamicGroupOrder = ["starter", "employeeField", "departmentField", "manager"];

const isManagerGroup = computed(() => selectedDynamicGroupId.value === "manager");
const adminScopeParam = () => options.adminScope ? "adminScope=true" : "";
const loadDepartments = () => options.adminScope
  ? departmentService.query<Department>(adminScopeParam())
  : deptStore.load();

const dynamicGroups = computed<IDynamicMemberGroup[]>(() => {
  const groups: IDynamicMemberGroup[] = [];
  const groupMap = new Map<string, IDynamicMemberGroup>();
  const members = options.dynamicMembers || [];

  const registerGroup = (id: string, label: string) => {
    if (!groupMap.has(id)) {
      const group: IDynamicMemberGroup = {
        id,
        label,
        type: DataItemType.Group,
        items: [],
      };
      groupMap.set(id, group);
      groups.push(group);
    }
    return groupMap.get(id)!;
  };

  members.forEach((item) => {
    const category = getDynamicCategory(item);
    if (category === "employeeField") {
      registerGroup("employeeField", t("workflow.formEmployeeField")).items.push(item);
    } else if (category === "departmentField") {
      registerGroup("departmentField", t("workflow.formDepartmentField")).items.push(item);
    } else {
      registerGroup("starter", t("workflow.starter")).items.push(item);
    }
  });

  if (members.length > 0) {
    registerGroup("manager", t("workflow.departmentManager")).items = managerSourceItems.value;
  }

  groups.sort(
    (a, b) => dynamicGroupOrder.indexOf(a.id) - dynamicGroupOrder.indexOf(b.id),
  );

  return groups;
});

const managerSourceItems = computed<ISelectedTag[]>(() => {
  return (options.dynamicMembers || []).filter((item) =>
    getDynamicItemLabel(item).includes(keyword.value || ""),
  );
});

const currentDynamicItems = computed<ISelectedTag[]>(() => {
  const activeGroup = dynamicGroups.value.find(
    (item) => item.id === selectedDynamicGroupId.value,
  );
  return (activeGroup?.items || []).filter((item) =>
    getDynamicItemLabel(item).includes(keyword.value || ""),
  );
});

const selectedDynamicItem = computed<ISelectedTag | undefined>(() => {
  return currentDynamicItems.value.find(
    (item) => item.id === selectedDynamicMemberId.value,
  );
});

const dynamicManagerLevels = computed<number[]>(() => {
  return options.dynamicManagerLevels && options.dynamicManagerLevels.length > 0
    ? options.dynamicManagerLevels
    : [1, 2, 3, 4, 5];
});

const selectedDynamicManagerLevels = computed<number[]>(() => {
  const item = selectedDynamicItem.value;
  if (!item) {
    return [];
  }

  return dynamicManagerLevels.value.filter((level) =>
    !!findDynamicManagerTag(item, level),
  );
});

const normalizeManagerLevels = (levels?: number[]) => {
  if (!levels || levels.length === 0) {
    return [];
  }

  return [...new Set(levels.filter((x) => x > 0))].sort((a, b) => a - b);
};

const buildDynamicTagId = (item: ISelectedTag, managerLevels?: number[]) => {
  const sourceId = item.sourceId || item.id;
  const normalized = normalizeManagerLevels(managerLevels);
  return normalized.length > 0
    ? `${item.type}:${sourceId}|m:${normalized.join(",")}`
    : `${item.type}:${sourceId}`;
};

const buildDynamicTagLabel = (item: ISelectedTag, managerLevels?: number[]) => {
  const normalized = normalizeManagerLevels(managerLevels);
  if (normalized.length === 0) {
    return getDynamicItemLabel(item);
  }

  return `${getDynamicItemLabel(item)} | ${getManagerLevelLabel(normalized[0])}`;
};

const getDynamicItemLabelByGroup = (item: ISelectedTag) => {
  if (isManagerGroup.value) {
    return getDynamicItemLabel(item);
  }

  const category = getDynamicCategory(item);
  if (category === "starter") {
    return t("workflow.starter");
  }

  if (category === "employeeField") {
    return item.data?.fieldType?.toString().endsWith("2") ? t("comp.memberSelect.multiMember") : t("comp.memberSelect.singleMember");
  }

  if (category === "departmentField") {
    return item.data?.fieldType?.toString().endsWith("2") ? t("comp.memberSelect.multiDept") : t("comp.memberSelect.singleDept");
  }

  return getDynamicItemLabel(item);
};

const getDynamicCategory = (item: ISelectedTag) => {
  return item.data?.dynamicCategory || "starter";
};

const getDynamicItemLabel = (item: ISelectedTag) => {
  return item.data?.baseLabel || item.label;
};

const findDynamicTag = (item: ISelectedTag) => {
  const sourceId = item.sourceId || item.id;
  return tagsRef.value.find(
    (tag) =>
      tag.type === item.type
      && (tag.sourceId || tag.id) === sourceId
      && (!tag.managerLevels || tag.managerLevels.length === 0),
  );
};

const findDynamicManagerTag = (item: ISelectedTag, level: number) => {
  const sourceId = item.sourceId || item.id;
  return tagsRef.value.find(
    (tag) =>
      tag.type === item.type
      && (tag.sourceId || tag.id) === sourceId
      && tag.managerLevels?.length === 1
      && tag.managerLevels[0] === level,
  );
};

const isDynamicItemChecked = (item: ISelectedTag) => {
  return !!findDynamicTag(item);
};

const syncDynamicSelection = () => {
  if (!selectedDynamicGroupId.value || !dynamicGroups.value.find((item) => item.id === selectedDynamicGroupId.value)) {
    selectedDynamicGroupId.value = dynamicGroups.value[0]?.id || "";
  }

  if (!selectedDynamicMemberId.value || !currentDynamicItems.value.find((item) => item.id === selectedDynamicMemberId.value)) {
    selectedDynamicMemberId.value = currentDynamicItems.value[0]?.id || "";
  }
};

const selectDynamicGroup = (groupId: string) => {
  selectedDynamicGroupId.value = groupId;
  selectedDynamicMemberId.value = currentDynamicItems.value[0]?.id || "";
};

const selectDynamicItem = (item: ISelectedTag) => {
  selectedDynamicMemberId.value = item.id;
};

const upsertDynamicTag = (item: ISelectedTag, checked: boolean, managerLevels?: number[]) => {
  const sourceId = item.sourceId || item.id;
  const normalizedLevels = normalizeManagerLevels(managerLevels);
  const label = buildDynamicTagLabel(item, normalizedLevels);
  const nextTag: ISelectedTag = {
    ...item,
    id: buildDynamicTagId(item, normalizedLevels),
    sourceId,
    label,
    managerLevels: normalizedLevels,
    data: {
      ...item.data,
      baseLabel: getDynamicItemLabel(item),
    },
  };

  const remainTags = tagsRef.value.filter((tag) => tag.id !== nextTag.id);

  if (!checked) {
    tagsRef.value = remainTags;
  } else if (options.multiple) {
    tagsRef.value = [...remainTags, nextTag];
  } else {
    const nonDynamicTags = remainTags.filter(
      (tag) => tag.type !== DataItemType.Dynamic && tag.type !== DataItemType.Field,
    );
    tagsRef.value = [...nonDynamicTags, nextTag];
  }

  emit("update:modelValue", tagsRef.value);
};

const toggleManagerLevel = (level: number, checked: boolean) => {
  const item = selectedDynamicItem.value;
  if (!item) {
    return;
  }

  upsertDynamicTag(item, checked, [level]);
};

const getManagerLevelLabel = (level: number) => {
  if (level === 1) {
    return t("workflow.directManager");
  }
  if (level === 2) {
    return t("workflow.higherLevelManager");
  }
  return t("workflow.nthLevelManager", { 0: level });
};

watch([keyword], ([newKeyword], [oldKeyword]) => {
  if (newKeyword != oldKeyword) {
    deptTree.value!.filter(newKeyword);
    roleTree.value!.filter(newKeyword);
    empDeptTree.value!.filter(newKeyword);
    syncDynamicSelection();
  }
});

// 根据可选范围过滤部门树
const filterDeptTreeByScope = (treeData: ITreeNode[]): ITreeNode[] => {
  if (
    !options.limit ||
    !options.limit.depts ||
    options.limit.depts.length == 0
  ) {
    return treeData;
  }

  const scopeDeptIds = options.limit.depts.map((dept) => dept.id);

  // 收集所有需要显示的部门ID，包括选中的部门及其所有父部门
  const requiredDeptIds = new Set<string>();

  // 递归查找并添加节点及其所有父节点到requiredDeptIds中
  const addNodeAndParents = (node: ITreeNode) => {
    requiredDeptIds.add(node.id);

    // 查找父节点
    const findParentNode = (parentNode: ITreeNode): boolean => {
      if (parentNode.children) {
        for (const child of parentNode.children) {
          if (child.id === node.id) {
            requiredDeptIds.add(parentNode.id);
            // 递归查找父节点的父节点
            addNodeAndParents(parentNode);
            return true;
          }
          if (findParentNode(child)) {
            return true;
          }
        }
      }
      return false;
    };

    // 遍历所有根节点查找父节点
    for (const rootNode of treeData) {
      if (rootNode.id === node.id) {
        // 已经是根节点，不需要继续查找
        return;
      }
      if (findParentNode(rootNode)) {
        return;
      }
    }
  };

  // 为每个选中的部门添加其所有父部门
  const addAllRequiredNodes = (nodes: ITreeNode[]) => {
    nodes.forEach((node) => {
      if (scopeDeptIds.includes(node.id)) {
        addNodeAndParents(node);
      }
      if (node.children) {
        addAllRequiredNodes(node.children);
      }
    });
  };

  // 初始化requiredDeptIds
  addAllRequiredNodes(treeData);

  // 过滤函数，递归检查节点是否应该保留
  const filterNode = (node: ITreeNode): ITreeNode | null => {
    // 如果节点是requiredDeptIds中的一员，或者是requiredDeptIds中某个节点的子节点
    if (requiredDeptIds.has(node.id)) {
      const isScoped = scopeDeptIds.indexOf(node.id) > -1;
      if (isScoped) {
        return node;
      } else {
        node.readonly = true;
        // 过滤子节点，只保留符合条件的子节点
        const filteredChildren = node.children
          ?.map((child) => filterNode(child))
          .filter((child): child is ITreeNode => child !== null);

        return {
          ...node,
          children: filteredChildren,
        };
      }
    }

    // 否则不保留
    return null;
  };

  // 遍历所有根节点，过滤出符合条件的节点
  return treeData
    .map((node) => filterNode(node))
    .filter((node): node is ITreeNode => node !== null);
};

onBeforeMount(() => {
  //复选模式下，如果支持级联选择并且显示级联框，则是否级联由数据决定
  if (options.multiple && options.cascadedDept && options.showCascade) {
    let firstDept = props.modelValue.find(
      (x) => x.type == DataItemType.Department,
    );
    if (firstDept && firstDept.cascadedDept)
      orgCascade.value = firstDept.cascadedDept;
  }

  loadDepartments().then((data: Department[]) => {
    let detps = buildDeptTree(data);
    const filteredDeptData = filterDeptTreeByScope(detps);
    deptData.value = JSON.parse(JSON.stringify(filteredDeptData));
    empDeptData.value = JSON.parse(JSON.stringify(filteredDeptData));

    const currentDepartmentId = userStore.currentUser.departmentIds?.[0] ?? userStore.currentUser.deptId;
    if (currentDepartmentId) {
      deptStore.get(currentDepartmentId).then((x) => {
        if (x) {
          const curDeptNode = [deptToTreeNode(x)];
          // 不应用范围过滤，直接显示当前用户部门
          curDeptData.value = curDeptNode;
        }
      });
    }
    if (userStore.currentUser) {
      let emp: Employee = {
        id: userStore.currentUser.empId!,
        code: userStore.currentUser.empCode!,
        empName: userStore.currentUser.empName!,
        status: 0,
        userBound: true
      };
      curEmpData.value = [employeeToListItem(emp)];
    }

    // 部门树数据加载完成后，手动触发一次选中状态的设置
    setSelectedNodes();
  });

  let roleGroups: RoleGroup[] = [];
  let roles: Role[] = [];
  Promise.all([
    roleGroupService.query<RoleGroup>().then((data) => {
      roleGroups = data;
    }),
    roleService.query<Role>(adminScopeParam()).then((data) => {
      roles = data;
    }),
  ]).then(() => {
    roleData.value = buildRoleTree(roleGroups, roles);
    // 角色树数据加载完成后，手动触发一次选中状态的设置
    setSelectedNodes();
  });

  if (!options.multiple && props.modelValue?.length > 0) {
    if (props.modelValue[0].type == DataItemType.Department)
      singleDeptId.value = props.modelValue[0].id;
  }

  syncDynamicSelection();
});

// 手动设置选中节点
const setSelectedNodes = () => {
  syncDynamicSelection();

  // 确保树数据已加载
  if (!deptData.value || !roleData.value) return;

  // 获取员工类型的选中项ID列表
  const employeeSelectedIds = tagsRef.value
    .filter((tag) => tag.type === DataItemType.Employee)
    .map((tag) => tag.id);

  // 如果是单选模式，设置singleDeptId
  if (!options.multiple) {
    singleDeptId.value =
      tagsRef.value.find((x) => x.type === DataItemType.Department)?.id ?? "";
  }

  // 设置员工列表的选中状态
  selectedEmps.value = employeeSelectedIds;

  // 设置部门树的选中状态
  setNodeChecked(DataItemType.Department, deptData.value);
  if (orgCascade.value) updateCascadeStatus(deptData.value[0]);

  if (curDeptData.value) {
    setNodeChecked(DataItemType.Department, curDeptData.value);
  }

  // 设置角色树的选中状态
  setNodeChecked(DataItemType.Role, roleData.value);
};

// 遍历树节点，设置选中状态
const setNodeChecked = (type: DataItemType, nodes: ITreeNode[]) => {
  if (!nodes) return;

  nodes.forEach((node) => {
    if (node.disabled || node.readonly) return;

    const checked =
      tagsRef.value.findIndex((x) => x.type === type && x.id === node.id) > -1;
    node.checked = checked;
    node.disabled = false;

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      setNodeChecked(type, node.children);
    }
  });
};

// 监听选中标签变化，同步更新所有树组件的选中状态
watch([() => tagsRef.value, activeTab], () => {
  // 确保树数据已加载
  if (!deptData.value || !roleData.value) return;

  // 直接调用setSelectedNodes函数，确保所有树组件的选中状态都正确设置
  setSelectedNodes();
});

const emit = defineEmits(["update:modelValue"]);

const deptFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};

const singleDeptChecked = (data: ITreeNode, val: string) => {
  if (!options.multiple) {
    // 直接替换整个数组，避免先删除再添加导致的闪烁
    tagsRef.value = [
      {
        id: data.id,
        value: data.value,
        label: data.data?.name || data.label,
        type: DataItemType.Department,
        cascadedDept: orgCascade.value,
        data: data.data,
      },
    ];
    emit("update:modelValue", tagsRef.value);
  }
};

const selectEmpDept = (deptId: string) => {
  deptChanging.value = true;
  selectedEmpDeptId.value = deptId;

  empData.value = [];
  selectedEmps.value = [];

  const request = deptId && deptId !== "all"
    ? employeeService.queryByDepartment<Employee>(deptId, false, adminScopeParam())
    : employeeService.query<Employee>(adminScopeParam());

  request.then((res) => {
    res.forEach((x) => {
      empData.value.push(employeeToListItem(x));

      // 检查当前员工是否在已选标签中
      if (
        tagsRef.value.find(
          (t) => t.id == x.id && t.type == DataItemType.Employee,
        )
      ) {
        // 单选模式下直接赋值，多选模式下push到数组
        if (options.multiple) {
          selectedEmps.value?.push(x.id);
        } else {
          selectedEmps.value = [x.id];
        }
      }
    });
    deptChanging.value = false;
  });
};

const empChecked = (data: IListItem, checked: boolean) => {
  if (options.multiple) {
    if (checked) {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Employee,
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          value: data.value,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        });
      }
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Employee || x.id !== data.id,
      );
    }

    emit("update:modelValue", tagsRef.value);
  } else {
    if (checked) {
      // 直接创建新数组，保留非员工标签，替换为新的员工标签
      const noEmployeeTags = tagsRef.value.filter(
        (x) => x.type != DataItemType.Employee,
      );
      tagsRef.value = [
        ...noEmployeeTags,
        {
          id: data.id,
          value: data.value,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        },
      ];
    } else {
      // 只移除当前员工标签
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Employee || x.id !== data.id,
      );
    }
    emit("update:modelValue", tagsRef.value);
  }
};
const empCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    empData.value.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Employee,
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        });
      }
    });
  } else {
    tagsRef.value = tagsRef.value.filter(
      (x) => x.type !== DataItemType.Employee,
    );
  }

  emit("update:modelValue", tagsRef.value);
};

const curEmpCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    curEmpData.value.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Employee,
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        });
      }
    });
  } else {
    tagsRef.value = tagsRef.value.filter(
      (x) =>
        x.type !== DataItemType.Employee || x.id !== curEmpData.value[0].id,
    );
  }

  emit("update:modelValue", tagsRef.value);
};

const dymChecked = (data: IListItem, checked: boolean) => {
  const item = data as ISelectedTag;
  upsertDynamicTag(item, checked, selectedDynamicManagerLevels.value);
};
const dymCheckAll = (checked: boolean) => {
  currentDynamicItems.value.forEach((item) => {
    upsertDynamicTag(item, checked, checked ? selectedDynamicManagerLevels.value : []);
  });
};

const roleFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};

const removeTag = (tag: ISelectedTag) => {
  //@ts-ignore
  if (tag.type == TagType.Department) {
    if (deptTree.value)
      deptTree.value.setChecked(tag.id, false, orgCascade.value);
    else if (curDeptTree.value)
      curDeptTree.value.setChecked(tag.id, false, false);
  } else if (tag.type == DataItemType.Role) {
    if (roleTree.value) roleTree.value.setChecked(tag.id, false, false);
  } else if (tag.type == DataItemType.Employee) {
    selectedEmps.value = selectedEmps.value?.filter((x) => x != tag.id);
  } else if (
    tag.type == DataItemType.Dynamic ||
    tag.type == DataItemType.Field
  ) {
    syncDynamicSelection();
  }
};

// 处理节点点击事件，实现点击整行选中/取消选中
const handleNodeClick = (
  node: any,
  data: ITreeNode,
  filterFn: (value: string, data: any) => boolean,
  isRole: boolean,
) => {
  updateTags(data, !data.checked, filterFn, isRole);
};

const handleCheckedChanged = (
  node: any,
  data: ITreeNode,
  filterFn: (value: string, data: any) => boolean,
  isRole: boolean,
) => {
  updateTags(data, !!data.checked, filterFn, isRole);
};

const updateTags = (
  data: ITreeNode,
  checked: boolean,
  filterFn: (value: string, data: any) => boolean,
  isRole: boolean,
) => {
  // 检查是否禁用
  if (data.disabled || data.readonly || !filterFn(keyword.value, data)) {
    return;
  }

  if (isRole) {
    // 角色选择
    if (roleTree.value) {
      updateRoleTags(data, checked);
    }
  } else {
    // 部门选择
    if (deptTree.value) {
      updateDeptTags(data, checked, false);
    } else if (curDeptTree.value) {
      updateDeptTags(data, checked, true);
    }
  }
};

const updateRoleTags = (data: ITreeNode, checked: boolean) => {
  data.checked = checked;
  if (checked) {
    if (data.type == DataItemType.Group) {
      if (data.children && data.children.length > 0) {
        data.children.forEach((child) => {
          if (!child.checked) {
            tagsRef.value.push({
              id: child.id,
              label: child.label,
              type: DataItemType.Role,
              data: child.data,
            });
            child.checked = true;
          }
        });
      }
    } else {
      tagsRef.value.push({
        id: data.id,
        label: data.label,
        type: DataItemType.Role,
        data: data.data,
      });
    }
  } else {
    if (data.type == DataItemType.Group) {
      let roleIds: string[] = [];
      if (data.children && data.children.length > 0) {
        data.children.forEach((child) => {
          roleIds.push(child.id);
          child.checked = false;
        });

        if (roleIds.length > 0)
          tagsRef.value = tagsRef.value.filter(
            (x) =>
              x.type !== DataItemType.Role ||
              roleIds.findIndex((id) => x.id == id) == -1,
          );
      }
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Role || x.id !== data.id,
      );
      if (data.data?.roleGroupId) {
        var group = roleData.value?.find((x) => x.id == data.data.roleGroupId);
        if (group) group.checked = false;
      }
    }
  }

  emit("update:modelValue", tagsRef.value);
};
const updateDeptTags = (
  data: ITreeNode,
  checked: boolean,
  isCurDept: boolean,
) => {
  //将当前节点加入Tags
  data.checked = checked;
  if (options.multiple) {
    if (checked) {
      // 添加重复判断，防止重复添加
      const existingIndex = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Department,
      );
      if (existingIndex === -1) {
        tagsRef.value.push({
          id: data.id,
          value: data.value,
          label: data.data?.name || data.label,
          type: DataItemType.Department,
          cascadedDept: orgCascade.value,
          data: data.data,
        });
      }
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Department || x.id !== data.id,
      );
    }
  } else {
    if (checked) {
      const noDeptTags = tagsRef.value.filter(
        (x) => x.type != DataItemType.Department,
      );
      tagsRef.value = [
        ...noDeptTags,
        {
          id: data.id,
          value: data.value,
          label: data.data?.name || data.label,
          type: DataItemType.Department,
          cascadedDept: orgCascade.value,
          data: data.data,
        },
      ];
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Department || x.id !== data.id,
      );
    }
  }

  //开启级联时，把下级部门设为选中并禁用
  if (!isCurDept && orgCascade.value && options.multiple) {
    updateCascadeStatus(data);
  }

  emit("update:modelValue", tagsRef.value);
};

const updateCascadeStatus = (data: ITreeNode) => {
  if (data.disabled || data.readonly) return;

  if (data.children && data.children.length > 0) {
    data.children.forEach((child) => {
      child.disabled = data.checked;

      if (
        tagsRef.value.findIndex(
          (x) => x.type === DataItemType.Department && x.id === child.id,
        ) == -1
      ) {
        child.checked = data.checked;

        updateCascadeStatus(child);
      }
    });
  }
};
const cascadeChanged = (val: boolean) => {
  orgCascade.value = val;
  tagsRef.value = tagsRef.value.map((tag) =>
    tag.type === DataItemType.Department
      ? { ...tag, cascadedDept: val }
      : tag,
  );
  if (deptData.value) {
    if (val) updateCascadeStatus(deptData.value[0]);
    else {
      setNodeChecked(DataItemType.Department, deptData.value);
    }
  }
  emit("update:modelValue", tagsRef.value);
};
const getNodeIconColor = (node: ITreeNode) => {
  switch (node.type) {
    case DataItemType.Department:
      return "var(--et-color-success)";
    default:
      return "var(--et-color-success)";
  }
};
</script>
<style scoped>
/* 隐藏标签栏 */
:deep(.hide-tabs-header .el-tabs__header) {
  display: none;
}

:deep(.hide-tabs-header .el-tabs__content) {
  margin-top: 0 !important;
  border: none !important;
}

.custom-list-item {
  cursor: pointer;
}

</style>
