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
        <selected-tags
          :model-value="deptTags"
          :editable="true"
          class="dept-tags-trigger"
          :empty-text="$t('department.departmentPlaceholder')"
          @edit-tag="showMemberDialog = true"
        />
        <member-select-dialog
          v-model="showMemberDialog"
          :tags="deptTags"
          :member-options="memberOptions"
          @ok="onDeptTagsChanged"
        />
        <div v-if="deptTags.length" class="department-relations">
          <div v-for="tag in deptTags" :key="tag.id" class="department-relation-row">
            <span class="department-relation-name">{{ tag.label }}</span>
            <el-checkbox v-model="departmentManagers[tag.id]">{{ $t("department.manager") }}</el-checkbox>
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
import { DataItemType, ISelectedTag, MemberSelectDialog, MemberTabs, SelectedTags } from "@eimsnext/components";
import { Department, Employee, EmployeeDepartmentRequest, EmployeeRequest, EmployeeStatus, PlatformType, ScopeMode } from "@eimsnext/models";
import { departmentService, employeeService } from "@eimsnext/services";
import { useContextStore } from "@eimsnext/store";
import { ElMessage } from "element-plus";

const { t } = useI18n();

defineOptions({
  name: "AddEditEmp",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    emp?: Employee;
    departmentScopeMode?: ScopeMode;
    departmentIds?: string[];
  }>(),
  {
    edit: false,
    departmentScopeMode: ScopeMode.All,
    departmentIds: () => [],
  }
);

const contextStore = useContextStore();
const showDialog = ref(true);
const title = computed(() => props.edit ? t("department.editEmployee") : t("department.addEmployee"));
const showSaveAndInvite = computed(() => contextStore.corpPlat === PlatformType.Public);
const deptTags = ref<ISelectedTag[]>([]);
const showMemberDialog = ref(false);
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
      departmentId: x.departmentId,
      isManager: false,
      sortValue: index,
    })) ?? [],
  };
}

const memberOptions = computed(() => ({
  showTabs: MemberTabs.Department,
  multiple: true,
  cascadedDept: false,
  ...(props.departmentScopeMode === ScopeMode.Partial && props.departmentIds.length > 0
    ? {
        limit: {
          depts: props.departmentIds.map((id) => ({
            id,
            value: id,
            label: "",
            type: DataItemType.Department,
            cascadedDept: false,
          })),
        },
      }
    : {}),
}));

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
  inviteId: [{ message: t("admin.department.messages.employeeGroupRequired"), trigger: "blur" }],
});

onBeforeMount(async () => {
  const initialIds = props.emp?.departments?.map((x) => x.departmentId) ?? [];
  if (initialIds.length === 0) return;

  const departments = await Promise.all(
    initialIds.map((id) =>
      departmentService.get<Department>(id, undefined, { silentError: true }).catch(() => undefined),
    ),
  );
  deptTags.value = initialIds.map((id, index) => ({
    id,
    value: id,
    label: departments[index]?.name ?? id,
    type: DataItemType.Department,
    cascadedDept: false,
  }));
});

const onDeptTagsChanged = (tags: ISelectedTag[]) => {
  deptTags.value = tags;
  showMemberDialog.value = false;
};

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};

watch(deptTags, (tags) => {
  tags.forEach((tag) => {
    if (departmentManagers[tag.id] === undefined) {
      departmentManagers[tag.id] = false;
    }
  });

  Object.keys(departmentManagers).forEach((departmentId) => {
    if (!tags.some((tag) => tag.id === departmentId)) {
      delete departmentManagers[departmentId];
    }
  });

  formData.value.departments = buildDepartments();
});

const buildDepartments = (): EmployeeDepartmentRequest[] => {
  return deptTags.value.map((tag, index) => ({
    departmentId: tag.id,
    isManager: !!departmentManagers[tag.id],
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

.dept-tags-trigger {
  width: 100%;
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
