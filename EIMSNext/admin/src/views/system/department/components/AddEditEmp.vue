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
      <el-form-item :label="$t('department.empCode')" prop="code">
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
      <el-form-item :label="$t('department.department')" prop="departments">
        <el-tree-select
          v-model="selectedDepartmentIds"
          :placeholder="$t('department.departmentPlaceholder')"
          :data="deptList"
          :props="{ children: 'children', label: 'label', disabled: 'disabled' }"
          node-key="id"
          value-key="id"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          check-strictly
          :render-after-expand="false"
        />
        <div v-if="selectedDepartmentIds.length" class="department-relations">
          <div v-for="departmentId in selectedDepartmentIds" :key="departmentId" class="department-relation-row">
            <span class="department-relation-name">{{ getDepartmentName(departmentId) }}</span>
            <el-checkbox v-model="departmentManagers[departmentId]">{{ $t("department.manager") }}</el-checkbox>
          </div>
        </div>
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
import { Department, Employee, EmployeeDepartmentRequest, EmployeeRequest, PlatformType } from "@eimsnext/models";
import { employeeService } from "@eimsnext/services";
import { useContextStore, useDeptStore } from "@eimsnext/store";
import { ElMessage } from "element-plus";

const { t } = useI18n();

defineOptions({
  name: "AddEditEmp",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    emp?: Employee;
  }>(),
  {
    edit: false,
  }
);

const deptStore = useDeptStore();
const contextStore = useContextStore();
const deptList = ref<ITreeNode[]>(); // 部门列表
const showDialog = ref(true);
const title = computed(() => props.edit ? t("department.editEmployee") : t("department.addEmployee"));
const showSaveAndInvite = computed(() => contextStore.corpPlat === PlatformType.Public);
const departmentNameMap = ref<Record<string, string>>({});
const selectedDepartmentIds = ref<string[]>([]);
const departmentManagers = reactive<Record<string, boolean>>({});
const formData = ref<EmployeeRequest>({
  id: "",
  code: "",
  empName: "",
  departments: [],
});
if (props.edit && props.emp) {
  formData.value = {
    id: props.emp.id,
    code: props.emp.code,
    empName: props.emp.empName,
    workPhone: props.emp.workPhone,
    workEmail: props.emp.workEmail,
    departments: props.emp.departments?.map((x, index) => ({
      departmentId: x.id,
      isManager: x.isManager,
      sortValue: x.sortValue ?? index,
    })) ?? [],
  };
  selectedDepartmentIds.value = props.emp.departments?.map((x) => x.id) ?? [];
  props.emp.departments?.forEach((x) => {
    departmentManagers[x.id] = !!x.isManager;
  });
}

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
  departments: [{ required: true, message: t("admin.department.messages.deptRequired"), trigger: "change" }],
  inviteId: [{ message: t("admin.department.messages.roleRequired"), trigger: "blur" }],
});

onBeforeMount(() => {
  deptStore.load().then((data: Department[]) => {
    deptList.value = buildDeptTree(data);
    departmentNameMap.value = Object.fromEntries(data.map((x) => [x.id, x.name]));
  });
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const getDepartmentName = (departmentId: string) => {
  return departmentNameMap.value[departmentId] ?? departmentId;
};

watch(selectedDepartmentIds, (departmentIds) => {
  departmentIds.forEach((departmentId) => {
    if (departmentManagers[departmentId] === undefined) {
      departmentManagers[departmentId] = false;
    }
  });

  Object.keys(departmentManagers).forEach((departmentId) => {
    if (!departmentIds.includes(departmentId)) {
      delete departmentManagers[departmentId];
    }
  });

  formData.value.departments = buildDepartments();
});

const buildDepartments = (): EmployeeDepartmentRequest[] => {
  return selectedDepartmentIds.value.map((departmentId, index) => ({
    departmentId,
    isManager: !!departmentManagers[departmentId],
    sortValue: index,
  }));
};

const buildRequest = (invite?: string): EmployeeRequest | undefined => {
  const departments = buildDepartments();
  if (!departments.length) {
    ElMessage.warning(t("admin.department.messages.deptRequired"));
    return;
  }

  return {
    id: formData.value.id,
    code: formData.value.code,
    empName: formData.value.empName,
    workPhone: formData.value.workPhone,
    workEmail: formData.value.workEmail,
    departments,
    invite,
  };
};

const saveAndInvite = async () => {
  const newEmp = buildRequest(formData.value.workPhone || formData.value.workEmail);
  if (!newEmp) return;

  if (props.edit) {
    const saved = await employeeService.patch<Employee>(newEmp.id, newEmp);
    emit("ok", saved);
  } else {
    const saved = await employeeService.post<Employee>(newEmp);
    emit("ok", saved);
  }
};

const save = async () => {
  const newEmp = buildRequest();
  if (!newEmp) return;

  if (props.edit) {
    const saved = await employeeService.patch<Employee>(newEmp.id, newEmp);
    emit("ok", saved);
  } else {
    const saved = await employeeService.post<Employee>(newEmp);
    emit("ok", saved);
  }
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}

.department-relations {
  width: 100%;
  margin-top: var(--et-space-8);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  padding: var(--et-space-4) var(--et-space-8);
  box-sizing: border-box;
}

.department-relation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  gap: var(--et-space-12);
}

.department-relation-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
