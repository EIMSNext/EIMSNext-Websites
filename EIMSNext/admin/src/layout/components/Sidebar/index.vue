<template>
  <div>
    <form-edit v-if="showFormEditor && newForm" v-model="showFormEditor" :form-def="newForm!" :usingFlow="usingWorkflow"
      :isLedger="isLedger" @close="showFormEditor = false" />
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
    <div class="app-title" :style="{ paddingRight: isSidebarOpened ? 'var(--et-space-15)' : 'var(--et-space-6)' }">
      <AppIcon v-if="app" :app="app" iconSize="12px" style="width: 20px;height: 20px;" />
      <span v-if="isSidebarOpened" class="ml-[3px]">{{ app?.name }}</span>
      <el-button class="side-bar-control" @click.stop="toggleSideBar">
        <et-icon v-if="isSidebarOpened" icon="el-DArrowLeft" size="14px"></et-icon>
        <et-icon v-else icon="el-DArrowRight" size="14px"></et-icon>
      </el-button>
    </div>
    <div>
      <el-menu mode="vertical">
<router-link custom :to="{ name: 'mytasks', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="mytodo" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <el-badge :is-dot="hasAppTodo" :offset="[0, 8]">
              <et-icon icon="icon-mytodo" class="step-image" size="14px" />
            </el-badge>
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.mytasks") }}
            </span>
          </el-menu-item>
        </router-link>
<router-link custom :to="{ name: 'mystarted', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="mystarted" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <et-icon icon="icon-mystarted" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.mystarted") }}
            </span>
          </el-menu-item>
        </router-link>
<router-link custom :to="{ name: 'myapproved', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="myapproved" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <et-icon icon="icon-myapproved" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.myapproved") }}
            </span>
          </el-menu-item>
        </router-link>
<router-link custom :to="{ name: 'cctome', params: { appId: app?.id } }" v-slot="{ navigate }">
          <el-menu-item index="mycced" draggable="false" :class="{ 'pl-15px': !isSidebarOpened }" @dragstart.prevent @click="() => navigate()">
            <et-icon icon="icon-mycced" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">
              {{ t("common.wfProcess.cctome") }}
            </span>
          </el-menu-item>
        </router-link>
      </el-menu>
    </div>
    <div v-if="isSidebarOpened" class="form-action">
      <el-input>
        <template #prefix>
          <et-icon icon="el-search" size="14px"></et-icon>
        </template>
      </el-input>

      <template v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin">
        <el-dropdown placement="bottom-start" size="large">
          <el-button class="create-button">
            <et-icon icon="el-plus"></et-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="sidebar-dropdown-menu">
              <el-dropdown-item @click="createForm(false, false)">
                {{ t("admin.newForm") }}
              </el-dropdown-item>
              <el-dropdown-item @click="createForm(true, false)">
                {{ t("admin.newFlowForm") }}
              </el-dropdown-item>
              <el-dropdown-item @click="createForm(false, true)">
                {{ t("admin.newLedgerForm") }}
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
        :menu-list="appMenus"
        @editForm="editForm"
        @editMenu="openEditMenu"
        @editGroup="openEditGroup"
        @deleteMenu="deleteMenu"
        @menusChanged="saveMenus"
      />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import DashboardDesigner from "@/components/DashboardDesigner/index.vue";
import EditFormIcon from "./components/EditFormIcon.vue";
import EditMenuGroup from "./components/EditMenuGroup.vue";
import { usePermissionStore, useSystemStore } from "@/store";
import {
  App,
  AppMenu,
  DashboardDef,
  DashboardDefRequest,
  FormDef,
  FormDefRequest,
  FormType,
  UserType,
} from "@eimsnext/models";
import { useAppStore, useContextStore, useFormStore, useUserStore } from "@eimsnext/store";
import FormEdit from "@/components/FormEdit/index.vue";
import { appService, dashboardDefService, formDefService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { BADGE_REFRESH_INTERVAL, queryAppTodoCount } from "@/utils/badge";
import { ElMessage } from "element-plus";
const { t } = useI18n();

const newForm = ref<FormDef>();
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const isLedger = ref(false);

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
const userStore = useUserStore();
const curUser = toRef(userStore.currentUser);
const appId = toRef(contextStore.appId);
const app = ref<App>();

const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
const appTodoCount = ref(0);
const hasAppTodo = computed(() => appTodoCount.value > 0);
let appTodoTimer: ReturnType<typeof setInterval> | null = null;

// 展开/收缩菜单
function toggleSideBar() {
  systemStore.toggleSidebar();
}

watch(
  () => contextStore.appId,
  () => {
    appStore.get(contextStore.appId).then((res) => (app.value = res));
  },
  { immediate: true }
);

const loadAppTodoCount = async () => {
  appTodoCount.value = await queryAppTodoCount(contextStore.appId);
};

watch(
  () => contextStore.appId,
  () => {
    loadAppTodoCount();
  },
  { immediate: true }
);

onMounted(() => {
  appTodoTimer = setInterval(() => {
    loadAppTodoCount();
  }, BADGE_REFRESH_INTERVAL);
});

onBeforeUnmount(() => {
  if (appTodoTimer) {
    clearInterval(appTodoTimer);
    appTodoTimer = null;
  }
});

const createForm = (usingFlow: boolean, ledger: boolean) => {
  usingWorkflow.value = usingFlow;
  isLedger.value = ledger;

  //直接创建，防止工作流/数据流等设置报错
  let req: FormDefRequest = {
    id: "",
    appId: contextStore.appId,
    name: t("admin.untitledForm"),
    content: {
      layout: "[]",
      options:
        '{"info":{"align":"left"},"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"top","size":"default","labelWidth":"auto"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":false,"innerText":"提交"}}',
    },
    usingWorkflow: usingFlow,
    isLedger: ledger,
  };

  formDefService.post<FormDef>(req).then((resp) => {
    newForm.value = resp;
    formStore.update(resp);
    contextStore.setAppChanged(); //reload 菜单

    showFormEditor.value = true;
  });
};

const editForm = async (formId: string, type: FormType) => {
  if (type == FormType.Form) {
    const form = await formStore.get(formId);
    if (form) {
      newForm.value = form;
      usingWorkflow.value = form.usingWorkflow;
      isLedger.value = form.isLedger;

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

const createDashboard = () => {
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
  editingMenu.value = { ...menu };
  showMenuEditor.value = true;
};

const openEditGroup = (menu: AppMenu) => {
  editingGroup.value = { ...menu };
  showGroupEditor.value = true;
};

const closeGroupDialog = () => {
  showGroupEditor.value = false;
  editingGroup.value = undefined;
};

const handleAppUpdated = (updatedApp: App) => {
  appStore.update(updatedApp);
  app.value = updatedApp;
  showMenuEditor.value = false;
  editingMenu.value = undefined;
  closeGroupDialog();
  contextStore.setAppChanged();
};

const saveMenus = async () => {
  if (!app.value) {
    return;
  }

  const updated = await appService.saveMenus({
    appId: contextStore.appId,
    appMenus: JSON.parse(JSON.stringify(appMenus.value)),
  });
  handleAppUpdated(updated);
};

const deleteMenu = async (menu: AppMenu) => {
  if (menu.menuType === FormType.Form) {
    formStore.remove(menu.menuId);
    contextStore.setAppChanged();
    return;
  }

  if (menu.menuType === FormType.Dashboard) {
    await dashboardDefService.delete(menu.menuId);
    contextStore.setAppChanged();
    return;
  }

  try {
    const updated = await appService.deleteGroup({ appId: contextStore.appId, menuId: menu.menuId });
    handleAppUpdated(updated);
  } catch (error: any) {
    ElMessage.warning(error?.message || "当前分组下存在子菜单，不能删除");
  }
};

const createFolder = () => {
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

.app-title {
  display: flex;
  overflow: hidden;
  padding: var(--et-space-12) var(--et-space-15) var(--et-space-12) var(--et-space-6);
  font-size: var(--et-font-size-16);
  align-items: center;
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
