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
          <div class="empty-title">创建以下对象，开始构建应用</div>
          <!-- <el-link target="_blank">了解表单和仪表盘</el-link> -->
        </div>
        <div class="creator-container">
          <div class="creator-item" @click="createForm(false, false)">
            <div class="tip-icon generic">
              <div class="create-icon generic"></div>
              <div class="tip-title">新建普通表单</div>
            </div>
            <div class="tip-desc">适用于数据上报、问卷调研等业务。</div>
          </div>

          <div class="creator-item" @click="createForm(true, false)">
            <div class="tip-icon flow">
              <div class="create-icon flow"></div>
              <div class="tip-title">新建流程表单</div>
            </div>
            <div class="tip-desc">适用于有特定流程，需要不同成员分步骤填写数据的业务。</div>
          </div>
          <div class="creator-item" @click="createForm(false, true)">
            <div class="tip-icon generic">
              <div class="create-icon generic"></div>
              <div class="tip-title">新建数据台账</div>
            </div>
            <div class="tip-desc">用于财务台账，库存台账等持续使用业务</div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
<script lang="ts" setup>
import Layout from "@/layout/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore, useFormStore, useContextStore } from "@eimsnext/store";
import FormEdit from "@/components/FormEdit/index.vue";
import { App, FormDef, FormDefRequest, FormType } from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
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

const app = ref<App>();

onBeforeMount(async () => {
  await contextStore.setAppId(appId);
  appStore.get(contextStore.appId).then((res) => (app.value = res));
  if (formStore.items.length > 0) {
    const path = `/app/${appId}/form/${formStore.items[0].id}`;
    router.push(path);
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
