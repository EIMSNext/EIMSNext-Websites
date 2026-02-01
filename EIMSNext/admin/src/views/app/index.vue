<template>
  <form-edit v-if="showFormEditor" :formId="newFormId" :usingFlow="usingWorkflow" :isLedger="isLedger"
    @close="showFormEditor = false" />
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
const { t } = useI18n()

const newFormId = ref("")
const router = useRouter();
const appStore = useAppStore()
const formStore = useFormStore();
const contextStore = useContextStore();
const route = useRoute();
let appId = route.params.appId.toString();
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const isLedger = ref(false);

const app = ref<App>();
// console.log("appid", appId, contextStore.appId);

onBeforeMount(async () => {
  // console.log("appid", appId, contextStore.appId);
  await contextStore.setAppId(appId);
  appStore.get(contextStore.appId).then((res) => (app.value = res));
  if (formStore.items.length > 0) {
    const path = `/app/${appId}/form/${formStore.items[0].id}`;

    // console.log("forms", path, formStore.items);
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
    type: FormType.Form,
    content: {
      "layout": "[]",
      "options": "{\"info\":{\"align\":\"left\"},\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"top\",\"size\":\"default\",\"labelWidth\":\"auto\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":false,\"innerText\":\"提交\"}}"
    },
    usingWorkflow: usingFlow,
    isLedger: ledger,
  };

  formDefService.post<FormDef>(req).then(resp => {
    newFormId.value = resp.id
    formStore.update(resp);
    contextStore.setAppChanged(); //reload 菜单

    showFormEditor.value = true;
  });
};
</script>
<style lang="scss" scoped>
.empty-app {
  background: #f5f6f8;
  height: 100%;
  overflow: auto;
  padding: 10px 0;
  width: 100%;

  .empty-content {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    max-height: 660px;
    min-height: 540px;
    min-width: 906px;

    .empty-tips {
      display: flex;
      flex: 0 0 auto;
      margin-top: 50px;
      padding: 0 24px;

      .empty-title {
        flex: 1 1 auto;
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
      }
    }

    .creator-container {
      display: flex;

      .creator-item {
        background: #fff;
        border-radius: 8px;
        cursor: pointer;
        flex-direction: column;
        height: 300px;
        margin: 15px 24px;
        padding: 10px 10px 80px;
        width: 270px;
        display: flex;

        .tip-icon {
          border-radius: 8px;
          flex: 0 0 auto;
          height: 210px;
          text-align: center;
          width: 250px;

          .create-icon {
            background-repeat: no-repeat;
            background-size: cover;
            height: 110px;
            margin: 42px auto 14px;
            width: 90px;
          }

          &.flow {
            background: #fff2e8;
          }

          &.generic {
            background: #eaf2fd;
          }

          .tip-title {
            flex: 1 1 auto;
            font-size: 16px;
            font-weight: 700;
            line-height: 22px;
          }
        }

        .tip-desc {
          color: var(--et-color-text-secondary);
          font-size: 12px;
          margin-top: 12px;
          text-align: center;
        }
      }
    }
  }
}
</style>
