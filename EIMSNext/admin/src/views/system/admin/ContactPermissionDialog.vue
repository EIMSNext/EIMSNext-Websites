<template>
  <et-dialog
    :model-value="modelValue"
    class="no-head-divider no-foot-divider"
    :title="t('admin.adminGroup.contactTitle')"
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
        <div class="section-title">{{ t("admin.adminGroup.internalDept") }}</div>
        <div class="section-content">
          <el-checkbox v-model="local.contactDepartmentEnabled">
            {{ t("admin.adminGroup.visibleAndManage") }}
          </el-checkbox>
          <div class="scope-row">
            <el-radio-group v-model="local.contactDepartmentScopeMode">
              <el-radio :label="ScopeMode.All">{{ t("admin.adminGroup.allDepts") }}</el-radio>
              <el-radio :label="ScopeMode.Partial">
                {{ t("admin.adminGroup.partialDepts") }}
              </el-radio>
            </el-radio-group>
          </div>
          <selected-tags
            :model-value="deptTags"
            :editable="
              local.contactDepartmentEnabled &&
              local.contactDepartmentScopeMode === ScopeMode.Partial
            "
            :empty-text="t('admin.adminGroup.selectDept')"
            class="scope-tags"
            @editTag="openDepartmentSelect"
          />
        </div>
      </section>

      <section class="permission-section">
        <div class="section-title">{{ t("admin.adminGroup.internalRole") }}</div>
        <div class="section-content">
          <div class="checkbox-row">
            <el-checkbox v-model="roleCanView">{{ t("admin.adminGroup.visible") }}</el-checkbox>
            <el-checkbox v-model="roleCanManage">{{ t("admin.adminGroup.manage") }}</el-checkbox>
          </div>
          <div class="scope-row">
            <el-radio-group v-model="local.contactRoleScopeMode">
              <el-radio :label="ScopeMode.All">{{ t("admin.adminGroup.allRoles") }}</el-radio>
              <el-radio :label="ScopeMode.Partial">
                {{ t("admin.adminGroup.partialRoles") }}
              </el-radio>
            </el-radio-group>
          </div>
          <selected-tags
            :model-value="roleTags"
            :editable="
              local.contactRolePermission !== PermissionLevel.None &&
              local.contactRoleScopeMode === ScopeMode.Partial
            "
            :empty-text="t('admin.adminGroup.selectRole')"
            class="scope-tags"
            @editTag="openRoleSelect"
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
  adminScope: true,
}));

const dialogTags = computed(() =>
  selectingType.value === "dept" ? props.deptTags : props.roleTags
);

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
    local.value.contactDepartmentIds = tags
      .filter((tag) => tag.type === DataItemType.Department)
      .map((tag) => tag.id);
  } else {
    local.value.contactRoleIds = tags
      .filter((tag) => tag.type === DataItemType.Role)
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
