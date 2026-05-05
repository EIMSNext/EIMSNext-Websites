<template>
  <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
    :showNoSave="false" okText="确定" @ok="execDelete">
    <div>数据删除后将不可恢复</div>
  </EtConfirmDialog>
  <el-drawer v-model="showEditor" direction="btt" size="95%" @close="close">
    <template #header>
      <div class="main-title"><span>数据推送</span></div>
    </template>
    <div class="main-content">
      <WebhookEditor v-if="selectedItem" v-model="selectedItem" :formDef="formDef" :key="selectedItem.id" />
    </div>
  </el-drawer>
  <el-drawer v-model="showLog" direction="btt" size="95%" @close="showLog = false">
    <template #header>
      <div class="main-title"><span>推送日志</span></div>
    </template>
    <div class="main-content">
      <WebPushLogView v-if="selectedItem" v-model="selectedItem" />
    </div>
  </el-drawer>
  <AdvanceLayout title="数据推送" desc="数据推送可将表单数据推送至你指定的服务器">
    <div class="flow-container">
      <div class="panel-header">
        <div class="header-left">
          <el-button type="primary" icon="plus" @click="addNew()">新建数据推送</el-button>
        </div>
        <div class="header-right header-links">
          <div class="alias-panel" aria-label="text-links">
            <a class="link" @click="openAliasPanel">设置字段别名</a>
            <span class="sep">|</span>
            <a class="link" @click="openFieldMapPanel">字段对照表及JSON样例</a>
            <span class="sep">|</span>
            <a class="link" @click="openStructurePanel">表单数据结构</a>
          </div>
        </div>
      </div>
      <div>
        <el-space direction="vertical" class="flow-space">
          <template v-for="hook in webhooks">
            <et-card class="flow-card" :title="'推送到自定义服务器'">
              <template #action>
                <div class="flow-header">
                  <el-button @click="viewLog(hook)">推送日志</el-button>
                  <el-button @click="edit(hook)">编辑</el-button>
                  <el-button @click="remove(hook)">删除</el-button>
                  <el-switch :model-value="!hook.disabled" @change="toggleDisable(hook)"></el-switch>
                </div>
              </template>
              <div class="flow-content">
                <div class="item-line">服务器地址: {{ hook.url }}</div>
                <div class="item-line">推送事件: {{ hook.triggers }}</div>
              </div>
            </et-card>
          </template>
        </el-space>
      </div>
    </div>
  </AdvanceLayout>

  <!-- 字段别名设置 Drawer -->
  <el-drawer v-model="showAlias" direction="btt" size="95%" @close="showAlias = false">
    <template #header>
      <div class="main-title"><span>设置字段别名</span></div>
    </template>
    <div class="main-content">
      <WebhookAliasEditor :formDef="formDef" @saved="onAliasSaved" />
    </div>
  </el-drawer>

  <!-- 字段对照表 Drawer（占位） -->
  <el-drawer v-model="showFieldMap" direction="btt" size="95%" @close="showFieldMap = false">
    <template #header>
      <div class="main-title"><span>字段对照表及JSON样例</span></div>
    </template>
    <div class="alias-drawer-content" style="padding: 16px 20px;">
      <p>此处展示字段对照表及示例JSON（占位内容）</p>
      <pre style="background:#f6f7f9;border:1px solid #e8eaed;padding:12px;overflow:auto;max-height:320px;">{
      "字段示例": ["field1", "field2", "field3"]
      }</pre>
    </div>
  </el-drawer>

  <!-- 表单数据结构 Drawer（占位） -->
  <el-drawer v-model="showStructure" direction="btt" size="95%" @close="showStructure = false">
    <template #header>
      <div class="main-title"><span>表单数据结构</span></div>
    </template>
    <div class="alias-drawer-content" style="padding: 16px 20px;">
      <p>表单数据结构描述（占位内容）</p>
    </div>
  </el-drawer>
</template>
<script setup lang="ts">
import WebhookEditor from "./WebhookEditor.vue";
import WebhookAliasEditor from "./WebhookAliasEditor.vue";
import { onBeforeMount } from "vue";
import WebPushLogView from "./WebPushLogView.vue";
import { WebHookTrigger } from "@eimsnext/models";
import type { FormDef, Webhook } from "@eimsnext/models";
import { webhookService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AdvanceLayout from "./AdvanceLayout.vue";
import { MessageIcon } from "@eimsnext/components";

defineOptions({
  name: "WebhookList",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showEditor = ref(false);
const showLog = ref(false);
const showDeleteConfirmDialog = ref(false);
const webhooks = ref<Webhook[]>([]);
const selectedItem = ref<Webhook>();
const editorKey = ref(0);

// UI state for auxiliary drawers
const showAlias = ref(false);
const showFieldMap = ref(false);
const showStructure = ref(false);

const openAliasPanel = () => {
  showAlias.value = true;
};
const openFieldMapPanel = () => (showFieldMap.value = true);
const openStructurePanel = () => (showStructure.value = true);

const onAliasSaved = () => {
  showAlias.value = false;
};

const loadWebhooks = (formId: string) => {
  let query = buildQuery({ filter: { formId: formId } });
  webhookService.query<Webhook>(query).then((res) => {
    webhooks.value = res;
  });
};

const addNew = () => {
  selectedItem.value = {
    id: "",
    appId: props.formDef.appId,
    formId: props.formDef.id,
    url: "",
    secret: "",
    triggers:
      WebHookTrigger.Data_Created | WebHookTrigger.Data_Updated | WebHookTrigger.Data_Removed,
    disabled: false,
  };
  editorKey.value++;
  showEditor.value = true;
};

const viewLog = (hook: Webhook) => {
  selectedItem.value = hook;
  showLog.value = true;
};

const edit = (hook: Webhook) => {
  selectedItem.value = hook;
  editorKey.value++;
  showEditor.value = true;
};

const remove = (hook: Webhook) => {
  selectedItem.value = hook;
  showDeleteConfirmDialog.value = true;
};
const execDelete = () => {
  webhookService.delete<Webhook>(selectedItem.value!.id).then((res) => {
    loadWebhooks(props.formDef.id);
    showDeleteConfirmDialog.value = false;
  });
};
const toggleDisable = (hook: Webhook) => {
  webhookService.patch<Webhook>(hook.id, { id: hook.id, disabled: !hook.disabled }).then((res) => {
    hook.disabled = !hook.disabled;
  });
};

function close() {
  showEditor.value = false;
  loadWebhooks(props.formDef.id);
}

onBeforeMount(() => {
  if (props.formDef) {
    loadWebhooks(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.flow-container {
  display: flex;
  flex-direction: column;

  .panel-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--et-space-16);
  }

  .flow-space {
    width: 100%;
    align-items: normal !important;
  }

  .flow-card {
    width: 100%;

    .flow-header {
      display: flex;
      justify-content: space-between;

      .flow-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-button {
        margin: var(--et-space-0);
        border: none;
      }
    }

    .flow-content {
      display: flex;
      font-size: var(--et-font-size-13);
      padding: var(--et-space-10) var(--et-space-20);
      flex-direction: column;

      .item-line {
        word-wrap: break-word;
        align-items: center;
        color: var(--et-text-secondary);
        display: flex;
        font-size: var(--et-font-size-14);
        line-height: var(--et-line-height-22);
        word-break: break-word;
      }
    }
  }
}

.main-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: var(--et-font-size-16);
}

.main-content {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: var(--et-size-60);
}

/* Header links styling (图1) */
.header-links {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 8px;
}

.alias-panel {
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
}

.alias-panel .link {
  color: var(--et-text-primary);
  text-decoration: none;
  font-size: 13px;
  cursor: pointer;
}

.alias-panel .sep {
  color: var(--et-text-tertiary);
  font-weight: 600;
  padding: 0 6px;
}

.alias-drawer-footer {
  display: flex;
  justify-content: center;
  padding: 12px 0 0;
  border-top: 1px solid var(--et-border-color);
  margin-top: 8px;
}
</style>
