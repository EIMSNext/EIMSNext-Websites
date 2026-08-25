<template>
  <EtConfirmDialog v-model="showDeleteConfirmDialog" :title="t('common.message.deleteConfirm_Title')" :icon="MessageIcon.Warning"
    :showNoSave="false" :okText="t('common.ok')" @ok="execDelete">
    <div>{{ t("common.message.deleteConfirm_Content2") }}</div>
  </EtConfirmDialog>
  <el-drawer v-model="showDrawer" class="elt-drawer" direction="btt" size="95%" @close="close">
    <template #header>
      <div class="main-title"><span>{{ t("admin.notify.title") }}</span></div>
    </template>
    <div class="main-content">
      <NotifyEditor v-if="selectedItem" v-model="selectedItem" :formDef="formDef" :key="editorKey" @saved="onSaved" />
    </div>
  </el-drawer>
  <AdvanceLayout :title="t('admin.notify.title')" :desc="t('admin.notify.desc')">
    <div class="flow-container">
      <div class="panel-header">
        <div class="header-left">
          <el-button type="primary" icon="plus" @click="addNew()">{{ t("admin.notify.new") }}</el-button>
        </div>
        <div class="header-right"></div>
      </div>
      <div>
        <el-space direction="vertical" class="flow-space">
          <template v-for="notify in formNotifies" :key="notify.id">
            <et-card class="flow-card" :title="getNotifyTitle(notify)">
              <template #action>
                <div class="flow-header">
                  <el-button @click="edit(notify)">{{ t("common.edit") }}</el-button>
                  <el-button class="delete-button" @click="remove(notify)">{{ t("common.delete") }}</el-button>
                  <el-switch :model-value="!notify.disabled" @change="toggleDisable(notify)"></el-switch>
                </div>
              </template>
               <div class="flow-content">
                 <div class="item-line">{{ t("admin.notify.type") }}: {{ getTriggerModeText(notify.triggerMode) }}</div>
                 <div v-if="getScheduleSummary(notify)" class="item-line">
                   {{ t("admin.notify.time") }}: {{ getScheduleSummary(notify) }}
                 </div>
                 <div v-if="getRepeatSummary(notify)" class="item-line">
                   {{ t("admin.notify.repeatRule") }}: {{ getRepeatSummary(notify) }}
                 </div>
                 <div class="item-line">{{ t("admin.notify.text") }}: {{ notify.notifyText || t("common.notset") }}</div>
                 <div class="item-line">{{ t("admin.notify.channel") }}: {{ getChannelText(notify.channels) }}</div>
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
import { getNotifyRepeatSummary, getNotifyScheduleSummary } from "../../../utils/notify";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
    timeField: undefined,
    startTime: undefined,
    endTime: undefined,
    repeatType: undefined,
    repeatConfig: undefined,
    changeFields: [],
    dataFilter: "",
    notifyText: t("admin.notify.defaultText"),
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
  return `${modeText}${t("admin.notify.titleSuffix")}`;
}

function getTriggerModeText(mode: FormNotifyTriggerMode): string {
  const map: Record<number, string> = {
    [FormNotifyTriggerMode.DataAdded]: t("admin.notify.mode.dataAdded"),
    [FormNotifyTriggerMode.DataChanged]: t("admin.notify.mode.dataChanged"),
    [FormNotifyTriggerMode.CustomScheduled]: t("admin.notify.mode.customScheduled"),
    [FormNotifyTriggerMode.TimeFieldScheduled]: t("admin.notify.mode.timeFieldScheduled"),
  };
  return map[mode] || t("admin.notify.unknown");
}

function getChannelText(channels: NotifyChannel): string {
  const parts: string[] = [];
  if (FlagEnum.has(channels, NotifyChannel.System)) parts.push(t("admin.notify.channels.system"));
  if (FlagEnum.has(channels, NotifyChannel.Email)) parts.push(t("admin.notify.channels.email"));
  return parts.length ? parts.join("、") : t("common.notset");
}

function getScheduleSummary(notify: FormNotify): string {
  return getNotifyScheduleSummary(notify, props.formDef, t);
}

function getRepeatSummary(notify: FormNotify): string {
  return getNotifyRepeatSummary(notify, t);
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
</style>
