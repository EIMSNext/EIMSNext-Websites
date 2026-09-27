<template>
  <form-edit
    v-if="showFormEditor && newForm"
    :modelValue="showFormEditor"
    :formDef="newForm!"
    :usingFlow="usingWorkflow"
    @close="showFormEditor = false"
  />
  <DashboardDesigner
    v-if="showDashboardEditor && newDashboard"
    :model-value="showDashboardEditor"
    :dash-def="newDashboard"
    @update:model-value="handleDashboardEditorVisible"
  />
  <Layout>
    <div v-if="showEmptyPage" class="empty-app">
      <div class="empty-content">
        <div class="empty-tips">
          <div class="empty-title">{{ $t("admin.appPage.createPlaceholder") }}</div>
          <!-- <el-link target="_blank">{{ $t("admin.myApp") }}</el-link> -->
        </div>
        <div v-if="canManageCurrentApp" class="creator-container">
          <div class="creator-item" @click="createForm(false)">
            <div class="tip-icon generic">
              <et-icon class="create-icon" icon="icon-formdefault" size="72px" />
              <div class="tip-title">{{ $t("admin.appPage.newForm") }}</div>
            </div>
            <div class="tip-desc">{{ $t("admin.appPage.newFormDesc") }}</div>
          </div>

          <div class="creator-item" @click="createForm(true)">
            <div class="tip-icon flow">
              <et-icon class="create-icon" icon="icon-flowdefault" size="72px" />
              <div class="tip-title">{{ $t("admin.appPage.newFlowForm") }}</div>
            </div>
            <div class="tip-desc">{{ $t("admin.appPage.newFlowFormDesc") }}</div>
          </div>
          <div class="creator-item" @click="createDashboard">
            <div class="tip-icon dashboard">
              <et-icon class="create-icon" icon="icon-dshdefault" size="72px" />
              <div class="tip-title">{{ $t("admin.newDashboard") }}</div>
            </div>
            <div class="tip-desc">{{ $t("admin.appPage.newDashboardDesc") }}</div>
          </div>
        </div>
        <el-empty v-else :description="$t('common.noPermission')" />
      </div>
    </div>
  </Layout>
</template>
<script lang="ts" setup>
import Layout from "@/layout/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore, useFormStore, useContextStore, useUserStore } from "@eimsnext/store";
import FormEdit from "@/components/FormEdit/index.vue";
import DashboardDesigner from "@/components/DashboardDesigner/index.vue";
import {
  AppDef,
  DashboardDef,
  DashboardDefRequest,
  FormDef,
  FormDefRequest,
  UserType,
} from "@eimsnext/models";
import { dashboardDefService, formDefService, systemService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { useAdminPermissions } from "@/composables/useAdminPermissions";
import { resolveAppEntryPath } from "@/utils/appEntry";
const { t } = useI18n();

const newForm = ref<FormDef>();
const router = useRouter();
const appStore = useAppStore();
const formStore = useFormStore();
const contextStore = useContextStore();
const userStore = useUserStore();
const route = useRoute();
const appId = computed(() => String(route.params.appId || ""));
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const newDashboard = ref<DashboardDef>();
const showDashboardEditor = ref(false);
const { loadAdminPermissions, canManageAppId } = useAdminPermissions();
const canManageCurrentApp = computed(() => canManageAppId(contextStore.appId));

const app = ref<AppDef>();
let appLoadSequence = 0;
const showEmptyPage = ref(false);

const loadAppEntry = async () => {
  const sequence = ++appLoadSequence;
  const targetAppId = appId.value;
  if (!targetAppId) return;

  showEmptyPage.value = false;
  await contextStore.setAppId(targetAppId);
  await loadAdminPermissions();
  const resolvedApp = await appStore.get(targetAppId, false);
  if (sequence !== appLoadSequence || targetAppId !== appId.value) return;

  app.value = resolvedApp;
  if (resolvedApp) {
    const visibleMenuIds = await getVisibleMenuIds(targetAppId);
    if (sequence !== appLoadSequence || targetAppId !== appId.value) return;

    const path = resolveAppEntryPath(resolvedApp, visibleMenuIds);
    if (path !== route.fullPath) {
      await router.replace(path);
      return;
    }

    // 决议后仍停留本页：该应用确实没有可用入口，显示空应用占位
    showEmptyPage.value = true;
  }
};

watch(appId, () => void loadAppEntry(), { immediate: true });

async function getVisibleMenuIds(appId: string) {
  const unrestrictedUserTypes = [
    UserType.System,
    UserType.Client,
    UserType.CorpOwmer,
    UserType.CorpAdmin,
  ];
  if (unrestrictedUserTypes.includes(userStore.currentUser.userType)) {
    return undefined;
  }

  const perms = await systemService.getAppMenuPerms(appId);
  return perms.map((item: { id: string }) => item.id);
}

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
      options: `{"info":{"align":"left"},"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"top","size":"default","labelWidth":"auto"},"resetBtn":{"show":false,"innerText":"${t("common.reset")}"},"submitBtn":{"show":false,"innerText":"${t("common.submit")}"}}`,
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

const createDashboard = () => {
  if (!canManageCurrentApp.value) return;

  const req: DashboardDefRequest = {
    id: "",
    appId: contextStore.appId,
    name: t("admin.untitledDashboard"),
    layout: "[]",
  };

  dashboardDefService.post<DashboardDef>(req).then((resp) => {
    newDashboard.value = resp;
    contextStore.setAppChanged();
    showDashboardEditor.value = true;
  });
};

const handleDashboardEditorVisible = (visible: boolean) => {
  showDashboardEditor.value = visible;
  if (!visible && newDashboard.value) {
    void router.replace(`/app/${contextStore.appId}/dash/${newDashboard.value.id}`);
  }
};
</script>
<style lang="scss" scoped>
.empty-app {
  background: var(--et-bg-page);
  height: 100%;
  overflow: auto;
  padding: var(--et-space-10) 0;
  width: 100%;

  .empty-content {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    max-height: var(--et-size-660);
    min-height: var(--et-size-540);
    min-width: var(--et-size-906);

    .empty-tips {
      display: flex;
      flex: 0 0 auto;
      margin-top: var(--et-size-50);
      padding: 0 var(--et-space-24);

      .empty-title {
        flex: 1 1 auto;
        font-size: var(--et-font-size-16);
        font-weight: 700;
        line-height: var(--et-line-height-22);
        color: var(--et-text-primary);
      }
    }

    .creator-container {
      display: flex;

      .creator-item {
        background: var(--et-bg-container);
        border-radius: var(--et-radius-8);
        cursor: pointer;
        flex-direction: column;
        height: var(--et-size-300);
        margin: var(--et-space-15) var(--et-space-24);
        padding: var(--et-space-10) var(--et-space-10) var(--et-space-80);
        width: var(--et-size-270);
        display: flex;

        .tip-icon {
          border-radius: var(--et-radius-8);
          flex: 0 0 auto;
          height: var(--et-size-210);
          text-align: center;
          width: var(--et-size-250);

          .create-icon {
            display: flex;
            height: var(--et-size-110);
            margin: var(--et-space-42) auto var(--et-space-14);
            width: var(--et-size-90);
            align-items: center;
            justify-content: center;
          }

          &.flow {
            background: var(--et-bg-warning-soft);

            .create-icon {
              color: var(--et-color-warning);
            }
          }

          &.generic {
            background: var(--et-bg-info-soft);

            .create-icon {
              color: var(--et-color-primary);
            }
          }

          &.dashboard {
            background: var(--et-bg-success-soft);

            .create-icon {
              color: var(--et-color-success);
            }
          }

          .tip-title {
            flex: 1 1 auto;
            font-size: var(--et-font-size-16);
            font-weight: 700;
            line-height: var(--et-line-height-22);
            color: var(--et-text-primary);
          }
        }

        .tip-desc {
          color: var(--et-text-secondary);
          font-size: var(--et-font-size-12);
          margin-top: var(--et-space-12);
          text-align: center;
        }
      }
    }
  }
}
</style>
