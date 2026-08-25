<template>
  <div class="app-sidebar">
    <form-edit
      v-if="showFormEditor && newForm"
      v-model="showFormEditor"
      :form-def="newForm!"
      :usingFlow="usingWorkflow"
      :initial-tab="formEditInitialTab"
      :initial-advanced-tab="formEditInitialAdvancedTab"
      @close="console.log('[Sidebar] FormEdit closed'); showFormEditor = false"
    />
    <DashboardDesigner v-if="showDshEditor && newDash" v-model="showDshEditor" :dash-def="newDash!"></DashboardDesigner>
    <EditFormIcon
      v-if="showMenuEditor && editingMenu"
      :app-id="contextStore.appId"
      :menu="editingMenu"
      @cancel="showMenuEditor = false"
      @ok="handleAppUpdated"
    />
    <EditMenuGroup
      v-if="showGroupEditor"
      :app-id="contextStore.appId"
      :menu="editingGroup"
      @cancel="closeGroupDialog"
      @ok="handleAppUpdated"
    />
    <div class="app-title" :style="{ paddingRight: isSidebarOpened ? 'var(--et-size-40)' : 'var(--et-space-6)' }">
      <AppIcon v-if="app" :app="app" iconSize="12px" style="width: 20px;height: 20px;" />
      <span
        v-if="isSidebarOpened"
        class="app-title-text ml-[3px]"
        :title="app?.name || ''"
        role="button"
        tabindex="0"
        @click.stop="toggleAppFavorite"
        @keydown.enter.prevent="toggleAppFavorite"
        @keydown.space.prevent="toggleAppFavorite"
      >
        {{ app?.name }}
      </span>
      <button
        v-if="isSidebarOpened && app"
        type="button"
        class="app-favorite-button"
        :class="{ active: isAppFavorite }"
        :title="t(isAppFavorite ? 'admin.workbench.removeFavorite' : 'admin.workbench.addFavorite')"
        :aria-label="t(isAppFavorite ? 'admin.workbench.removeFavorite' : 'admin.workbench.addFavorite')"
        @click.stop="toggleAppFavorite"
      >
        <et-icon icon="el-star" size="16px" />
      </button>
      <el-button class="side-bar-control" @click.stop="toggleSideBar">
        <et-icon v-if="isSidebarOpened" icon="el-DArrowLeft" size="14px"></et-icon>
        <et-icon v-else icon="el-DArrowRight" size="14px"></et-icon>
      </el-button>
    </div>
    <div>
      <el-menu mode="vertical" class="app-workflow-menu" :default-active="workflowActiveIndex">
<router-link custom :to="{ name: 'mytasks', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="mytask" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <el-badge :is-dot="hasAppTask" :offset="[0, 12]">
              <et-icon icon="icon-mytodo" class="step-image" size="18px" />
            </el-badge>
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.mytasks") }}
            </span>
          </el-menu-item>
        </router-link>
<router-link custom :to="{ name: 'mystarted', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="mystarted" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <et-icon icon="icon-mystarted" class="step-image" size="18px" />
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.mystarted") }}
            </span>
          </el-menu-item>
        </router-link>
<router-link custom :to="{ name: 'myapproved', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="myapproved" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <et-icon icon="icon-myapproved" class="step-image" size="18px" />
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.myapproved") }}
            </span>
          </el-menu-item>
        </router-link>
<router-link custom :to="{ name: 'cctome', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="mycced" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <et-icon icon="icon-mycced" class="step-image" size="18px" />
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.cctome") }}
            </span>
          </el-menu-item>
        </router-link>
      </el-menu>
    </div>
    <div v-if="isSidebarOpened" class="form-action">
      <el-input v-model="menuFilterText" clearable :placeholder="t('common.search')">
        <template #prefix>
          <et-icon icon="el-search" size="14px"></et-icon>
        </template>
      </el-input>

      <template v-if="canManageCurrentApp">
        <el-dropdown placement="bottom-start" size="large">
          <el-button class="create-button">
            <et-icon icon="el-plus"></et-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="sidebar-dropdown-menu">
              <el-dropdown-item @click="createForm(false)">
                {{ t("admin.newForm") }}
              </el-dropdown-item>
              <el-dropdown-item @click="createForm(true)">
                {{ t("admin.newFlowForm") }}
              </el-dropdown-item>
              <el-divider class="sidebar-divider" />
              <el-dropdown-item @click="createDashboard">
                {{ t("admin.newDashboard") }}
              </el-dropdown-item>
              <el-divider class="sidebar-divider" />
              <el-dropdown-item @click="createFolder">{{ t("admin.newGroup") }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
    <el-scrollbar>
      <SidebarMenu
        :app-id="contextStore.appId"
        :menu-list="filteredAppMenus"
        :can-manage="canManageCurrentApp"
        :sortable="!menuFilterText.trim()"
        @editForm="editForm"
        @editMenu="openEditMenu"
        @editGroup="openEditGroup"
        @deleteMenu="deleteMenu"
        @menusChanged="saveMenus"
      />
    </el-scrollbar>
    <router-link
      v-if="canManageCurrentApp"
      custom
      :to="{ path: `/app/${contextStore.appId}/admin` }"
      v-slot="{ navigate }"
    >
      <div class="app-admin-entry" :class="{ collapsed: !isSidebarOpened }" @click="navigate">
        <et-icon icon="icon-settings" size="15px" />
        <span v-if="isSidebarOpened">{{ t("admin.appAdmin.title") }}</span>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import DashboardDesigner from "@/components/DashboardDesigner/index.vue";
import EditFormIcon from "./components/EditFormIcon.vue";
import EditMenuGroup from "./components/EditMenuGroup.vue";
import { usePermissionStore, useSystemStore, useWorkbenchStore } from "@/store";
import {
  AppDef,
  AppMenu,
  DashboardDef,
  DashboardDefRequest,
  FormDef,
  FormDefRequest,
  FormType,
} from "@eimsnext/models";
import { useAppStore, useContextStore, useFormStore } from "@eimsnext/store";
import FormEdit from "@/components/FormEdit/index.vue";
import { appDefService, dashboardDefService, formDefService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { BADGE_REFRESH_INTERVAL, queryAppTaskCount } from "@/utils/badge";
import { normalizeMenuType } from "@/utils/appEntry";
import { ElMessage } from "element-plus";
import { useAdminPermissions } from "@/composables/useAdminPermissions";
import { useRoute, useRouter } from "vue-router";

const { t } = useI18n();

const menuFilterText = ref("");
const filteredAppMenus = computed(() => {
  const keyword = menuFilterText.value.trim().toLowerCase();
  if (!keyword) return appMenus.value;

  const matchMenu = (m: AppMenu): AppMenu | null => {
    const title = (m.title ?? "").toString().toLowerCase();
    const matchedSub = (m.subMenus || []).map(matchMenu).filter((x): x is AppMenu => x !== null);
    if (title.includes(keyword) || matchedSub.length > 0) {
      return { ...m, subMenus: matchedSub };
    }
    return null;
  };

  return appMenus.value.map(matchMenu).filter((x): x is AppMenu => x !== null);
});

const newForm = ref<FormDef>();
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const formEditInitialTab = ref("formedit");
const formEditInitialAdvancedTab = ref("advanced-data");

type FormEditTarget = {
  outerTab: "formedit" | "workflow" | "extension" | "publish" | "datamanage";
  advancedTab?: string;
};

const formEditTargets: Record<string, FormEditTarget> = {
  formedit: { outerTab: "formedit" },
  workflow: { outerTab: "workflow" },
  "ext-data": { outerTab: "extension", advancedTab: "advanced-data" },
  "ext-notify": { outerTab: "extension", advancedTab: "notify" },
  "ext-print": { outerTab: "extension", advancedTab: "print" },
  "ext-eventFlow": { outerTab: "extension", advancedTab: "eventFlow" },
  "ext-webhook": { outerTab: "extension", advancedTab: "webpush" },
  publish: { outerTab: "publish" },
  datamanage: { outerTab: "datamanage" },
};

function resolveFormEditTarget(tab?: string): FormEditTarget {
  return formEditTargets[tab || "formedit"] || formEditTargets.formedit;
}

const newDash = ref<DashboardDef>();
const showDshEditor = ref(false);
const showMenuEditor = ref(false);
const editingMenu = ref<AppMenu>();
const showGroupEditor = ref(false);
const editingGroup = ref<AppMenu>();
var permissionStore = usePermissionStore();
const { appMenus } = storeToRefs(permissionStore);

const appStore = useAppStore();
const formStore = useFormStore();
const contextStore = useContextStore();
const route = useRoute();
const router = useRouter();
const appId = toRef(contextStore.appId);
const app = ref<AppDef>();
const { loadAdminPermissions, canManageAppId } = useAdminPermissions();

const systemStore = useSystemStore();
const workbenchStore = useWorkbenchStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
const isAppFavorite = computed(() => !!app.value && workbenchStore.isFavorite("app", app.value.id));
const workflowActiveIndex = computed(() => {
  switch (route.path) {
    case "/mytasks": return "mytask";
    case "/mystarted": return "mystarted";
    case "/myapproved": return "myapproved";
    case "/cctome": return "mycced";
    default: return "";
  }
});
const appTaskCount = ref(0);
const hasAppTask = computed(() => appTaskCount.value > 0);
const canManageCurrentApp = computed(() => canManageAppId(contextStore.appId));
let appTaskTimer: ReturnType<typeof setInterval> | null = null;

const loadCurrentApp = async () => {
  try {
    app.value = await appStore.get(contextStore.appId, true, true, { silentError: true });
  } catch {
    app.value = undefined;
  }
};

// 展开/收缩菜单
function toggleSideBar() {
  systemStore.toggleSidebar();
}

async function toggleAppFavorite() {
  if (!app.value) return;
  await workbenchStore.loadFavorites();
  await workbenchStore.toggleFavorite({ targetType: "app", targetId: app.value.id });
}

watch(
  () => contextStore.appId,
  () => {
    void loadCurrentApp();
  },
  { immediate: true }
);

const loadAppTaskCount = async () => {
  appTaskCount.value = await queryAppTaskCount(contextStore.appId);
};

watch(
  () => contextStore.appId,
  () => {
    loadAppTaskCount();
  },
  { immediate: true }
);

onMounted(() => {
  loadAdminPermissions();
  void workbenchStore.loadFavorites();
  appTaskTimer = setInterval(() => {
    loadAppTaskCount();
  }, BADGE_REFRESH_INTERVAL);
});

onBeforeUnmount(() => {
  if (appTaskTimer) {
    clearInterval(appTaskTimer);
    appTaskTimer = null;
  }
});

const createForm = (usingFlow: boolean) => {
  if (!canManageCurrentApp.value) return;

  usingWorkflow.value = usingFlow;

  //直接创建，防止工作流/数据流等设置报错
  let req: FormDefRequest = {
    id: "",
    appId: contextStore.appId,
    name: t("admin.untitledForm"),
    content: {
      layout: "[]",
      options: JSON.stringify({
        info: { align: "left" },
        form: { inline: false, hideRequiredAsterisk: false, labelPosition: "top", size: "default", labelWidth: "auto" },
        resetBtn: { show: false, innerText: t("common.reset") },
        submitBtn: { show: false, innerText: t("common.submit") },
      }),
    },
    usingWorkflow: usingFlow,
  };

  formDefService.post<FormDef>(req).then((resp) => {
    newForm.value = resp;
    formStore.update(resp);
    contextStore.setAppChanged(); //reload 菜单

    showFormEditor.value = true;
  });
};

const editForm = async (formId: string, type: FormType, target: FormEditTarget = formEditTargets.formedit) => {
  if (!canManageCurrentApp.value) return;

  if (type == FormType.Form) {
    const form = await formStore.get(formId);
    if (form) {
      newForm.value = form;
      usingWorkflow.value = form.usingWorkflow;
      formEditInitialTab.value = target.outerTab === "workflow" && !form.usingWorkflow
        ? "formedit"
        : target.outerTab;
      formEditInitialAdvancedTab.value = target.advancedTab || "advanced-data";

      showFormEditor.value = true;
    }
  } else if (type == FormType.Dashboard) {
    const dash = await dashboardDefService.get<DashboardDef>(formId);
    if (dash) {
      newDash.value = dash;
      showDshEditor.value = true;
    }
  }
};

watch(
  () => [route.query.mode, route.query.tab, route.params.formId, route.params.appId, contextStore.appId],
  async ([mode, tab, formId, appId]) => {
    if (mode !== "editform" || !formId || appId !== contextStore.appId) return;
    const tabName = Array.isArray(tab) ? tab[0] : tab;
    await editForm(String(formId), FormType.Form, resolveFormEditTarget(tabName ?? undefined));
    await router.replace({ query: { ...route.query, mode: undefined, tab: undefined } });
  },
  { immediate: true },
);

const createDashboard = () => {
  if (!canManageCurrentApp.value) return;

  let req: DashboardDefRequest = {
    id: "",
    appId: contextStore.appId,
    name: t("admin.untitledDashboard"),
    layout: "[]",
  };

  dashboardDefService.post<DashboardDef>(req).then((resp) => {
    newDash.value = resp;
    contextStore.setAppChanged(); //reload 菜单

    showDshEditor.value = true;
  });
};

const openEditMenu = (menu: AppMenu) => {
  if (!canManageCurrentApp.value) return;

  editingMenu.value = { ...menu };
  showMenuEditor.value = true;
};

const openEditGroup = (menu: AppMenu) => {
  if (!canManageCurrentApp.value) return;

  editingGroup.value = { ...menu };
  showGroupEditor.value = true;
};

const closeGroupDialog = () => {
  showGroupEditor.value = false;
  editingGroup.value = undefined;
};

const handleAppUpdated = (updatedApp: AppDef) => {
  appStore.update(updatedApp);
  app.value = updatedApp;
  showMenuEditor.value = false;
  editingMenu.value = undefined;
  closeGroupDialog();
  contextStore.setAppChanged();
};

const saveMenus = async () => {
  if (!app.value || !canManageCurrentApp.value) {
    return;
  }

  const updated = await appDefService.saveMenus({
    appId: contextStore.appId,
    appMenus: JSON.parse(JSON.stringify(appMenus.value)),
  });
  handleAppUpdated(updated);
};

const deleteMenu = async (menu: AppMenu) => {
  if (!canManageCurrentApp.value) return;

  const menuType = normalizeMenuType(menu.menuType);
  if (menuType === FormType.Form) {
    formStore.remove(menu.menuId);
    contextStore.setAppChanged();
    return;
  }

  if (menuType === FormType.Dashboard) {
    await dashboardDefService.delete(menu.menuId);
    contextStore.setAppChanged();
    return;
  }

  try {
    const updated = await appDefService.deleteGroup({ appId: contextStore.appId, menuId: menu.menuId });
    handleAppUpdated(updated);
  } catch (error: any) {
    ElMessage.warning(error?.message || t("admin.misc.childMenuDeleteBlocked"));
  }
};

const createFolder = () => {
  if (!canManageCurrentApp.value) return;

  editingGroup.value = undefined;
  showGroupEditor.value = true;
};
</script>

<style lang="scss" scoped>
.side-bar-control {
  border: none;
  position: absolute;
  top: var(--et-space-10);
  right: var(--et-space-0);
}

.app-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-scrollbar) {
  flex: 1;
  min-height: 0;
}

.app-admin-entry {
  align-items: center;
  border-top: 1px solid var(--et-border-color-light);
  color: var(--et-text-primary);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-8);
  height: var(--et-size-44);
  padding: 0 var(--et-space-16);

  &.collapsed {
    justify-content: center;
    padding: 0;
  }
}

.app-title {
  display: flex;
  overflow: hidden;
  padding: var(--et-space-12) var(--et-space-15) var(--et-space-12) var(--et-space-6);
  font-size: var(--et-font-size-16);
  align-items: center;
}

.app-title-text {
  color: var(--et-text-primary);
  cursor: pointer;
  flex: 0 1 var(--et-size-90);
  max-width: var(--et-size-90);
  min-width: 0;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.app-workflow-menu {
  --el-menu-text-color: var(--et-text-primary);
  --el-menu-active-color: var(--et-color-primary);
  --el-menu-hover-text-color: var(--et-color-primary);
  --el-menu-hover-bg-color: var(--et-bg-primary-soft);
}

.app-workflow-menu :deep(.el-menu-item:hover),
.app-workflow-menu :deep(.el-menu-item.is-active) {
  background-color: var(--et-bg-primary-soft) !important;
  color: var(--et-color-primary) !important;
}

.app-workflow-menu :deep(.el-menu-item:hover .step-image),
.app-workflow-menu :deep(.el-menu-item.is-active .step-image) {
  color: var(--et-color-primary) !important;
}

.app-favorite-button {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--et-text-tertiary);
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 var(--et-size-24);
  height: var(--et-size-24);
  justify-content: center;
  margin-left: auto;
  padding: 0;
  width: var(--et-size-24);
  opacity: 0;
  visibility: hidden;
  transition:
    color var(--et-duration-fast) var(--et-ease-standard),
    opacity var(--et-duration-fast) var(--et-ease-standard);

  &.active,
  &:hover {
    color: var(--et-color-primary);
  }

  &:focus-visible {
    opacity: 1;
    visibility: visible;
  }
}

.app-title:hover .app-favorite-button {
  opacity: 1;
  visibility: visible;
}

.form-action {
  display: flex;
  padding: 0 var(--et-space-8);
  margin-bottom: var(--et-space-5);
}

.step-image {
  color: var(--et-color-primary);
}

.app-menu-text {
  margin-left: var(--et-space-5);
}

.create-button {
  width: var(--et-size-30);
}

.sidebar-dropdown-menu {
  min-width: var(--et-size-150);
}

.sidebar-divider {
  margin: var(--et-space-3) 0;
}

:deep(.el-sub-menu__title) {
  line-height: var(--et-line-height-40);
  height: var(--et-size-40);
}

:deep(.el-menu-item) {
  line-height: var(--et-line-height-40);
  height: var(--et-size-40);
}
</style>
