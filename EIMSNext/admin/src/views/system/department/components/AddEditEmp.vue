<template>
  <et-dialog
    v-model="showDialog"
    width="400px"
    :title="title"
    :append-to-body="true"
    :destroy-on-close="true"
    @cancel="cancel"
  >
    <el-form :model="formData" :rules="rules" label-width="80px" class="dialog-form">
      <el-form-item :label="$t('department.empCode')" prop="nickname">
        <el-input v-model="formData.code" :placeholder="$t('department.empCodePlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('department.empName')" prop="empName">
        <el-input v-model="formData.empName" :placeholder="$t('department.empNamePlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('department.phone')" prop="workPhone">
        <el-input v-model="formData.workPhone" :placeholder="$t('department.phonePlaceholder')" maxlength="11" />
      </el-form-item>
      <el-form-item :label="$t('department.email')" prop="workEmail">
        <el-input v-model="formData.workEmail" :placeholder="$t('department.emailPlaceholder')" maxlength="50" />
      </el-form-item>
      <el-form-item :label="$t('department.department')" prop="departmentId">
        <el-tree-select
          v-model="formData.departmentId"
          :placeholder="$t('department.departmentPlaceholder')"
          :data="deptList"
          :props="{ children: 'children', label: 'label', disabled: 'disabled' }"
          node-key="id"
          value-key="id"
          filterable
          check-strictly
          :render-after-expand="false"
        />
      </el-form-item>
      <!-- <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
      </el-form-item> -->
    </el-form>
    <template #footer>
      <div class="footer-wrapper">
        <div class="footer-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="footer-right">
          <slot name="footer-right">
            <el-button v-if="showSaveAndInvite" @click="saveAndInvite">{{ $t("department.saveAndInvite") }}</el-button>
            <el-button type="primary" @click="save">{{ $t("common.save") }}</el-button>
          </slot>
        </div>
      </div>
    </template>
  </et-dialog>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ITreeNode, buildDeptTree } from "@eimsnext/components";
import { Department, Employee, EmployeeRequest, EmployeeStatus, PlatformType, ScopeMode } from "@eimsnext/models";
import { departmentService, employeeService } from "@eimsnext/services";
import { useContextStore, useDeptStore } from "@eimsnext/store";

const { t } = useI18n();

defineOptions({
  name: "AddEditEmp",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    emp?: Employee;
    adminScope?: boolean;
    departmentScopeMode?: ScopeMode;
    departmentIds?: string[];
  }>(),
  {
    edit: false,
    adminScope: false,
    departmentScopeMode: ScopeMode.All,
    departmentIds: () => [],
  }
);

const deptStore = useDeptStore();
const contextStore = useContextStore();
const deptList = ref<ITreeNode[]>(); // 部门列表
const showDialog = ref(true);
const title = computed(() => props.edit ? t("department.editEmployee") : t("department.addEmployee"));
const showSaveAndInvite = computed(() => contextStore.corpPlat === PlatformType.Public);
const formData = ref<Employee>({
  id: "",
  code: "",
  empName: "",
  departmentId: "",
  status: EmployeeStatus.Active,
  isManager: false,
  userBound: true,
});
if (props.edit) formData.value = props.emp!;

const rules = reactive({
  code: [{ required: true, message: t("admin.department.messages.codeRequired"), trigger: "blur" }],
  empName: [{ required: true, message: t("admin.department.messages.nameRequired"), trigger: "blur" }],
  workPhone: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t("admin.department.messages.phoneInvalid"),
      trigger: "blur",
    },
  ],
  workEmail: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t("admin.department.messages.emailInvalid"),
      trigger: "blur",
    },
  ],
  deptId: [{ required: true, message: t("admin.department.messages.deptRequired"), trigger: "blur" }],
  inviteId: [{ message: t("admin.department.messages.roleRequired"), trigger: "blur" }],
});

onBeforeMount(() => {
  const loader = props.adminScope
    ? departmentService.query<Department>("adminScope=true")
    : deptStore.load();
  loader.then((data: Department[]) => {
    deptList.value = filterManageableDepartments(buildDeptTree(data));
  });
});

const filterManageableDepartments = (nodes: ITreeNode[]) => {
  if (props.departmentScopeMode !== ScopeMode.Partial || props.departmentIds.length === 0) return nodes;

  const allowedIds = new Set(props.departmentIds);
  const filterNode = (node: ITreeNode): ITreeNode | undefined => {
    const children = node.children?.map(filterNode).filter((child): child is ITreeNode => !!child) || [];
    if (allowedIds.has(node.id)) return { ...node, children };
    if (children.length > 0) return { ...node, disabled: true, children };
    return undefined;
  };

  return nodes.map(filterNode).filter((node): node is ITreeNode => !!node);
};

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const saveAndInvite = async () => {
  const newEmp: EmployeeRequest = {
    id: formData.value.id,
    code: formData.value.code,
    empName: formData.value.empName,
    workPhone: formData.value.workPhone,
    workEmail: formData.value.workEmail,
    departmentId: formData.value.departmentId,
    isManager: false,
    invite: formData.value.workPhone || formData.value.workEmail,
  };

  if (props.edit) {
    formData.value = await employeeService.patch<Employee>(newEmp.id, newEmp);
  } else {
    formData.value = await employeeService.post<Employee>(newEmp);
  }

  emit("ok", formData.value);
};

const save = async () => {
  const newEmp: EmployeeRequest = {
    id: formData.value.id,
    code: formData.value.code,
    empName: formData.value.empName,
    workPhone: formData.value.workPhone,
    workEmail: formData.value.workEmail,
    departmentId: formData.value.departmentId,
    isManager: false,
  };

  if (props.edit) {
    formData.value = await employeeService.patch<Employee>(newEmp.id, newEmp);
  } else {
    formData.value = await employeeService.post<Employee>(newEmp);
  }

  emit("ok", formData.value);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
