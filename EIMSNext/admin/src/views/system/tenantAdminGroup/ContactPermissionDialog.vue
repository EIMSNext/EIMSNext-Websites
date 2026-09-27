<template>
  <et-dialog
    :model-value="modelValue"
    class="no-head-divider no-foot-divider"
    :title="t('admin.tenantAdminGroup.contactTitle')"
    width="850px"
    destroy-on-close
    @cancel="cancel"
    @ok="save"
  >
    <member-select-dialog
      v-model="showMemberDialog"
      :tags="dialogTags"
      :member-options="dialogMemberOptions"
      destroy-on-close
      @ok="finishMemberSelect"
    />

    <div class="contact-permission">
      <section class="permission-section">
        <div class="section-title">{{ t("admin.tenantAdminGroup.internalDept") }}</div>
        <div class="section-content">
          <el-checkbox v-model="local.contactDepartmentEnabled">
            {{ t("admin.tenantAdminGroup.visibleAndManage") }}
          </el-checkbox>
          <div class="scope-row">
            <el-radio-group v-model="local.contactDepartmentScopeMode">
              <el-radio :value="ScopeMode.All">{{ t("admin.tenantAdminGroup.allDepts") }}</el-radio>
              <el-radio :value="ScopeMode.Partial">
                {{ t("admin.tenantAdminGroup.partialDepts") }}
              </el-radio>
            </el-radio-group>
          </div>
          <selected-tags
            :model-value="deptTags"
            :editable="
              local.contactDepartmentEnabled &&
              local.contactDepartmentScopeMode === ScopeMode.Partial
            "
            :empty-text="t('admin.tenantAdminGroup.selectDept')"
            class="scope-tags"
            @editTag="openDepartmentSelect"
          />
        </div>
      </section>

      <section class="permission-section">
        <div class="section-title">{{ t("admin.tenantAdminGroup.internalEmployeeGroup") }}</div>
        <div class="section-content">
          <div class="checkbox-row">
            <el-checkbox v-model="employeeGroupCanView">{{ t("admin.tenantAdminGroup.visible") }}</el-checkbox>
            <el-checkbox v-model="employeeGroupCanManage">{{ t("admin.tenantAdminGroup.manage") }}</el-checkbox>
          </div>
          <div class="scope-row">
            <el-radio-group v-model="local.contactEmployeeGroupScopeMode">
              <el-radio :value="ScopeMode.All">{{ t("admin.tenantAdminGroup.allEmployeeGroups") }}</el-radio>
              <el-radio :value="ScopeMode.Partial">
                {{ t("admin.tenantAdminGroup.partialEmployeeGroups") }}
              </el-radio>
            </el-radio-group>
          </div>
          <selected-tags
            :model-value="employeeGroupTags"
            :editable="
              local.contactEmployeeGroupPermission !== PermissionLevel.None &&
              local.contactEmployeeGroupScopeMode === ScopeMode.Partial
            "
            :empty-text="t('admin.tenantAdminGroup.selectEmployeeGroup')"
            class="scope-tags"
            @editTag="openEmployeeGroupSelect"
          />
        </div>
      </section>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import { PermissionLevel, ScopeMode } from "@eimsnext/models";
import {
  DataItemType,
  ISelectedTag,
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
} from "@eimsnext/components";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "ContactPermissionDialog",
});

const { t } = useI18n();

type ContactDraft = {
  contactDepartmentPermission: PermissionLevel;
  contactDepartmentScopeMode: ScopeMode;
  contactDepartmentIds: string[];
  contactEmployeeGroupPermission: PermissionLevel;
  contactEmployeeGroupScopeMode: ScopeMode;
  contactEmployeeGroupIds: string[];
  contactDepartmentEnabled: boolean;
};

const props = defineProps<{
  modelValue: boolean;
  value: ContactDraft;
  deptTags: ISelectedTag[];
  employeeGroupTags: ISelectedTag[];
}>();

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const local = ref<ContactDraft>({ ...props.value });
const showMemberDialog = ref(false);
const selectingType = ref<"dept" | "employeeGroup">("dept");

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      local.value = {
        ...props.value,
        contactDepartmentIds: [...props.value.contactDepartmentIds],
        contactEmployeeGroupIds: [...props.value.contactEmployeeGroupIds],
      };
    }
  },
  { immediate: true }
);

watch(
  () => local.value.contactDepartmentEnabled,
  (enabled) => {
    local.value.contactDepartmentPermission = enabled
      ? PermissionLevel.Manage
      : PermissionLevel.None;
  }
);

const employeeGroupCanView = computed({
  get: () => local.value.contactEmployeeGroupPermission !== PermissionLevel.None,
  set: (checked: boolean) => {
    local.value.contactEmployeeGroupPermission = checked ? PermissionLevel.View : PermissionLevel.None;
  },
});

const employeeGroupCanManage = computed({
  get: () => local.value.contactEmployeeGroupPermission === PermissionLevel.Manage,
  set: (checked: boolean) => {
    local.value.contactEmployeeGroupPermission = checked ? PermissionLevel.Manage : PermissionLevel.View;
  },
});

const dialogMemberOptions = computed(() => ({
  showTabs: selectingType.value === "dept" ? MemberTabs.Department : MemberTabs.EmployeeGroup,
  adminScope: true,
}));

const dialogTags = computed(() =>
  selectingType.value === "dept" ? props.deptTags : props.employeeGroupTags
);

const openDepartmentSelect = () => {
  selectingType.value = "dept";
  showMemberDialog.value = true;
};

const openEmployeeGroupSelect = () => {
  selectingType.value = "employeeGroup";
  showMemberDialog.value = true;
};

const finishMemberSelect = (tags: ISelectedTag[]) => {
  if (selectingType.value === "dept") {
    local.value.contactDepartmentIds = tags
      .filter((tag) => tag.type === DataItemType.Department)
      .map((tag) => tag.id);
  } else {
    local.value.contactEmployeeGroupIds = tags
      .filter((tag) => tag.type === DataItemType.EmployeeGroup)
      .map((tag) => tag.id);
  }
  showMemberDialog.value = false;
};

const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const save = () => {
  emit("ok", {
    ...local.value,
    contactDepartmentPermission: local.value.contactDepartmentEnabled
      ? PermissionLevel.Manage
      : PermissionLevel.None,
  });
  emit("update:modelValue", false);
};
</script>

<style scoped lang="scss">
.contact-permission {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-26);
  margin: var(--et-space-20);
}

.permission-section {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.section-title {
  border-left: 4px solid var(--et-color-primary);
  font-size: var(--et-font-size-16);
  font-weight: 700;
  line-height: 20px;
  padding-left: var(--et-space-8);
}
.section-content {
  display: flex;
  flex-direction: column;
  margin-left: var(--et-space-20);
  gap: var(--et-space-8);
}
.checkbox-row,
.scope-row {
  display: flex;
  gap: var(--et-space-20);
}

.scope-tags {
  border: 1px dashed var(--el-border-color);
  box-sizing: border-box;
  min-height: 86px;
  padding: var(--et-space-10);
}
</style>

