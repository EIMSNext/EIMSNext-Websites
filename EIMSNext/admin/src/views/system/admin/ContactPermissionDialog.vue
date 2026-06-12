<template>
  <et-dialog
    :model-value="modelValue"
    title="通讯录管理"
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
        <div class="section-title">内部部门</div>
        <el-checkbox v-model="local.contactDepartmentEnabled">可见/可管理</el-checkbox>
        <div class="scope-row">
          <el-radio-group v-model="local.contactDepartmentScopeMode">
            <el-radio :label="ScopeMode.All">全部部门</el-radio>
            <el-radio :label="ScopeMode.Partial">部分部门</el-radio>
          </el-radio-group>
        </div>
        <selected-tags
          :model-value="deptTags"
          :editable="local.contactDepartmentEnabled && local.contactDepartmentScopeMode === ScopeMode.Partial"
          :empty-text="'选择部门'"
          class="scope-tags"
          @editTag="openDepartmentSelect"
        />
      </section>

      <section class="permission-section">
        <div class="section-title">内部角色</div>
        <div class="checkbox-row">
          <el-checkbox v-model="roleCanView">可见</el-checkbox>
          <el-checkbox v-model="roleCanManage">可管理</el-checkbox>
        </div>
        <div class="scope-row">
          <el-radio-group v-model="local.contactRoleScopeMode">
            <el-radio :label="ScopeMode.All">全部角色</el-radio>
            <el-radio :label="ScopeMode.Partial">部分角色</el-radio>
          </el-radio-group>
        </div>
        <selected-tags
          :model-value="roleTags"
          :editable="local.contactRolePermission !== PermissionLevel.None && local.contactRoleScopeMode === ScopeMode.Partial"
          :empty-text="'选择角色'"
          class="scope-tags"
          @editTag="openRoleSelect"
        />
      </section>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import { PermissionLevel, ScopeMode } from "@eimsnext/models";
import { DataItemType, ISelectedTag, MemberSelectDialog, MemberTabs, SelectedTags } from "@eimsnext/components";

defineOptions({
  name: "ContactPermissionDialog",
});

type ContactDraft = {
  contactDepartmentPermission: PermissionLevel;
  contactDepartmentScopeMode: ScopeMode;
  contactDepartmentIds: string[];
  contactRolePermission: PermissionLevel;
  contactRoleScopeMode: ScopeMode;
  contactRoleIds: string[];
  contactDepartmentEnabled: boolean;
};

const props = defineProps<{
  modelValue: boolean;
  value: ContactDraft;
  deptTags: ISelectedTag[];
  roleTags: ISelectedTag[];
}>();

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const local = ref<ContactDraft>({ ...props.value });
const showMemberDialog = ref(false);
const selectingType = ref<"dept" | "role">("dept");

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      local.value = {
        ...props.value,
        contactDepartmentIds: [...props.value.contactDepartmentIds],
        contactRoleIds: [...props.value.contactRoleIds],
      };
    }
  },
  { immediate: true },
);

watch(
  () => local.value.contactDepartmentEnabled,
  (enabled) => {
    local.value.contactDepartmentPermission = enabled ? PermissionLevel.Manage : PermissionLevel.None;
  },
);

const roleCanView = computed({
  get: () => local.value.contactRolePermission !== PermissionLevel.None,
  set: (checked: boolean) => {
    local.value.contactRolePermission = checked ? PermissionLevel.View : PermissionLevel.None;
  },
});

const roleCanManage = computed({
  get: () => local.value.contactRolePermission === PermissionLevel.Manage,
  set: (checked: boolean) => {
    local.value.contactRolePermission = checked ? PermissionLevel.Manage : PermissionLevel.View;
  },
});

const dialogMemberOptions = computed(() => ({
  showTabs: selectingType.value === "dept" ? MemberTabs.Department : MemberTabs.Role,
}));

const dialogTags = computed(() => (selectingType.value === "dept" ? props.deptTags : props.roleTags));

const openDepartmentSelect = () => {
  selectingType.value = "dept";
  showMemberDialog.value = true;
};

const openRoleSelect = () => {
  selectingType.value = "role";
  showMemberDialog.value = true;
};

const finishMemberSelect = (tags: ISelectedTag[]) => {
  if (selectingType.value === "dept") {
    local.value.contactDepartmentIds = tags.filter((tag) => tag.type === DataItemType.Department).map((tag) => tag.id);
  } else {
    local.value.contactRoleIds = tags.filter((tag) => tag.type === DataItemType.Role).map((tag) => tag.id);
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
    contactDepartmentPermission: local.value.contactDepartmentEnabled ? PermissionLevel.Manage : PermissionLevel.None,
  });
  emit("update:modelValue", false);
};
</script>

<style scoped lang="scss">
.contact-permission {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-26);
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
