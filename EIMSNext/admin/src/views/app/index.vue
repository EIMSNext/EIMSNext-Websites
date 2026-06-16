<template>
  <form-edit
    v-if="showFormEditor && newForm"
    :modelValue="showFormEditor"
    :formDef="newForm!"
    :usingFlow="usingWorkflow"
    :isLedger="isLedger"
    @close="showFormEditor = false"
  />
  <Layout>
    <div class="empty-app">
      <div class="empty-content">
        <div class="empty-tips">
          <div class="empty-title">{{ $t("admin.appPage.createPlaceholder") }}</div>
          <!-- <el-link target="_blank">{{ $t("admin.myApp") }}</el-link> -->
        </div>
        <div v-if="canManageCurrentApp" class="creator-container">
          <div class="creator-item" @click="createForm(false, false)">
            <div class="tip-icon generic">
              <div class="create-icon generic"></div>
              <div class="tip-title">{{ $t("admin.appPage.newForm") }}</div>
            </div>
            <div class="tip-desc">{{ $t("admin.appPage.newFormDesc") }}</div>
          </div>

          <div class="creator-item" @click="createForm(true, false)">
            <div class="tip-icon flow">
              <div class="create-icon flow"></div>
              <div class="tip-title">{{ $t("admin.appPage.newFlowForm") }}</div>
            </div>
            <div class="tip-desc">{{ $t("admin.appPage.newFlowFormDesc") }}</div>
          </div>
          <div class="creator-item" @click="createForm(false, true)">
            <div class="tip-icon generic">
              <div class="create-icon generic"></div>
              <div class="tip-title">{{ $t("admin.appPage.newLedger") }}</div>
            </div>
            <div class="tip-desc">{{ $t("admin.appPage.newLedgerDesc") }}</div>
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
import { useAppStore, useFormStore, useContextStore } from "@eimsnext/store";
import FormEdit from "@/components/FormEdit/index.vue";
import { AppDef, FormDef, FormDefRequest, FormType } from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { useAdminPermissions } from "@/composables/useAdminPermissions";
import { resolveAppEntryPath } from "@/utils/appEntry";
const { t } = useI18n();

const newForm = ref<FormDef>();
const router = useRouter();
const appStore = useAppStore();
const formStore = useFormStore();
const contextStore = useContextStore();
const route = useRoute();
let appId = route.params.appId.toString();
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const isLedger = ref(false);
const { loadAdminPermissions, canManageAppId } = useAdminPermissions();
const canManageCurrentApp = computed(() => canManageAppId(contextStore.appId));

const app = ref<AppDef>();

onBeforeMount(async () => {
  await contextStore.setAppId(appId);
  await loadAdminPermissions();
  const resolvedApp = await appStore.get(contextStore.appId, false);
  app.value = resolvedApp;
  if (resolvedApp) {
    const path = resolveAppEntryPath(resolvedApp);
    if (path !== route.fullPath) {
      router.replace(path);
      return;
    }
  }
});

const createForm = (usingFlow: boolean, ledger: boolean) => {
  if (!canManageCurrentApp.value) return;

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
        `{"info":{"align":"left"},"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"top","size":"default","labelWidth":"auto"},"resetBtn":{"show":false,"innerText":"${t('common.reset')}"},"submitBtn":{"show":false,"innerText":"${t('common.submit')}"}}`,
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
            background-repeat: no-repeat;
            background-size: cover;
            height: var(--et-size-110);
            margin: var(--et-space-42) auto var(--et-space-14);
            width: var(--et-size-90);
          }

          &.flow {
            background: var(--et-bg-warning-soft);
          }

          &.generic {
            background: var(--et-bg-info-soft);
          }

          .tip-title {
            flex: 1 1 auto;
            font-size: var(--et-font-size-16);
            font-weight: 700;
            line-height: var(--et-line-height-22);
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
