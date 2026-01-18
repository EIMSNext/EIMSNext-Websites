<template>
  <div class="member-select">
    <selected-tags v-model="tagsRef" :closable="true" @tagRemoved="removeTag" />
    <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable placeholder="请输入" />
    <div class="search-result">
      <div class="result-container">
        <el-tabs v-model="activeTab" style="flex: 1" :class="{ 'hide-tabs-header': activeTab == showTabs }">
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.Department)" label="组织架构" :name="MemberTabs.Department">
            <div class="dept-select">
              <el-tree ref="deptTree" class="dept-tree" style="margin-top: 12px" :data="deptData" :props="defaultProps"
                :expand-on-click-node="true" node-key="id" :show-checkbox="multiple" :check-strictly="!orgCascade"
                :filter-node-method="deptFilter" @check-change="orgNodeChecked">
                <template #default="{ node, data }">
                  <div class="node-data" :title="data.label" @click="handleNodeClick(node, data, deptFilter, false)">
                    <div class="node-wrapper">
                      <et-icon :icon="data.icon" class="node-icon" />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox v-if="multiple" v-model="node.checked" @click.stop=""
                          :disabled="!deptFilter(keyword, data)" />
                        <el-radio v-if="!multiple" v-model="singleDeptId" :value="data.id" @click.stop=""
                          @change="(val: string) => singleDeptChecked(data, val)"
                          :disabled="!deptFilter(keyword, data)" />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
              <div v-if="showCascade"><el-checkbox v-model="orgCascade">动态包含下级部门</el-checkbox></div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.Role)" label="角色" :name="MemberTabs.Role">
            <div class="dept-select">
              <el-tree ref="roleTree" class="dept-tree" style="margin-top: 12px" :data="roleData" :props="defaultProps"
                :expand-on-click-node="true" node-key="id" :check-strictly="false" :filter-node-method="roleFilter"
                @check-change="roleNodeChecked">
                <template #default="{ node, data }">
                  <div class="node-data" :title="data.label" @click="handleNodeClick(node, data, roleFilter, true)">
                    <div class="node-wrapper">
                      <et-icon :icon="data.icon" class="node-icon" />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox v-model="node.checked" @click.stop="" :disabled="!roleFilter(keyword, data)" />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.Employee)" label="员工" :name="MemberTabs.Employee">
            <div class="emp-select">
              <div class="left-panel">
                <div class="filter-items">
                  <div class="filter-item" :class="{ active: selectedEmpDeptId == 'all' }"
                    @click.stop="selectEmpDept('all')">
                    全部员工
                  </div>
                </div>
                <el-tree ref="empDeptTree" class="dept-tree" :data="empDeptData" :props="defaultProps"
                  :expand-on-click-node="true" node-key="id" :filter-node-method="deptFilter">
                  <template #default="{ node, data }">
                    <div class="node-data" :title="data.label" @click.stop="selectEmpDept(data.id)">
                      <div class="node-wrapper">
                        <et-icon :icon="data.icon" icon-class="node-icon"></et-icon>
                        <span class="node-label">{{ data.label }}</span>
                      </div>
                    </div>
                  </template>
                </el-tree>
              </div>
              <div class="right-panel">
                <et-list v-model="selectedEmps" :data="empData" :selectable="true" :multiple="multiple"
                  style="padding-top: 0px; height: 100%" @item-check="empChecked" @all-check="empCheckAll">
                </et-list>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="dynamicMembers && FlagEnum.has(showTabs, MemberTabs.Dynamic)" label="动态负责人"
            :name="MemberTabs.Dynamic">
            <div class="dept-select">
              <et-list v-model="selectedDyMembers" :data="dynamicMembers" :selectable="true" :multiple="multiple"
                :showCount="false" style="border: none;" @item-check="dymChecked" @all-check="dymCheckAll">
              </et-list>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.CurDept)" label="当前用户所处部门" :name="MemberTabs.CurDept">
            <div class="dept-select">
              <el-tree ref="curDeptTree" class="dept-tree" style="margin-top: 12px" :data="curDeptData"
                :props="defaultProps" :expand-on-click-node="true" node-key="id" :show-checkbox="multiple"
                :filter-node-method="deptFilter" @check-change="deptNodeChecked">
                <template #default="{ node, data }">
                  <div class="node-data" :title="data.label" @click="handleNodeClick(node, data, deptFilter, false)">
                    <div class="node-wrapper">
                      <et-icon :icon="data.icon" class="node-icon" />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox v-if="multiple" v-model="node.checked" @click.stop=""
                          :disabled="!deptFilter(keyword, data)" />
                        <el-radio v-if="!multiple" v-model="singleDeptId" :value="data.id" @click.stop=""
                          @change="(val: string) => singleDeptChecked(data, val)"
                          :disabled="!deptFilter(keyword, data)" />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.CurUser)" label="当前用户" :name="MemberTabs.CurUser">
            <div class="dept-select">
              <et-list v-model="selectedEmps" :data="curEmpData" :selectable="true" :multiple="multiple"
                :showCount="false" style="border: none;" @item-check="empChecked" @all-check="curEmpCheckAll">
              </et-list>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { ref, reactive, watch, onBeforeMount, toRef } from "vue";
import { TreeInstance } from "element-plus";
import { DeptToTreeNode, EmployeeToListItem, ITreeNode, TreeNodeType, buildDeptTree, buildRoleTree } from "../common";
import { ISelectedTag, TagType } from "../selectedTags/type";
import { Department, Employee, RoleGroup, Role } from "@eimsnext/models";
import { useDeptStore, useUserStore } from "@eimsnext/store";
import { employeeService, roleGroupService, roleService } from "@eimsnext/services";
import { IListItem } from "../list/type";
import { IMemberLimit, MemberTabs } from "./type";
import { FlagEnum } from "@eimsnext/utils";

defineOptions({
  name: "MemberSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue: ISelectedTag[];
    showTabs?: MemberTabs | number,
    cascadedDept?: boolean;
    showCascade?: boolean;
    multiple?: boolean;
    limit?: IMemberLimit;
    dynamicMembers?: ISelectedTag[];
  }>(),
  {
    showTabs: 7,
    cascadedDept: false,
    showCascade: false,
    multiple: true
  }
);
const userStore = useUserStore()
const orgCascade = ref(props.cascadedDept ?? false);
const defaultProps = { children: "children", label: "label" };
const tagsRef = toRef(props.modelValue);
const keyword = ref("");
const activeTab = ref(FlagEnum.getMinValue(MemberTabs, props.showTabs));
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
const curDeptData = ref<ITreeNode[]>()
const singleDeptId = ref<string>("")
const curEmpData = ref<IListItem[]>([])
const selectedDyMembers = ref<string[]>();

watch([keyword], ([newKeyword], [oldKeyword]) => {
  if (newKeyword != oldKeyword) {
    deptTree.value!.filter(newKeyword);
    roleTree.value!.filter(newKeyword);
    empDeptTree.value!.filter(newKeyword);
  }
});

// 根据可选范围过滤部门树
const filterDeptTreeByScope = (treeData: ITreeNode[]): ITreeNode[] => {
  if (!props.limit || !props.limit.depts || props.limit.depts.length == 0) {
    return treeData;
  }

  const scopeDeptIds = props.limit.depts.map(dept => dept.id);

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
    nodes.forEach(node => {
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
      // 过滤子节点，只保留符合条件的子节点
      const filteredChildren = node.children
        ?.map(child => filterNode(child))
        .filter((child): child is ITreeNode => child !== null);

      return {
        ...node,
        children: filteredChildren
      };
    }

    // 否则不保留
    return null;
  };

  // 遍历所有根节点，过滤出符合条件的节点
  return treeData
    .map(node => filterNode(node))
    .filter((node): node is ITreeNode => node !== null);
};

onBeforeMount(() => {
  //复选模式下，如果支持级联选择并且显示级联框，则是否级联由数据决定
  if (props.multiple && props.cascadedDept && props.showCascade) {
    let firstDept = props.modelValue.find(x => x.type == TagType.Department)
    if (firstDept && firstDept.cascadedDept) orgCascade.value = firstDept.cascadedDept
  }

  deptStore.load().then((data: Department[]) => {
    let detps = buildDeptTree(data);
    const filteredDeptData = filterDeptTreeByScope(detps);
    deptData.value = JSON.parse(JSON.stringify(filteredDeptData));
    empDeptData.value = JSON.parse(JSON.stringify(filteredDeptData));

    if (userStore.currentUser.deptId) {
      deptStore.get(userStore.currentUser.deptId).then(x => {
        if (x) {
          const curDeptNode = [DeptToTreeNode(x)];
          // 不应用范围过滤，直接显示当前用户部门
          curDeptData.value = curDeptNode;
        }
      })
    }
    if (userStore.currentUser) {
      let emp: Employee = {
        id: userStore.currentUser.empId!,
        code: userStore.currentUser.empCode!,
        empName: userStore.currentUser.empName!,
        status: 0,
        departmentId: userStore.currentUser.deptId!,
        approved: true,
        isManager: false
      }
      curEmpData.value = [EmployeeToListItem(emp)]
    }

    // 部门树数据加载完成后，手动触发一次选中状态的设置
    setSelectedNodes();
  });

  let roleGroups: RoleGroup[] = [];
  let roles: Role[] = []
  Promise.all([
    roleGroupService.query<RoleGroup>().then(data => { roleGroups = data }),
    roleService.query<Role>().then(data => { roles = data })
  ]
  ).then(() => {
    roleData.value = buildRoleTree(roleGroups, roles);
    // 角色树数据加载完成后，手动触发一次选中状态的设置
    setSelectedNodes();
  })

  if (!props.multiple && props.modelValue?.length > 0) {
    if (props.modelValue[0].type == TagType.Department)
      singleDeptId.value = props.modelValue[0].id
  }
});

// 手动设置选中节点
const setSelectedNodes = () => {
  // 确保树数据已加载
  if (!deptData.value || !roleData.value) return;

  // 获取部门类型的选中项ID列表
  const departmentSelectedIds = tagsRef.value
    .filter(tag => tag.type === TagType.Department)
    .map(tag => tag.id);

  // 获取角色类型的选中项ID列表
  const roleSelectedIds = tagsRef.value
    .filter(tag => tag.type === TagType.Role)
    .map(tag => tag.id);

  // 获取员工类型的选中项ID列表
  const employeeSelectedIds = tagsRef.value
    .filter(tag => tag.type === TagType.Employee)
    .map(tag => tag.id);

  // 如果是单选模式，设置singleDeptId
  if (!props.multiple && departmentSelectedIds.length > 0) {
    singleDeptId.value = departmentSelectedIds[0];
  }

  // 设置员工列表的选中状态
  selectedEmps.value = employeeSelectedIds;

  // 遍历树节点，设置选中状态
  const setNodeChecked = (tree: TreeInstance | undefined, nodes: any[], selectedIds: string[]) => {
    if (!tree || !nodes) return;

    nodes.forEach(node => {
      // 设置当前节点的选中状态
      const isChecked = selectedIds.includes(node.id);
      tree.setChecked(node, isChecked, false);

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        setNodeChecked(tree, node.children, selectedIds);
      }
    });
  };

  // 部门的下级自动选中，不能手动，依赖于orgCascade实现动态
  // setNodeChecked(deptTree.value, deptData.value, departmentSelectedIds);
  if (curDeptData.value) {
    setNodeChecked(curDeptTree.value, curDeptData.value, departmentSelectedIds);
  }

  // 设置角色树的选中状态
  setNodeChecked(roleTree.value, roleData.value, roleSelectedIds);
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
const orgNodeChecked = (data: ITreeNode, checked: boolean) => {
  if (props.multiple) {
    if (checked) {
      // 添加重复判断，防止重复添加
      const existingIndex = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Department
      );
      if (existingIndex === -1) {
        tagsRef.value.push({
          id: data.id,
          code: data.code,
          label: data.data?.name || data.label,
          type: TagType.Department,
          data: data.data,
          cascadedDept: orgCascade.value
        });
      }
    } else {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Department
      );
      if (index > -1) tagsRef.value.splice(index, 1);
    }
    emit("update:modelValue", tagsRef.value);
  }
};
const deptNodeChecked = (data: ITreeNode, checked: boolean) => {
  if (props.multiple) {
    if (checked) {
      // 添加重复判断，防止重复添加
      const existingIndex = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Department
      );
      if (existingIndex === -1) {
        tagsRef.value.push({
          id: data.id,
          code: data.code,
          label: data.data?.name || data.label,
          type: TagType.Department,
          data: data.data,
        });
      }
    } else {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Department
      );
      if (index > -1) tagsRef.value.splice(index, 1);
    }
    emit("update:modelValue", tagsRef.value);
  }
};
const singleDeptChecked = (data: ITreeNode, val: string) => {
  if (!props.multiple) {
    // 直接替换整个数组，避免先删除再添加导致的闪烁
    tagsRef.value = [{
      id: data.id,
      code: data.code,
      label: data.data?.name || data.label,
      type: TagType.Department,
      data: data.data,
    }];
    emit("update:modelValue", tagsRef.value);
  }
}

const selectEmpDept = (deptId: string) => {
  // console.log("selectEmpDept", deptId)
  deptChanging.value = true;
  selectedEmpDeptId.value = deptId;

  let $filter = deptId == "all" ? "" : `$filter=departmentId eq '${deptId}'`;
  empData.value = [];
  selectedEmps.value = [];
  employeeService.query<Employee>($filter).then((res) => {
    res.forEach((x) => {
      empData.value.push(EmployeeToListItem(x));

      // 检查当前员工是否在已选标签中
      if (
        tagsRef.value.find((t) => t.id == x.id && t.type == TagType.Employee)
      ) {
        // 单选模式下直接赋值，多选模式下push到数组
        if (props.multiple) {
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
  //  console.log("empCheck", data, checked);
  if (props.multiple) {
    if (checked) {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Employee
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          code: data.code,
          label: data.label,
          type: TagType.Employee,
          data: data.data,
        });
      }
    } else {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Employee
      );
      //  console.log("index", index, tagsRef);
      if (index && index > -1) tagsRef.value.splice(index, 1);
    }

    emit("update:modelValue", tagsRef.value);
  } else {
    if (checked) {
      // 直接创建新数组，保留非员工标签，替换为新的员工标签
      const nonEmployeeTags = tagsRef.value.filter(x => x.type != TagType.Employee);
      tagsRef.value = [
        ...nonEmployeeTags,
        {
          id: data.id,
          code: data.code,
          label: data.label,
          type: TagType.Employee,
          data: data.data,
        }
      ];
    } else {
      // 只移除当前员工标签
      const index = tagsRef.value.findIndex(x => x.id == data.id && x.type == TagType.Employee);
      if (index > -1) {
        tagsRef.value = [...tagsRef.value.slice(0, index), ...tagsRef.value.slice(index + 1)];
      }
    }
    emit("update:modelValue", tagsRef.value);
  }
};
const empCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    empData.value.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Employee
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: TagType.Employee,
          data: data.data,
        });
      }
    });
  } else {
    let toRemove: number[] = [];
    tagsRef.value.forEach((item, index) => {
      if (item.type == TagType.Employee) {
        toRemove.splice(0, 0, index);
      }
    });

    toRemove.forEach((index) => {
      tagsRef.value.splice(index, 1);
    });
  }

  emit("update:modelValue", tagsRef.value);
};

const curEmpCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    curEmpData.value.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Employee
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: TagType.Employee,
          data: data.data,
        });
      }
    });
  } else {
    let toRemove: number[] = [];
    tagsRef.value.forEach((item, index) => {
      if (item.type == TagType.Employee &&
        curEmpData.value.find(x => x.id == item.id)
      ) {
        toRemove.splice(0, 0, index);
      }
    });

    toRemove.forEach((index) => {
      tagsRef.value.splice(index, 1);
    });
  }

  emit("update:modelValue", tagsRef.value);
};

const dymChecked = (data: IListItem, checked: boolean) => {
  //  console.log("empCheck", data, checked);
  if (props.multiple) {
    if (checked) {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Dynamic
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          code: data.code,
          label: data.label,
          type: TagType.Dynamic,
          data: data.data,
        });
      }
    } else {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Dynamic
      );
      //  console.log("index", index, tagsRef);
      if (index && index > -1) tagsRef.value.splice(index, 1);
    }

    emit("update:modelValue", tagsRef.value);
  } else {
    if (checked) {
      // 直接创建新数组
      const nonDynamics = tagsRef.value.filter(x => x.type != TagType.Dynamic);
      tagsRef.value = [
        ...nonDynamics,
        {
          id: data.id,
          code: data.code,
          label: data.label,
          type: TagType.Dynamic,
          data: data.data,
        }
      ];
    } else {
      // 只移除当前标签
      const index = tagsRef.value.findIndex(x => x.id == data.id && x.type == TagType.Dynamic);
      if (index > -1) {
        tagsRef.value = [...tagsRef.value.slice(0, index), ...tagsRef.value.slice(index + 1)];
      }
    }
    emit("update:modelValue", tagsRef.value);
  }
};
const dymCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    props.dynamicMembers!.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == TagType.Dynamic
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: TagType.Dynamic,
          data: data.data,
        });
      }
    });
  } else {
    let toRemove: number[] = [];
    tagsRef.value.forEach((item, index) => {
      if (item.type == TagType.Dynamic) {
        toRemove.splice(0, 0, index);
      }
    });

    toRemove.forEach((index) => {
      tagsRef.value.splice(index, 1);
    });
  }

  emit("update:modelValue", tagsRef.value);
};

const roleFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};
const roleNodeChecked = (data: ITreeNode, checked: boolean) => {
  if (checked) {
    tagsRef.value.push({
      id: data.id,
      label: data.label,
      type: TagType.Role,
      data: data.data,
    });
  } else {
    let index = tagsRef.value.findIndex(
      (x) => x.id == data.id && x.type == TagType.Role
    );
    if (index > -1) tagsRef.value.splice(index, 1);
  }

  emit("update:modelValue", tagsRef.value);
};
const removeTag = (tag: ISelectedTag) => {
  //@ts-ignore
  if (tag.type == TagType.Department) {
    if (deptTree.value)
      deptTree.value.setChecked(tag.id, false, orgCascade.value);
    else
      if (curDeptTree.value)
        curDeptTree.value.setChecked(tag.id, false, false);
  }
  else if (tag.type == TagType.Role) {
    if (roleTree.value)
      roleTree.value.setChecked(tag.id, false, false);
  }
  else if (tag.type == TagType.Employee) {
    selectedEmps.value = selectedEmps.value?.filter((x) => x != tag.id);
  }
  else if (tag.type == TagType.Dynamic) {
    selectedDyMembers.value = selectedDyMembers.value?.filter((x) => x != tag.id)
  }
};

// 处理节点点击事件，实现点击整行选中/取消选中
const handleNodeClick = (node: any, data: ITreeNode, filterFn: (value: string, data: any) => boolean, isRole: boolean) => {
  // 检查是否禁用
  if (!filterFn(keyword.value, data)) {
    return;
  }

  // 根据当前选中状态切换
  const newCheckedState = !node.checked;

  if (isRole) {
    // 角色选择
    if (roleTree.value) {
      roleTree.value.setChecked(node, newCheckedState, false);
    }
  } else {
    // 部门选择
    if (deptTree.value) {
      deptTree.value.setChecked(node, newCheckedState, orgCascade.value);
    } else if (curDeptTree.value) {
      curDeptTree.value.setChecked(node, newCheckedState, false);
    }
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
</style>
