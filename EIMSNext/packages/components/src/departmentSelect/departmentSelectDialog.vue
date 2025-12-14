<template>
  <et-dialog
    :model-value="modelValue"
    class="department-select-dialog"
    title="部门列表"
    destroy-on-close
    width="750px"
    @cancel="cancel"
    @ok="save"
  >
    <div class="dialog-content">
      <!-- 显示当前选择的部门 -->
      <!-- 单选模式 -->
      <div v-if="!props.multiple && selectedDepartment && (selectedDepartment as ISelectedTag).id && (selectedDepartment as ISelectedTag).label" class="selected-dept-list">
        <div class="selected-dept-tags">
          <el-tag
            :closable="true"
            @close="clearSelectedDept"
            class="dept-tag"
          >
            {{ (selectedDepartment as ISelectedTag).label }}
          </el-tag>
        </div>
      </div>
      
      <!-- 多选模式 -->
      <div v-else-if="(selectedDepartment as ISelectedTag[]).length > 0" class="selected-dept-list">
        <div class="selected-dept-header">
          <span class="selected-dept-label">已选择部门：</span>
          <!-- 移除多余的取消按钮 -->
        </div>
        <div class="selected-dept-tags">
          <el-tag
            v-for="dept in selectedDepartment as ISelectedTag[]"
            :key="dept.id"
            :closable="true"
            @close="removeSelectedDept(dept.id)"
            class="dept-tag"
          >
            {{ dept.label }}
          </el-tag>
        </div>
      </div>
      <div class="search-header">
        <div class="search-tag" v-if="keyword">
          <span>{{ keyword }}</span>
          <el-button type="text" @click="keyword = ''">
            <el-icon><CircleClose /></el-icon>
          </el-button>
        </div>
        <el-input v-model="keyword" class="search-input" prefix-icon="Search" clearable placeholder="搜索(多个关键词用空格隔开)" />
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="组织架构" name="dept">
          <div class="dept-select">
            <el-tree ref="deptTree" class="dept-tree" style="margin-top: 12px" :data="deptData" :props="defaultProps"
              :expand-on-click-node="false" node-key="id" :filter-node-method="deptFilter">
              <template #default="{ node, data }">
                <div class="node-data" :title="data.label">
                  <div class="node-wrapper" @click="selectDept(data)">
                    <i class="fc-icon icon-tree"></i>
                    <span class="node-label" style="cursor: pointer;">{{ data.label }}</span>
                    <div class="node-action" @click.stop>
                      <!-- 单选模式 -->
                      <el-radio v-if="!props.multiple" v-model="selectedDeptId" :label="data.id" @change="selectDept(data)" :disabled="!deptFilter(keyword, data)" />
                      <!-- 多选模式 -->
                      <el-checkbox v-else v-model="selectedDeptIds" :label="data.id" @change="selectDept(data)" :disabled="!deptFilter(keyword, data)" />
                    </div>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
        <el-tab-pane label="当前用户所处部门" name="current">
          <div class="dept-select">
            <el-tree ref="currentDeptTree" class="dept-tree" style="margin-top: 12px" :data="currentDeptData" :props="defaultProps"
              :expand-on-click-node="false" node-key="id" :filter-node-method="deptFilter">
              <template #default="{ node, data }">
                <div class="node-data" :title="data.label">
                  <div class="node-wrapper" @click="selectDept(data)">
                    <i class="fc-icon icon-tree"></i>
                    <span class="node-label" style="cursor: pointer;">{{ data.label }}</span>
                    <div class="node-action" @click.stop>
                      <!-- 单选模式 -->
                      <el-radio v-if="!props.multiple" v-model="selectedDeptId" :label="data.id" @change="selectDept(data)" :disabled="!deptFilter(keyword, data)" />
                      <!-- 多选模式 -->
                      <el-checkbox v-else v-model="selectedDeptIds" :label="data.id" @change="selectDept(data)" :disabled="!deptFilter(keyword, data)" />
                    </div>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </et-dialog>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { ref, reactive, onBeforeMount, toRef, watch, nextTick } from "vue";
import { TreeInstance } from "element-plus";
import { ITreeNode, TreeNodeType, buildDeptTree } from "../common";
import { ISelectedTag, TagType } from "../selectedTags/type";
import { Department } from "@eimsnext/models";
import { useDeptStore, useUserStore } from "@eimsnext/store";
import { employeeService } from "@eimsnext/services";
import { ODataQueryModel } from "@eimsnext/services/requestModel";
import { Employee } from "@eimsnext/models";


defineOptions({
  name: "DepartmentSelectDialog",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    department: ISelectedTag[];
    multiple?: boolean;
  }>(),
  {
    modelValue: false,
    department: () => [] as ISelectedTag[],
    multiple: false,
  }
);

const defaultProps = { children: "children", label: "label" };
const keyword = ref("");
const activeTab = ref("dept");
const deptTree = ref<TreeInstance>();
const currentDeptTree = ref<TreeInstance>();
const deptStore = useDeptStore();
const deptData = ref<ITreeNode[]>(); // 部门列表
const currentDeptData = ref<ITreeNode[]>(); // 当前用户所处部门列表
// 单选模式
const selectedDeptId = ref("");
// 多选模式
const selectedDeptIds = ref<string[]>([]);
// 选中的部门，单选时存储单个对象，多选时存储数组
const selectedDepartment = ref<ISelectedTag | ISelectedTag[]>(props.multiple ? [] as ISelectedTag[] : {} as ISelectedTag);

// 初始化选中的部门
const initSelectedDepartment = () => {
  if (props.department && props.department.length > 0) {
    if (props.multiple) {
      // 多选模式
      const deptIds = props.department.map(dept => dept.id);
      selectedDeptIds.value = deptIds;
      selectedDepartment.value = [...props.department];
      
      // 延迟执行，确保树数据已加载
      nextTick(() => {
        // 展开所有选中部门的父节点
        props.department.forEach(dept => {
          if (deptTree.value && dept.id) {
            deptTree.value.setCurrentKey(dept.id);
            expandParentNodes(deptTree.value, dept.id);
          }
          if (currentDeptTree.value && dept.id) {
            currentDeptTree.value.setCurrentKey(dept.id);
            expandParentNodes(currentDeptTree.value, dept.id);
          }
        });
      });
    } else {
      // 单选模式
      const dept = props.department[0];
      selectedDepartment.value = dept;
      selectedDeptId.value = dept.id;
      
      // 延迟执行，确保树数据已加载
      nextTick(() => {
        // 展开组织架构标签页的对应节点
        if (deptTree.value && dept.id) {
          deptTree.value.setCurrentKey(dept.id);
          expandParentNodes(deptTree.value, dept.id);
        }
        // 展开当前用户所处部门标签页的对应节点
        if (currentDeptTree.value && dept.id) {
          currentDeptTree.value.setCurrentKey(dept.id);
          expandParentNodes(currentDeptTree.value, dept.id);
        }
      });
    }
  } else {
    // 当没有部门时，重置内部状态
    if (props.multiple) {
      // 多选模式
      selectedDepartment.value = [] as ISelectedTag[];
      selectedDeptIds.value = [];
    } else {
      // 单选模式
      selectedDepartment.value = {} as ISelectedTag;
      selectedDeptId.value = "";
    }
  }
};

// 展开父节点的辅助方法
const expandParentNodes = (tree: TreeInstance, nodeId: string) => {
  const node = tree.getNode(nodeId);
  if (node) {
    // 展开所有父节点
    let parent = node.parent;
    while (parent) {
      parent.expanded = true;
      // 根节点的parent是null或者level是0
      if (!parent.parent) {
        break;
      }
      parent = parent.parent;
    }
  }
};

// 初始化选中的部门
initSelectedDepartment();

watch([keyword], ([newKeyword, oldKeyword]: string[]) => {
  if (newKeyword != oldKeyword) {
    deptTree.value!.filter(newKeyword);
    currentDeptTree.value!.filter(newKeyword);
  }
});

// 监听对话框打开事件，重新初始化选中部门
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 对话框打开时初始化选中部门
    initSelectedDepartment();
  }
});

// 监听部门变化事件
watch(() => props.department, (newDept) => {
  if (props.modelValue) {
    // 只有当对话框打开时，才重新初始化选中部门
    initSelectedDepartment();
  }
}, { deep: true });

// 获取当前用户部门数据
const getCurrentUserDepts = async (allDepts: Department[]) => {
  try {
    // 获取当前用户信息
    const userStoreInstance = useUserStore();
    const currentUser = await userStoreInstance.get();
    console.log("currentUser:", currentUser);
    // 如果currentUser是空，返回前两个部门（模拟登陆用户）
    if (!currentUser || !currentUser.empCode) {
      if (allDepts.length > 0) {
        const userDepts = allDepts.slice(0, 2);
        return buildDeptTree(userDepts);
      }
      return [];
    }
    // 根据当前用户的empCode查询对应的员工信息
    const queryModel = new ODataQueryModel();
    queryModel.$filter = `code eq '${currentUser.empCode}'`;
    queryModel.$expand = "department";
    queryModel.$skip = 0;
    queryModel.$top = 1;
    
    const employees = await employeeService.query<Employee>(queryModel);
    
    if (employees && employees.length > 0) {
      const employee = employees[0] as any;
      
      // 检查员工是否有departmentId
      if (employee.departmentId) {
        // 获取用户所在部门
        const userDept = allDepts.find(dept => dept.id === employee.departmentId);
        if (userDept) {
          // 收集用户部门及其所有父部门
          const userDepts: Department[] = [];
          let currentDept: Department | undefined = userDept;
          
          // 递归查找所有父部门，直到根部门
          while (currentDept) {
            userDepts.push(currentDept);
            // 查找父部门
            currentDept = allDepts.find(dept => dept.id === (currentDept as Department).parentId);
          }
          
          // 调用buildDeptTree构建部门树
          return buildDeptTree(userDepts);
        }
      }
    }
    
    // 如果没有找到员工或者员工没有部门ID，返回空数组
    return [];
  } catch (error) {
    console.error("获取当前用户部门失败:", error);
    return [];
  }
};

onBeforeMount(() => {
  deptStore.load().then((data: Department[]) => {
    let allDepts = buildDeptTree(data);
    deptData.value = JSON.parse(JSON.stringify(allDepts));
    
    // 获取当前用户部门数据
    getCurrentUserDepts(data).then((userDepts) => {
      currentDeptData.value = userDepts;
      
      // 树数据加载完成后，初始化选中部门
      if (props.modelValue) {
        initSelectedDepartment();
      }
    });
  });
});

const emit = defineEmits(["update:modelValue", "ok", "cancel"]);

const deptFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};

const selectDept = (data: ITreeNode) => {
  if (props.multiple) {
    // 多选模式
    const selectedDepts = selectedDepartment.value as ISelectedTag[];
    const deptId = data.id;
    const existingIndex = selectedDepts.findIndex(dept => dept.id === deptId);
    
    if (existingIndex > -1) {
      // 如果已选中，则移除
      selectedDepts.splice(existingIndex, 1);
      selectedDeptIds.value = selectedDepts.map(dept => dept.id);
    } else {
      // 如果未选中，则添加
      const newDept: ISelectedTag = {
        id: data.id,
        label: data.label,
        type: TagType.Department,
        data: data.data,
      };
      selectedDepts.push(newDept);
      selectedDeptIds.value = [...selectedDeptIds.value, deptId];
    }
    
    // 更新选中部门对象
    selectedDepartment.value = [...selectedDepts];
  } else {
    // 单选模式
    // 更新选中部门ID，触发radio选中
    selectedDeptId.value = data.id;
    // 更新选中部门对象
    selectedDepartment.value = {
      id: data.id,
      label: data.label,
      type: TagType.Department,
      data: data.data,
    };
  }
};

// 清除选中的部门
const clearSelectedDept = () => {
  if (props.multiple) {
    // 多选模式
    selectedDepartment.value = [] as ISelectedTag[];
    selectedDeptIds.value = [];
  } else {
    // 单选模式
    selectedDepartment.value = {} as ISelectedTag;
    selectedDeptId.value = "";
  }
};

// 移除单个选中的部门
const removeSelectedDept = (deptId: string) => {
  if (props.multiple) {
    const selectedDepts = selectedDepartment.value as ISelectedTag[];
    const index = selectedDepts.findIndex(dept => dept.id === deptId);
    if (index > -1) {
      selectedDepts.splice(index, 1);
      // 更新选中部门ID数组
      selectedDeptIds.value = selectedDepts.map(dept => dept.id);
      // 更新选中部门对象
      selectedDepartment.value = [...selectedDepts];
    }
  }
};

const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
  // 重置内部状态
  selectedDepartment.value = {} as ISelectedTag;
  selectedDeptId.value = "";
};

const save = () => {
  emit("update:modelValue", false);
  
  if (props.multiple) {
    // 多选模式
    const selectedDepts = selectedDepartment.value as ISelectedTag[];
    // 过滤出有效的部门（有id和label）
    const validDepts = selectedDepts.filter(dept => dept.id && dept.label);
    emit("ok", validDepts);
    // 重置内部状态
    selectedDepartment.value = [] as ISelectedTag[];
    selectedDeptIds.value = [];
  } else {
    // 单选模式 - 始终返回数组，让父组件统一处理
    // 检查是否有有效的部门选择
    const dept = selectedDepartment.value as ISelectedTag;
    if (dept && dept.id && dept.label) {
      emit("ok", [dept]);
    } else {
      // 返回空数组
      emit("ok", []);
    }
    // 重置内部状态
    selectedDepartment.value = {} as ISelectedTag;
    selectedDeptId.value = "";
  }
};
</script>