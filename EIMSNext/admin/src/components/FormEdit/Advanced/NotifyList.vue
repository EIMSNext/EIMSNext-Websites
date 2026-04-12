<template>
  <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
    :showNoSave="false" okText="确定" @ok="execDelete">
    <div>数据删除后将不可恢复</div>
  </EtConfirmDialog>
  <el-drawer v-model="showDrawer" direction="btt" size="95%" @close="close">
    <template #header>
      <div class="main-title"><span>提醒助手</span></div>
    </template>
    <div class="main-content">
      <NotifyEditor v-if="selectedItem" v-model="selectedItem" :formDef="formDef" :key="editorKey" @saved="onSaved" />
    </div>
  </el-drawer>
  <AdvanceLayout title="提醒助手" desc="设置推送规则，根据规则自动给相关人员发送提醒消息">
    <div class="flow-container">
      <div class="panel-header">
        <div class="header-left">
          <el-button type="primary" icon="plus" @click="addNew()">新建提醒助手</el-button>
        </div>
        <div class="header-right"></div>
      </div>
      <div>
        <el-space direction="vertical" class="flow-space">
          <template v-for="notify in formNotifies" :key="notify.id">
            <et-card class="flow-card" :title="getNotifyTitle(notify)">
              <template #action>
                <div class="flow-header">
                  <el-button @click="edit(notify)">编辑</el-button>
                  <el-button @click="remove(notify)">删除</el-button>
                  <el-switch :model-value="!notify.disabled" @change="toggleDisable(notify)"></el-switch>
                </div>
              </template>
              <div class="flow-content">
                <div class="item-line">提醒类型: {{ getTriggerModeText(notify.triggerMode) }}</div>
                <div class="item-line">提醒文字: {{ notify.notifyText || "未设置" }}</div>
                <div class="item-line">提醒方式: {{ getChannelText(notify.channels) }}</div>
              </div>
            </et-card>
          </template>
        </el-space>
      </div>
    </div>
  </AdvanceLayout>
</template>

<script setup lang="ts">
import NotifyEditor from "./NotifyEditor.vue";
import {
  FormDef,
  FormNotify,
  FormNotifyRequest,
  FormNotifyTriggerMode,
  NotifyChannel,
} from "@eimsnext/models";
import { formNotifyService } from "@eimsnext/services";
import { FlagEnum } from "@eimsnext/utils";
import buildQuery from "odata-query";
import AdvanceLayout from "./AdvanceLayout.vue";
import { MessageIcon } from "@eimsnext/components";

defineOptions({
  name: "NotifyList",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDrawer = ref(false);
const showDeleteConfirmDialog = ref(false);
const formNotifies = ref<FormNotify[]>([]);
const selectedItem = ref<FormNotify>();
const editorKey = ref(0);

const loadFormNotifies = (formId: string) => {
  const query = buildQuery({ filter: { formId: formId } });
  formNotifyService.query<FormNotify>(query).then((res) => {
    formNotifies.value = res || [];
  });
};

const createDefaultFormNotify = (): FormNotify =>
  ({
    id: "",
    appId: props.formDef.appId,
    formId: props.formDef.id,
    triggerMode: FormNotifyTriggerMode.DataAdded,
    changeFields: [],
    dataFilter: "",
    notifyText: "有新数据提交，请及时处理",
    notifiers: "[]",
    channels: NotifyChannel.System,
    disabled: false,
  }) as FormNotify;

const addNew = () => {
  selectedItem.value = createDefaultFormNotify();
  editorKey.value++;
  showDrawer.value = true;
};

const edit = (notify: FormNotify) => {
  selectedItem.value = notify;
  editorKey.value++;
  showDrawer.value = true;
};

const remove = (notify: FormNotify) => {
  selectedItem.value = notify;
  showDeleteConfirmDialog.value = true;
};

const execDelete = () => {
  formNotifyService.delete<FormNotify>(selectedItem.value!.id).then(() => {
    loadFormNotifies(props.formDef.id);
    showDeleteConfirmDialog.value = false;
  });
};

const toggleDisable = (notify: FormNotify) => {
  const request: FormNotifyRequest = {
    id: notify.id,
    disabled: !notify.disabled,
  } as FormNotifyRequest;
  formNotifyService.patch<FormNotify>(notify.id, request).then(() => {
    notify.disabled = !notify.disabled;
  });
};

const onSaved = () => {
  showDrawer.value = false;
  loadFormNotifies(props.formDef.id);
};

function close() {
  showDrawer.value = false;
  loadFormNotifies(props.formDef.id);
}

function getNotifyTitle(notify: FormNotify): string {
  const modeText = getTriggerModeText(notify.triggerMode);
  return `${modeText}提醒`;
}

function getTriggerModeText(mode: FormNotifyTriggerMode): string {
  const map: Record<number, string> = {
    [FormNotifyTriggerMode.DataAdded]: "新数据提交",
    [FormNotifyTriggerMode.DataChanged]: "数据修改",
    [FormNotifyTriggerMode.CustomScheduled]: "自定义定时",
    [FormNotifyTriggerMode.TimeFieldScheduled]: "字段定时",
  };
  return map[mode] || "未知";
}

function getChannelText(channels: NotifyChannel): string {
  const parts: string[] = [];
  if (FlagEnum.has(channels, NotifyChannel.System)) parts.push("站内消息");
  if (FlagEnum.has(channels, NotifyChannel.Email)) parts.push("邮箱消息");
  return parts.length ? parts.join("、") : "未设置";
}

onBeforeMount(() => {
  if (props.formDef) {
    loadFormNotifies(props.formDef.id);
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
</style>
