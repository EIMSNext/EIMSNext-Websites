<template>
  <div class="admin-page">
    <TenantAdminGroupEditDialog
      v-model="showGroupDialog"
      :group="editingGroup"
      :type="editingType"
      @ok="saveGroupInfo"
    />
    <AppSelectDialog
      v-model="showAppDialog"
      :apps="apps"
      :selected-ids="draft.appIds"
      @ok="setSelectedApps"
    />
    <ContactPermissionDialog
      v-model="showContactDialog"
      :value="contactDraft"
      :dept-tags="contactDeptTags"
      :employee-group-tags="contactEmployeeGroupTags"
      @ok="setContactPermission"
    />
    <member-select-dialog
      v-model="showMemberDialog"
      :tags="memberDialogTags"
      :member-options="memberDialogOptions"
      destroy-on-close
      @ok="finishMemberSelect"
    />

    <aside class="admin-sidebar">
      <section class="sidebar-section">
        <div class="section-label">{{ t("admin.tenantAdminGroup.sysTenantAdminGroup") }}</div>
        <button
          class="tree-node system-node"
          :class="{ active: selectedKind === 'system' }"
          @click="selectSystemAdmins"
        >
          <et-icon icon="icon-admin" color="var(--et-color-primary)" />
          <span>{{ t("admin.tenantAdminGroup.sysAdmin") }}</span>
        </button>
      </section>

      <section class="sidebar-section normal-section">
        <div class="section-header">
          <span class="section-label">{{ t("admin.tenantAdminGroup.normalGroup") }}</span>
          <el-dropdown trigger="click">
            <el-button class="add-button" type="primary">
              <et-icon icon="el-plus" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openCreate(TenantAdminGroupType.Folder)">
                  {{ t("admin.tenantAdminGroup.group") }}
                </el-dropdown-item>
                <el-dropdown-item @click="openCreate(TenantAdminGroupType.Normal)">
                  {{ t("admin.tenantAdminGroup.tenantAdminGroup") }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-input
          v-model="keyword"
          class="group-search"
          clearable
          :placeholder="t('admin.tenantAdminGroup.selectGroup')"
        >
          <template #prefix>
            <et-icon icon="el-UserFilled" />
          </template>
        </el-input>
        <div class="group-tree">
          <Draggable
            :list="treeItems"
            item-key="id"
            :group="dragGroup"
            ghost-class="drag-ghost"
            :animation="180"
            :move="handleRootMove"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <div class="tree-drag-item">
                <div v-if="element.type === TenantAdminGroupType.Folder" class="folder-node">
                  <div
                    class="tree-node folder-title group-drop-target"
                    :class="{ active: selectedGroup?.id === element.id }"
                    @dragover.prevent
                    @drop.stop.prevent="dropToFolder(element)"
                    @click="selectGroup(element)"
                  >
                    <et-icon icon="el-folder" />
                    <span>{{ element.name }}</span>
                    <span class="node-actions">
                      <et-icon icon="el-edit" @click.stop="openEdit(element)" />
                      <et-icon icon="el-delete" @click.stop="deleteGroup(element)" />
                    </span>
                  </div>
                  <Draggable
                    v-model="element.children"
                    item-key="id"
                    :group="dragGroup"
                    ghost-class="drag-ghost"
                    :animation="180"
                    :move="handleChildMove"
                    @start="handleChildDragStart(element, $event)"
                    @end="handleDragEnd"
                  >
                    <template #item="{ element: child }">
                      <div class="tree-drag-item child">
                        <button
                          class="tree-node"
                          :class="{ active: selectedGroup?.id === child.id }"
                          @click="selectGroup(child)"
                        >
                          <et-icon icon="icon-admin" />
                          <span>{{ child.name }}</span>
                          <span class="drag-handle">
                            <et-icon icon="el-rank" />
                            <et-icon icon="el-more" />
                          </span>
                        </button>
                      </div>
                    </template>
                  </Draggable>
                </div>
                <button
                  v-else
                  class="tree-node"
                  :class="{ active: selectedGroup?.id === element.id }"
                  @click="selectGroup(element)"
                >
                  <et-icon icon="icon-admin" />
                  <span>{{ element.name }}</span>
                  <span class="drag-handle">
                    <et-icon icon="el-rank" />
                    <et-icon icon="el-more" />
                  </span>
                </button>
              </div>
            </template>
          </Draggable>
        </div>
      </section>
    </aside>

    <main class="admin-main">
      <template v-if="selectedKind === 'system'">
        <header class="content-header">
          <strong>{{ t("admin.tenantAdminGroup.sysAdmin") }}</strong>
          <span>{{ t("admin.tenantAdminGroup.sysAdminDesc") }}</span>
        </header>
        <section class="form-section">
          <div class="form-label">{{ t("admin.tenantAdminGroup.admin") }}</div>
          <selected-tags
            :model-value="systemAdminTags"
            :editable="true"
            :empty-text="t('admin.tenantAdminGroup.selectAdmin')"
            class="select-box"
            @editTag="openSystemEmployeeSelect"
          />
        </section>
        <div class="footer-actions">
          <el-button type="primary" :loading="saving" @click="saveSystemAdmins">
            {{ t("admin.tenantAdminGroup.save") }}
          </el-button>
        </div>
      </template>

      <template v-else-if="selectedGroup && selectedGroup.type === TenantAdminGroupType.Normal">
        <header class="content-header">
          <strong>{{ selectedGroup.name }}</strong>
        </header>
        <section class="form-section">
          <div class="form-label">{{ t("admin.tenantAdminGroup.admin") }}</div>
          <selected-tags
            :model-value="employeeTags"
            :editable="true"
            :empty-text="t('admin.tenantAdminGroup.selectAdmin')"
            class="select-box"
            @editTag="openEmployeeSelect"
          />
        </section>

        <section class="form-section">
          <div class="form-label">{{ t("admin.tenantAdminGroup.appManage") }}</div>
          <div class="config-content">
            <div class="config-item">
              <selected-tags
                :model-value="appTags"
                :editable="true"
                :empty-text="t('admin.tenantAdminGroup.selectApp')"
                class="select-box compact"
                @editTag="showAppDialog = true"
              />
              <el-checkbox v-model="draft.canCreateOrDeleteApp">
                {{ t("admin.tenantAdminGroup.canAddDeleteApp") }}
              </el-checkbox>
            </div>
            <div class="config-item">
              <div class="scope-row">
                <span class="scope-label">{{ t("admin.tenantAdminGroup.optionalDept") }}</span>
                <el-radio-group v-model="draft.appDepartmentScopeMode">
                  <el-radio :value="ScopeMode.All">{{ t("admin.tenantAdminGroup.allDepts") }}</el-radio>
                  <el-radio :value="ScopeMode.Partial">
                    {{ t("admin.tenantAdminGroup.partialDepts") }}
                  </el-radio>
                </el-radio-group>
              </div>
              <selected-tags
                :model-value="appDeptTags"
                :editable="draft.appDepartmentScopeMode === ScopeMode.Partial"
                :empty-text="t('admin.tenantAdminGroup.selectDept')"
                class="select-box"
                @editTag="openAppDeptSelect"
              />
            </div>
            <div class="config-item">
              <div class="scope-row">
                <span class="scope-label">{{ t("admin.tenantAdminGroup.optionalEmployeeGroup") }}</span>
                <el-radio-group v-model="draft.appEmployeeGroupScopeMode">
                  <el-radio :value="ScopeMode.All">{{ t("admin.tenantAdminGroup.allEmployeeGroups") }}</el-radio>
                  <el-radio :value="ScopeMode.Partial">
                    {{ t("admin.tenantAdminGroup.partialEmployeeGroups") }}
                  </el-radio>
                </el-radio-group>
              </div>
              <selected-tags
                :model-value="appEmployeeGroupTags"
                :editable="draft.appEmployeeGroupScopeMode === ScopeMode.Partial"
                :empty-text="t('admin.tenantAdminGroup.selectEmployeeGroup')"
                class="select-box"
                @editTag="openAppEmployeeGroupSelect"
              />
            </div>
          </div>
        </section>

        <section class="contact-section">
          <div class="form-label">{{ t("admin.tenantAdminGroup.contactTitle") }}</div>
          <div class="contact-desc">{{ t("admin.tenantAdminGroup.contactDesc") }}</div>
          <div class="contact-card">
            <div class="contact-card-header">
              <strong>{{ selectedGroup.name }}</strong>
              <span class="contact-actions">
                <et-icon icon="el-edit" @click="showContactDialog = true" />
                <et-icon
                  icon="el-delete"
                  color="var(--et-color-danger)"
                  @click="clearContactPermission"
                />
              </span>
            </div>
            <div class="contact-card-body">
              <div class="summary-row">
                <strong>{{ t("admin.tenantAdminGroup.internalDept") }}</strong>
                <span>{{ contactDepartmentSummary }}</span>
              </div>
              <selected-tags
                v-if="draft.contactDepartmentScopeMode === ScopeMode.Partial"
                :model-value="contactDeptTags"
              />
              <div class="summary-row">
                <strong>{{ t("admin.tenantAdminGroup.internalEmployeeGroup") }}</strong>
                <span>{{ contactEmployeeGroupSummary }}</span>
              </div>
              <selected-tags
                v-if="draft.contactEmployeeGroupScopeMode === ScopeMode.Partial"
                :model-value="contactEmployeeGroupTags"
              />
            </div>
          </div>
        </section>

        <div class="footer-actions">
          <el-button @click="openEdit(selectedGroup)">
            {{ t("admin.tenantAdminGroup.editName") }}
          </el-button>
          <el-button type="danger" plain @click="deleteGroup(selectedGroup)">
            {{ t("admin.tenantAdminGroup.delete") }}
          </el-button>
          <el-button type="primary" :loading="saving" @click="savePermissions">
            {{ t("admin.tenantAdminGroup.save") }}
          </el-button>
        </div>
      </template>

      <template v-else-if="selectedGroup?.type === TenantAdminGroupType.Folder">
        <header class="content-header">
          <strong>{{ selectedGroup.name }}</strong>
          <span>{{ t("admin.tenantAdminGroup.groupDesc") }}</span>
        </header>
      </template>
      <el-empty v-else :description="t('admin.tenantAdminGroup.pleaseSelectGroup')" />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSelectDialog from "./AppSelectDialog.vue";
import ContactPermissionDialog from "./ContactPermissionDialog.vue";
import TenantAdminGroupEditDialog from "./TenantAdminGroupEditDialog.vue";
import {
  TenantAdminGroup,
  TenantAccessSnapshot,
  TenantAdminGroupRequest,
  TenantAdminGroupType,
  AppDef,
  Department,
  Employee,
  PermissionLevel,
  EmployeeGroup,
  ScopeMode,
} from "@eimsnext/models";
import {
  tenantAdminGroupService,
  appDefService,
  departmentService,
  employeeService,
  employeeGroupService,
  systemService,
} from "@eimsnext/services";
import {
  DataItemType,
  ISelectedTag,
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
} from "@eimsnext/components";
import Draggable from "vuedraggable";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "AdminManager",
  inheritAttrs: false,
});

const { t } = useI18n();

type AdminTreeItem = TenantAdminGroup & { children: AdminTreeItem[] };
type MemberDialogTarget = "systemEmployees" | "employees" | "appDepartments" | "appEmployeeGroups";
type AdminPermissionDraft = Pick<
  TenantAdminGroup,
  | "employeeIds"
  | "appIds"
  | "canCreateOrDeleteApp"
  | "appDepartmentScopeMode"
  | "appDepartmentIds"
  | "appEmployeeGroupScopeMode"
  | "appEmployeeGroupIds"
  | "contactDepartmentPermission"
  | "contactDepartmentScopeMode"
  | "contactDepartmentIds"
  | "contactEmployeeGroupPermission"
  | "contactEmployeeGroupScopeMode"
  | "contactEmployeeGroupIds"
>;

const loading = ref(false);
const saving = ref(false);
const adminPermissions = ref<TenantAccessSnapshot>();
const keyword = ref("");
const groups = ref<TenantAdminGroup[]>([]);
const treeItems = ref<AdminTreeItem[]>([]);
const employees = ref<Employee[]>([]);
const departments = ref<Department[]>([]);
const employeeGroups = ref<EmployeeGroup[]>([]);
const apps = ref<AppDef[]>([]);
const selectedKind = ref<"system" | "normal">("system");
const selectedGroupId = ref("");
const systemGroup = ref<TenantAdminGroup>();
const systemEmployeeIds = ref<string[]>([]);
const showGroupDialog = ref(false);
const editingGroup = ref<TenantAdminGroup>();
const editingType = ref<TenantAdminGroupType>(TenantAdminGroupType.Normal);
const showAppDialog = ref(false);
const showContactDialog = ref(false);
const showMemberDialog = ref(false);
const memberDialogTarget = ref<MemberDialogTarget>("employees");
const draggingGroup = ref<AdminTreeItem>();
const dragGroup = { name: "admin-group", pull: true, put: true };

const emptyDraft = (): AdminPermissionDraft => ({
  employeeIds: [],
  appIds: [],
  canCreateOrDeleteApp: false,
  appDepartmentScopeMode: ScopeMode.All,
  appDepartmentIds: [],
  appEmployeeGroupScopeMode: ScopeMode.All,
  appEmployeeGroupIds: [],
  contactDepartmentPermission: PermissionLevel.None,
  contactDepartmentScopeMode: ScopeMode.All,
  contactDepartmentIds: [],
  contactEmployeeGroupPermission: PermissionLevel.None,
  contactEmployeeGroupScopeMode: ScopeMode.All,
  contactEmployeeGroupIds: [],
});

const draft = ref<AdminPermissionDraft>(emptyDraft());

const normalizeGroup = (group: TenantAdminGroup): TenantAdminGroup => ({
  ...group,
  type: String(group.type ?? TenantAdminGroupType.Normal) as TenantAdminGroupType,
  parentId: group.parentId || "",
  sortValue: group.sortValue || 0,
  employeeIds: group.employeeIds || [],
  appIds: group.appIds || [],
  canCreateOrDeleteApp: !!group.canCreateOrDeleteApp,
  appDepartmentScopeMode: String(group.appDepartmentScopeMode ?? ScopeMode.All) as ScopeMode,
  appDepartmentIds: group.appDepartmentIds || [],
  appEmployeeGroupScopeMode: String(group.appEmployeeGroupScopeMode ?? ScopeMode.All) as ScopeMode,
  appEmployeeGroupIds: group.appEmployeeGroupIds || [],
  contactDepartmentPermission: String(
    group.contactDepartmentPermission ?? PermissionLevel.None
  ) as PermissionLevel,
  contactDepartmentScopeMode: String(
    group.contactDepartmentScopeMode ?? ScopeMode.All
  ) as ScopeMode,
  contactDepartmentIds: group.contactDepartmentIds || [],
  contactEmployeeGroupPermission: String(
    group.contactEmployeeGroupPermission ?? PermissionLevel.None
  ) as PermissionLevel,
  contactEmployeeGroupScopeMode: String(group.contactEmployeeGroupScopeMode ?? ScopeMode.All) as ScopeMode,
  contactEmployeeGroupIds: group.contactEmployeeGroupIds || [],
});

const selectedGroup = computed(() =>
  groups.value.find((group) => group.id === selectedGroupId.value)
);

const filteredGroups = computed(() => {
  const kw = keyword.value.trim();
  const normalGroups = groups.value.filter((group) => group.type !== TenantAdminGroupType.System);
  if (!kw) return normalGroups;
  const folderIds = new Set(
    normalGroups
      .filter((group) => group.name.includes(kw))
      .map((group) => group.parentId)
      .filter(Boolean)
  );
  return normalGroups.filter((group) => group.name.includes(kw) || folderIds.has(group.id));
});

const buildTree = (source: TenantAdminGroup[]): AdminTreeItem[] => {
  const folders = source
    .filter((group) => group.type === TenantAdminGroupType.Folder)
    .sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0))
    .map((group) => ({ ...group, children: [] as AdminTreeItem[] }));
  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
  const roots: AdminTreeItem[] = [...folders];

  source
    .filter((group) => group.type === TenantAdminGroupType.Normal)
    .sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0))
    .forEach((group) => {
      const node = { ...group, children: [] as AdminTreeItem[] };
      const parent = folderMap.get(group.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    });

  return roots.sort((a, b) => (a.sortValue || 0) - (b.sortValue || 0));
};

const refreshTree = () => {
  treeItems.value = buildTree(filteredGroups.value);
};

const idMap = <T extends { id: string }>(items: T[]) =>
  new Map(items.map((item) => [item.id, item]));

const employeeTags = computed(() => idsToEmployeeTags(draft.value.employeeIds));
const systemAdminTags = computed(() => idsToEmployeeTags(systemEmployeeIds.value));
const appDeptTags = computed(() => idsToDeptTags(draft.value.appDepartmentIds));
const appEmployeeGroupTags = computed(() => idsToEmployeeGroupTags(draft.value.appEmployeeGroupIds));
const contactDeptTags = computed(() => idsToDeptTags(draft.value.contactDepartmentIds));
const contactEmployeeGroupTags = computed(() => idsToEmployeeGroupTags(draft.value.contactEmployeeGroupIds));
const appTags = computed<ISelectedTag[]>(() => {
  const map = idMap(apps.value);
  return draft.value.appIds.map((id) => {
    const app = map.get(id);
    return {
      id,
      label: app?.name || id,
      type: DataItemType.App,
      icon: app?.icon || "icon-appdefault",
      data: app,
    };
  });
});

const idsToEmployeeTags = (ids: string[]): ISelectedTag[] => {
  const map = idMap(employees.value);
  return ids.map((id) => {
    const emp = map.get(id);
    return {
      id,
      value: emp?.code,
      label: emp?.empName || id,
      type: DataItemType.Employee,
      data: emp,
    };
  });
};

const idsToDeptTags = (ids: string[]): ISelectedTag[] => {
  const map = idMap(departments.value);
  return ids.map((id) => {
    const dept = map.get(id);
    return {
      id,
      value: dept?.code,
      label: dept ? `${dept.code}-${dept.name}` : id,
      type: DataItemType.Department,
      data: dept,
    };
  });
};

const idsToEmployeeGroupTags = (ids: string[]): ISelectedTag[] => {
  const map = idMap(employeeGroups.value);
  return ids.map((id) => {
    const employeeGroup = map.get(id);
    return {
      id,
      label: employeeGroup?.name || id,
      type: DataItemType.EmployeeGroup,
      data: employeeGroup,
    };
  });
};

const memberDialogOptions = computed(() => {
  const adminScope = adminPermissions.value?.isNormalAdmin ?? true;
  if (memberDialogTarget.value === "appDepartments")
    return { showTabs: MemberTabs.Department, adminScope };
  if (memberDialogTarget.value === "appEmployeeGroups") return { showTabs: MemberTabs.EmployeeGroup, adminScope };
  return { showTabs: MemberTabs.Employee, adminScope };
});

const memberDialogTags = computed(() => {
  switch (memberDialogTarget.value) {
    case "systemEmployees":
      return systemAdminTags.value;
    case "appDepartments":
      return appDeptTags.value;
    case "appEmployeeGroups":
      return appEmployeeGroupTags.value;
    default:
      return employeeTags.value;
  }
});

const contactDraft = computed(() => ({
  contactDepartmentPermission: draft.value.contactDepartmentPermission,
  contactDepartmentScopeMode: draft.value.contactDepartmentScopeMode,
  contactDepartmentIds: draft.value.contactDepartmentIds,
  contactEmployeeGroupPermission: draft.value.contactEmployeeGroupPermission,
  contactEmployeeGroupScopeMode: draft.value.contactEmployeeGroupScopeMode,
  contactEmployeeGroupIds: draft.value.contactEmployeeGroupIds,
  contactDepartmentEnabled: draft.value.contactDepartmentPermission === PermissionLevel.Manage,
}));

const contactDepartmentSummary = computed(() => {
  if (draft.value.contactDepartmentPermission === PermissionLevel.None)
    return t("admin.tenantAdminGroup.notConfigured");
  return draft.value.contactDepartmentScopeMode === ScopeMode.All
    ? t("admin.tenantAdminGroup.viewManageAllDept")
    : t("admin.tenantAdminGroup.viewManagePartialDept");
});

const contactEmployeeGroupSummary = computed(() => {
  if (draft.value.contactEmployeeGroupPermission === PermissionLevel.None)
    return t("admin.tenantAdminGroup.notConfigured");
  const level =
    draft.value.contactEmployeeGroupPermission === PermissionLevel.Manage
      ? t("admin.tenantAdminGroup.viewManage")
      : t("admin.tenantAdminGroup.visible");
  const scope =
    draft.value.contactEmployeeGroupScopeMode === ScopeMode.All
      ? t("admin.tenantAdminGroup.allEmployeeGroups")
      : t("admin.tenantAdminGroup.partialEmployeeGroups");
  return `${level}-${scope}`;
});

const loadData = async () => {
  loading.value = true;
  try {
    const [tenantAdminGroups, empList, deptList, employeeGroupList, appList, permissions] = await Promise.all([
      tenantAdminGroupService.query<TenantAdminGroup>(),
      employeeService.query<Employee>("$filter=status eq 0&adminScope=true"),
      departmentService.query<Department>("adminScope=true"),
      employeeGroupService.query<EmployeeGroup>("adminScope=true"),
      appDefService.query<AppDef>(),
      systemService.getAdminPermissions(),
    ]);

    adminPermissions.value = permissions;
    groups.value = tenantAdminGroups.map(normalizeGroup);
    refreshTree();
    systemGroup.value = groups.value.find((group) => group.type === TenantAdminGroupType.System);
    systemEmployeeIds.value = systemGroup.value?.employeeIds
      ? [...systemGroup.value.employeeIds]
      : [];
    employees.value = empList;
    departments.value = deptList;
    employeeGroups.value = employeeGroupList;
    apps.value = appList;

    if (selectedKind.value === "normal" && !selectedGroup.value) {
      selectedGroupId.value =
        groups.value.find((group) => group.type === TenantAdminGroupType.Normal)?.id || "";
    }
  } finally {
    loading.value = false;
  }
};

const syncDraft = (group?: TenantAdminGroup) => {
  if (!group || group.type !== TenantAdminGroupType.Normal) {
    draft.value = emptyDraft();
    return;
  }

  draft.value = {
    employeeIds: [...group.employeeIds],
    appIds: [...group.appIds],
    canCreateOrDeleteApp: group.canCreateOrDeleteApp,
    appDepartmentScopeMode: group.appDepartmentScopeMode,
    appDepartmentIds: [...group.appDepartmentIds],
    appEmployeeGroupScopeMode: group.appEmployeeGroupScopeMode,
    appEmployeeGroupIds: [...group.appEmployeeGroupIds],
    contactDepartmentPermission: group.contactDepartmentPermission,
    contactDepartmentScopeMode: group.contactDepartmentScopeMode,
    contactDepartmentIds: [...group.contactDepartmentIds],
    contactEmployeeGroupPermission: group.contactEmployeeGroupPermission,
    contactEmployeeGroupScopeMode: group.contactEmployeeGroupScopeMode,
    contactEmployeeGroupIds: [...group.contactEmployeeGroupIds],
  };
};

const selectSystemAdmins = () => {
  selectedKind.value = "system";
  selectedGroupId.value = "";
};

const selectGroup = (group: TenantAdminGroup) => {
  selectedKind.value = "normal";
  selectedGroupId.value = group.id;
  syncDraft(group);
};

const openCreate = (type: TenantAdminGroupType) => {
  editingGroup.value = undefined;
  editingType.value = type;
  showGroupDialog.value = true;
};

const openEdit = (group: TenantAdminGroup) => {
  editingGroup.value = group;
  editingType.value = group.type;
  showGroupDialog.value = true;
};

const saveGroupInfo = async (form: { name: string; description: string }) => {
  if (editingGroup.value) {
    const updated = await tenantAdminGroupService.patch<TenantAdminGroup>(editingGroup.value.id, {
      id: editingGroup.value.id,
      name: form.name,
      description: form.description,
    });
    const index = groups.value.findIndex((group) => group.id === updated.id);
    if (index > -1) groups.value[index] = normalizeGroup(updated);
    refreshTree();
    if (selectedGroupId.value === updated.id) syncDraft(groups.value[index]);
    return;
  }

  const created = await tenantAdminGroupService.post<TenantAdminGroup>({
    id: "",
    name: form.name,
    description: form.description,
    type: editingType.value,
    parentId: "",
    sortValue: groups.value.length * 100,
  });
  groups.value.push(normalizeGroup(created));
  refreshTree();
  if (created.type === TenantAdminGroupType.Normal) selectGroup(normalizeGroup(created));
};

const deleteGroup = async (group: TenantAdminGroup) => {
  if (
    group.type === TenantAdminGroupType.Folder &&
    groups.value.some((item) => item.parentId === group.id)
  ) {
    ElMessage.warning(t("admin.tenantAdminGroup.cannotDeleteWithSubgroups"));
    return;
  }

  await tenantAdminGroupService.delete(group.id);
  groups.value = groups.value.filter((item) => item.id !== group.id);
  refreshTree();
  if (selectedGroupId.value === group.id) {
    selectedGroupId.value = "";
    draft.value = emptyDraft();
  }
  await loadData();
};

const openSystemEmployeeSelect = () => {
  memberDialogTarget.value = "systemEmployees";
  showMemberDialog.value = true;
};

const openEmployeeSelect = () => {
  memberDialogTarget.value = "employees";
  showMemberDialog.value = true;
};

const openAppDeptSelect = () => {
  memberDialogTarget.value = "appDepartments";
  showMemberDialog.value = true;
};

const openAppEmployeeGroupSelect = () => {
  memberDialogTarget.value = "appEmployeeGroups";
  showMemberDialog.value = true;
};

const finishMemberSelect = (tags: ISelectedTag[]) => {
  switch (memberDialogTarget.value) {
    case "systemEmployees":
      systemEmployeeIds.value = tags
        .filter((tag) => tag.type === DataItemType.Employee)
        .map((tag) => tag.id);
      break;
    case "appDepartments":
      draft.value.appDepartmentIds = tags
        .filter((tag) => tag.type === DataItemType.Department)
        .map((tag) => tag.id);
      break;
    case "appEmployeeGroups":
      draft.value.appEmployeeGroupIds = tags
        .filter((tag) => tag.type === DataItemType.EmployeeGroup)
        .map((tag) => tag.id);
      break;
    default:
      draft.value.employeeIds = tags
        .filter((tag) => tag.type === DataItemType.Employee)
        .map((tag) => tag.id);
      break;
  }
  showMemberDialog.value = false;
};

const setSelectedApps = (ids: string[]) => {
  draft.value.appIds = ids;
};

const setContactPermission = (value: Partial<AdminPermissionDraft>) => {
  draft.value.contactDepartmentPermission =
    value.contactDepartmentPermission || PermissionLevel.None;
  draft.value.contactDepartmentScopeMode = value.contactDepartmentScopeMode || ScopeMode.All;
  draft.value.contactDepartmentIds = [...(value.contactDepartmentIds || [])];
  draft.value.contactEmployeeGroupPermission = value.contactEmployeeGroupPermission || PermissionLevel.None;
  draft.value.contactEmployeeGroupScopeMode = value.contactEmployeeGroupScopeMode || ScopeMode.All;
  draft.value.contactEmployeeGroupIds = [...(value.contactEmployeeGroupIds || [])];
};

const clearContactPermission = () => {
  draft.value.contactDepartmentPermission = PermissionLevel.None;
  draft.value.contactDepartmentScopeMode = ScopeMode.All;
  draft.value.contactDepartmentIds = [];
  draft.value.contactEmployeeGroupPermission = PermissionLevel.None;
  draft.value.contactEmployeeGroupScopeMode = ScopeMode.All;
  draft.value.contactEmployeeGroupIds = [];
};

const saveSystemAdmins = async () => {
  if (!systemGroup.value?.id) {
    ElMessage.warning(t("admin.tenantAdminGroup.missingSysTenantAdminGroup"));
    return;
  }

  if (systemEmployeeIds.value.length > 5) {
    ElMessage.warning(t("admin.tenantAdminGroup.max5SysAdmins"));
    return;
  }

  saving.value = true;
  try {
    const group = await tenantAdminGroupService.patch<TenantAdminGroup>(systemGroup.value.id, {
      id: systemGroup.value.id,
      employeeIds: systemEmployeeIds.value,
    });
    systemGroup.value = normalizeGroup(group);
    const index = groups.value.findIndex((item) => item.id === group.id);
    if (index > -1) groups.value[index] = normalizeGroup(group);
    else groups.value.push(normalizeGroup(group));
    ElMessage.success(t("admin.tenantAdminGroup.saveSuccess"));
  } finally {
    saving.value = false;
  }
};

const savePermissions = async () => {
  if (!selectedGroup.value || selectedGroup.value.type !== TenantAdminGroupType.Normal) return;

  saving.value = true;
  try {
    const payload: TenantAdminGroupRequest = {
      id: selectedGroup.value.id,
      employeeIds: draft.value.employeeIds,
      appIds: draft.value.appIds,
      canCreateOrDeleteApp: draft.value.canCreateOrDeleteApp,
      appDepartmentScopeMode: draft.value.appDepartmentScopeMode,
      appDepartmentIds: draft.value.appDepartmentIds,
      appEmployeeGroupScopeMode: draft.value.appEmployeeGroupScopeMode,
      appEmployeeGroupIds: draft.value.appEmployeeGroupIds,
      contactDepartmentPermission: draft.value.contactDepartmentPermission,
      contactDepartmentScopeMode: draft.value.contactDepartmentScopeMode,
      contactDepartmentIds: draft.value.contactDepartmentIds,
      contactEmployeeGroupPermission: draft.value.contactEmployeeGroupPermission,
      contactEmployeeGroupScopeMode: draft.value.contactEmployeeGroupScopeMode,
      contactEmployeeGroupIds: draft.value.contactEmployeeGroupIds,
    };
    const updated = await tenantAdminGroupService.patch<TenantAdminGroup>(selectedGroup.value.id, payload);
    const index = groups.value.findIndex((group) => group.id === updated.id);
    if (index > -1) groups.value[index] = normalizeGroup(updated);
    syncDraft(normalizeGroup(updated));
    ElMessage.success(t("admin.tenantAdminGroup.saveSuccess"));
  } finally {
    saving.value = false;
  }
};

const handleDragStart = (event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;
  draggingGroup.value = treeItems.value[event.oldIndex];
};

const handleChildDragStart = (folder: AdminTreeItem, event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;
  draggingGroup.value = folder.children[event.oldIndex];
};

const clearDragging = () => {
  draggingGroup.value = undefined;
};

const getDragResult = (source: AdminTreeItem) => {
  const rootIndex = treeItems.value.findIndex((item) => item.id === source.id);
  if (rootIndex > -1) {
    return { parentId: "", siblings: treeItems.value };
  }

  for (const folder of treeItems.value) {
    if (folder.type !== TenantAdminGroupType.Folder) continue;
    const childIndex = folder.children.findIndex((item) => item.id === source.id);
    if (childIndex > -1) return { parentId: folder.id, siblings: folder.children };
  }

  return undefined;
};

const moveGroup = async (source: AdminTreeItem, parentId: string, siblings: AdminTreeItem[]) => {
  const index = siblings.findIndex((item) => item.id === source.id);
  if (index < 0) return;

  await tenantAdminGroupService.move({
    id: source.id,
    parentId,
    previousId: siblings[index - 1]?.id || "",
    nextId: siblings[index + 1]?.id || "",
  });
  await loadData();
};

const handleDragEnd = async () => {
  const source = draggingGroup.value;
  clearDragging();
  if (!source) return;

  if (keyword.value.trim()) {
    refreshTree();
    return;
  }

  const result = getDragResult(source);
  if (!result) {
    refreshTree();
    return;
  }

  await moveGroup(source, result.parentId, result.siblings);
};

const handleRootMove = (event: {
  relatedContext?: { element?: AdminTreeItem };
  originalEvent?: { target?: EventTarget | null };
}) => {
  if (keyword.value.trim()) return false;
  const target = event.relatedContext?.element;
  const source = draggingGroup.value;
  if (!source || !target) return true;
  const onFolderTitle =
    event.originalEvent?.target instanceof HTMLElement &&
    !!event.originalEvent.target.closest(".group-drop-target");
  return !(
    onFolderTitle &&
    target.type === TenantAdminGroupType.Folder &&
    source.type === TenantAdminGroupType.Normal
  );
};

const handleChildMove = () =>
  !keyword.value.trim() && draggingGroup.value?.type === TenantAdminGroupType.Normal;

const dropToFolder = async (folder: AdminTreeItem) => {
  if (keyword.value.trim()) {
    ElMessage.warning(t("admin.tenantAdminGroup.clearSearchBeforeSort"));
    return;
  }

  const source = draggingGroup.value;
  if (!source || source.type !== TenantAdminGroupType.Normal || source.id === folder.id) return;
  clearDragging();
  await tenantAdminGroupService.move({
    id: source.id,
    parentId: folder.id,
    previousId: folder.children.at(-1)?.id || "",
    nextId: "",
  });
  await loadData();
};

watch(selectedGroup, (group) => {
  if (selectedKind.value === "normal") syncDraft(group);
});

watch(keyword, () => {
  refreshTree();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.admin-page {
  background: var(--et-bg-container);
  display: grid;
  grid-template-columns: 260px minmax(720px, 1fr);
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  border-right: 1px solid var(--el-border-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--et-space-18);
  overflow: hidden;
  padding: var(--et-space-18) var(--et-space-20);
}

.section-label {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-14);
  line-height: 32px;
}

.section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.add-button {
  height: 26px;
  padding: 0;
  width: 26px;
}

.group-search {
  margin-bottom: var(--et-space-10);
}

.normal-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.group-tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.tree-node {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--et-radius-4);
  color: var(--et-text-primary);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-6);
  height: 40px;
  padding: 0 var(--et-space-12);
  text-align: left;
  width: 100%;

  et-icon {
    color: var(--et-color-success);
  }

  span:nth-child(2) {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.active {
    background: var(--et-bg-primary-light);
    color: var(--et-color-primary);
  }

  &:hover {
    background: var(--el-fill-color-light);

    .node-actions,
    .drag-handle {
      visibility: visible;
    }
  }
}

.system-node {
  background: var(--et-bg-primary-light);
}

.child {
  padding-left: var(--et-space-14);
}

.node-actions,
.drag-handle {
  align-items: center;
  display: flex;
  gap: var(--et-space-6);
  visibility: hidden;
}

.drag-ghost {
  opacity: 0.6;
}

.admin-main {
  overflow: auto;
  padding-bottom: var(--et-space-40);
}

.content-header {
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  gap: var(--et-space-12);
  height: 48px;
  padding: 0 var(--et-space-22);

  strong {
    color: var(--et-text-primary);
  }

  span {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-13);
  }
}

.form-section,
.contact-section {
  display: grid;
  gap: var(--et-space-14);
  grid-template-columns: 160px minmax(0, 1fr);
  padding: var(--et-space-18) var(--et-space-22) 0;
}

.form-label {
  font-weight: 700;
  line-height: 34px;
  color: var(--et-text-primary);
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-20);

  .config-item {
    display: flex;
    flex-direction: column;
    gap: var(--et-space-10);
  }
}
.scope-row {
  align-items: center;
  display: flex;
  gap: var(--et-space-20);
  min-height: 34px;
}

.scope-label {
  font-weight: 700;
  min-width: 96px;
  color: var(--et-text-primary);
}

.select-box {
  border: 1px dashed var(--el-border-color);
  box-sizing: border-box;
  grid-column: 2;
  min-height: 52px;
  padding: var(--et-space-10);

  &.compact {
    min-height: 44px;
  }
}

.contact-desc {
  color: var(--et-text-tertiary);
  grid-column: 2;
}

.contact-card {
  border: 1px solid var(--el-border-color);
  border-radius: var(--et-radius-6);
  grid-column: 2;
  overflow: hidden;
}

.contact-card-header {
  align-items: center;
  background: var(--el-fill-color-light);
  color: var(--et-text-primary);
  display: flex;
  height: 48px;
  justify-content: space-between;
  padding: 0 var(--et-space-16);
}

.contact-actions {
  align-items: center;
  color: var(--et-color-primary);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-14);
}

.contact-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
  padding: var(--et-space-18);
}

.summary-row {
  color: var(--et-text-primary);
  display: grid;
  gap: var(--et-space-20);
  grid-template-columns: 110px 1fr;
}

.footer-actions {
  display: flex;
  gap: var(--et-space-10);
  justify-content: flex-end;
  padding: var(--et-space-28) var(--et-space-22);
}
</style>

