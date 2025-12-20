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
                :filter-node-method="deptFilter" @check-change="deptNodeChecked">
                <template #default="{ node, data }">
                  <div class="node-data" :title="data.label">
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
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.Role)" label="角色" :name="MemberTabs.Role">
            <div class="dept-select">
              <el-tree ref="roleTree" class="dept-tree" style="margin-top: 12px" :data="roleData" :props="defaultProps"
                :expand-on-click-node="true" node-key="id" :check-strictly="false" :filter-node-method="roleFilter"
                @check-change="roleNodeChecked">
                <template #default="{ node, data }">
                  <div class="node-data" :title="data.label">
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
              <div class="left-panel" style="left: 0px; width: 460px">
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
              <div class="right-panel" style="width: 250px; right: 0px">
                <et-list v-model="selectedEmps" :data="empData" :selectable="true" :multiple="multiple"
                  style="padding-top: 0px; height: 100%" @item-check="empChecked" @all-check="empCheckAll">
                </et-list>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.Dynamic)" label="动态负责人" :name="MemberTabs.Dynamic">
            <div></div>
          </el-tab-pane>
          <el-tab-pane v-if="FlagEnum.has(showTabs, MemberTabs.CurDept)" label="当前用户所处部门" :name="MemberTabs.CurDept">
            <div class="dept-select">
              <el-tree ref="curDeptTree" class="dept-tree" style="margin-top: 12px" :data="curDeptData"
                :props="defaultProps" :expand-on-click-node="true" node-key="id" :show-checkbox="multiple"
                :filter-node-method="deptFilter" @check-change="deptNodeChecked">
                <template #default="{ node, data }">
                  <div class="node-data" :title="data.label">
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
                style="border: none;" @item-check="empChecked" @all-check="curEmpCheckAll">
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
import { MemberTabs } from "./type";
import { FlagEnum } from "@eimsnext/utils";

defineOptions({
  name: "MemberSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue: ISelectedTag[];
    showTabs?: MemberTabs | number,
    showCascade?: boolean;
    multiple?: boolean;
  }>(),
  {
    showTabs: 7,
    showCascade: false,
    multiple: true
  }
);
const userStore = useUserStore()
const orgCascade = ref(false);
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
const selectedEmps = ref<string[]>();
const deptChanging = ref(false);
const roleTree = ref<TreeInstance>();
const roleData = ref<ITreeNode[]>(); // 角色列表
const curDeptTree = ref<TreeInstance>();
const curDeptData = ref<ITreeNode[]>()
const singleDeptId = ref<string>("")
const curEmpData = ref<IListItem[]>([])

watch([keyword], ([newKeyword], [oldKeyword]) => {
  if (newKeyword != oldKeyword) {
    deptTree.value!.filter(newKeyword);
    roleTree.value!.filter(newKeyword);
    empDeptTree.value!.filter(newKeyword);
  }
});

onBeforeMount(() => {
  deptStore.load().then((data: Department[]) => {
    let detps = buildDeptTree(data);
    deptData.value = JSON.parse(JSON.stringify(detps));
    empDeptData.value = JSON.parse(JSON.stringify(detps));

    if (userStore.currentUser.deptId) {
      deptStore.get(userStore.currentUser.deptId).then(x => {
        if (x) curDeptData.value = [DeptToTreeNode(x)]
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
  });

  let roleGroups: RoleGroup[] = [];
  let roles: Role[] = []
  Promise.all([
    roleGroupService.query<RoleGroup>().then(data => { roleGroups = data }),
    roleService.query<Role>().then(data => { roles = data })
  ]
  ).then(() => roleData.value = buildRoleTree(roleGroups, roles))

  if (!props.multiple && props.modelValue?.length > 0) {
    if (props.modelValue[0].type == TagType.Department)
      singleDeptId.value = props.modelValue[0].id
  }
});

const emit = defineEmits(["update:modelValue"]);

const deptFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};
const deptNodeChecked = (data: ITreeNode, checked: boolean) => {
  if (props.multiple) {
    if (checked) {
      tagsRef.value.push({
        id: data.id,
        label: data.label,
        type: TagType.Department,
        data: data.data,
      });

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
    if (singleDeptId.value) {
      tagsRef.value = [{
        id: data.id.toString(),
        label: data.label,
        type: TagType.Department,
        data: data.data,
      }]
    }
    else {
      tagsRef.value = []
    }
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

      if (
        tagsRef.value.find((t) => t.id == x.id && t.type == TagType.Employee)
      ) {
        selectedEmps.value?.push(x.id);
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
    tagsRef.value = tagsRef.value.filter(x => x.type != TagType.Employee)
    if (checked)
      tagsRef.value.push({
        id: data.id,
        label: data.label,
        type: TagType.Employee,
        data: data.data,
      });
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
    let indicesToRemove: number[] = [];
    tagsRef.value.forEach((item, index) => {
      if (item.type == TagType.Employee) {
        indicesToRemove.splice(0, 0, index);
      }
    });

    indicesToRemove.forEach((index) => {
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
    let indicesToRemove: number[] = [];
    tagsRef.value.forEach((item, index) => {
      if (item.type == TagType.Employee &&
        curEmpData.value.find(x => x.id == item.id)
      ) {
        indicesToRemove.splice(0, 0, index);
      }
    });

    indicesToRemove.forEach((index) => {
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
