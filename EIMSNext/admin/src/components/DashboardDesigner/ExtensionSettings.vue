<template>
  <div class="dashboard-settings-page">
    <section class="settings-card">
      <div class="settings-card__header">
        <strong>{{ t("admin.dashboard.autoRefresh") }}</strong>
        <span>{{ t("admin.dashboard.autoRefreshDesc") }}</span>
      </div>
      <div class="settings-card__body">
        <el-switch v-model="localDash.autoRefreshEnabled" @change="saveDashboard" />
        <div class="field-block">
          <div class="field-label">{{ t("admin.dashboard.refreshInterval") }}</div>
          <el-select
            v-model="localDash.autoRefreshIntervalMinutes"
            class="short-control"
            :disabled="!localDash.autoRefreshEnabled"
            @change="saveDashboard"
          >
            <el-option v-for="item in refreshOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
          <div class="field-tip">{{ t("admin.dashboard.autoRefreshFullscreenOnly") }}</div>
        </div>
      </div>
    </section>

    <section class="settings-card">
      <div class="settings-card__header">
        <strong>{{ t("admin.notify.mode.customScheduledNotify") }}</strong>
        <span>{{ t("admin.dashboard.notifyDesc") }}</span>
      </div>
      <div class="settings-card__body">
        <el-switch v-model="notifyEnabled" @change="saveNotify" />
        <div class="field-block">
          <div class="field-label">{{ t("admin.notify.time") }}</div>
          <TriggerTimeSettings
            v-model="scheduleSettings"
            class="notify-time-settings"
            :field-options="emptyFieldOptions"
            :allow-mode-switch="false"
          />
        </div>
        <div class="field-block">
          <div class="field-label">{{ t("admin.notify.notifier") }}</div>
          <SelectedTags v-model="notifierTags" :editable="true" class="member-box" @editTag="showMemberDialog = true" />
        </div>
        <div class="field-block">
          <div class="field-label">{{ t("admin.notify.text") }}</div>
          <el-input v-model="notifyText" maxlength="200" />
        </div>
        <div class="field-block">
          <div class="field-label">{{ t("admin.notify.channel") }}</div>
          <el-checkbox :model-value="hasChannel(NotifyChannel.System)" @change="toggleChannel(NotifyChannel.System, $event)">
            {{ t("admin.notify.channels.system") }}
          </el-checkbox>
          <el-checkbox :model-value="hasChannel(NotifyChannel.Email)" @change="toggleChannel(NotifyChannel.Email, $event)">
            {{ t("admin.notify.channels.email") }}
          </el-checkbox>
        </div>
        <el-button type="primary" @click="saveNotify">{{ t("common.save") }}</el-button>
      </div>
    </section>

    <MemberSelectDialog
      v-model="showMemberDialog"
      :tags="notifierTags"
      :member-options="memberOptions"
      @ok="finishSelectNotifier"
    />
  </div>
</template>

<script setup lang="ts">
import {
  DashboardDef,
  FormNotify,
  FormNotifyRequest,
  FormNotifyTriggerMode,
  NotifyChannel,
  NotifyTargetType,
  TimerOffsetDirection,
  TimerRepeatType,
} from "@eimsnext/models";
import {
  IApprovalCandidate,
  ISelectedTag,
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
  TriggerTimeMode,
  TriggerTimeSettings,
  TriggerTimeSettingsValue,
  convertCandidateToTags,
  convertTagsToCandidates,
  normalizeTriggerTimeSettings,
} from "@eimsnext/components";
import { dashboardDefService, formNotifyService } from "@eimsnext/services";
import { FlagEnum } from "@eimsnext/utils";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  dashDef: DashboardDef;
}>();

const emit = defineEmits<{
  (e: "updated", value: DashboardDef): void;
}>();

const { t } = useI18n();

const refreshOptions = computed(() => [
  { label: `1${t("admin.notifyTime.minute")}`, value: 1 },
  { label: `3${t("admin.notifyTime.minute")}`, value: 3 },
  { label: `5${t("admin.notifyTime.minute")}`, value: 5 },
  { label: `10${t("admin.notifyTime.minute")}`, value: 10 },
  { label: `15${t("admin.notifyTime.minute")}`, value: 15 },
  { label: `30${t("admin.notifyTime.minute")}`, value: 30 },
  { label: `1${t("admin.notifyTime.hour")}`, value: 60 },
  { label: `3${t("admin.notifyTime.hour")}`, value: 180 },
]);
const emptyFieldOptions: never[] = [];

const localDash = ref<DashboardDef>({ ...props.dashDef, autoRefreshIntervalMinutes: props.dashDef.autoRefreshIntervalMinutes || 15 });
const notify = ref<FormNotify>();
const notifyEnabled = ref(false);
const notifyText = ref(t("admin.notify.dueText"));
const notifierTags = ref<ISelectedTag[]>([]);
const showMemberDialog = ref(false);
const channels = ref<NotifyChannel>(NotifyChannel.System);
const scheduleSettings = ref<TriggerTimeSettingsValue>(
  normalizeTriggerTimeSettings({
    mode: TriggerTimeMode.Custom,
    repeatType: TimerRepeatType.Once,
    custom: { startTime: Date.now() },
  }, []),
);

const memberOptions = {
  showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
  cascadedDept: true,
  showCascade: true,
};

watch(
  () => props.dashDef,
  (value) => {
    localDash.value = { ...value, autoRefreshIntervalMinutes: value.autoRefreshIntervalMinutes || 15 };
    loadNotify();
  },
  { immediate: true },
);

function hasChannel(channel: NotifyChannel) {
  return FlagEnum.has(channels.value, channel);
}

function toggleChannel(channel: NotifyChannel, checked: string | number | boolean) {
  channels.value = Boolean(checked)
    ? FlagEnum.add(channels.value, channel)
    : FlagEnum.remove(channels.value, channel);
}

async function saveDashboard() {
  const updated = await dashboardDefService.patch<DashboardDef>(localDash.value.id, {
    id: localDash.value.id,
    autoRefreshEnabled: localDash.value.autoRefreshEnabled,
    autoRefreshIntervalMinutes: localDash.value.autoRefreshIntervalMinutes || 15,
  });
  localDash.value = updated;
  emit("updated", updated);
}

async function loadNotify() {
  if (!props.dashDef.id) return;

  const items = await formNotifyService.query<FormNotify>(
    `$filter=appId eq '${props.dashDef.appId}' and formId eq '${props.dashDef.id}'&$top=20`
  );
  notify.value = items.find((item) => String(item.targetType ?? NotifyTargetType.Form) === NotifyTargetType.Dashboard);
  applyNotify(notify.value);
}

function applyNotify(item?: FormNotify) {
  notifyEnabled.value = item ? !item.disabled : false;
  notifyText.value = item?.notifyText || t("admin.notify.dueText");
  channels.value = item?.channels ?? NotifyChannel.System;
  scheduleSettings.value = normalizeTriggerTimeSettings({
    mode: TriggerTimeMode.Custom,
    repeatType: item?.repeatType ?? TimerRepeatType.Once,
    repeatConfig: item?.repeatConfig,
    custom: {
      startTime: item?.startTime ?? Date.now(),
      endTime: item?.endTime,
    },
  }, []);

  try {
    const candidates: IApprovalCandidate[] = JSON.parse(item?.notifiers || "[]");
    notifierTags.value = candidates.flatMap((candidate) => convertCandidateToTags(candidate));
  } catch {
    notifierTags.value = [];
  }
}

function finishSelectNotifier(tags: ISelectedTag[]) {
  notifierTags.value = tags;
  showMemberDialog.value = false;
}

async function saveNotify() {
  const normalized = normalizeTriggerTimeSettings(scheduleSettings.value, []);
  const request: FormNotifyRequest = {
    id: notify.value?.id || "",
    appId: props.dashDef.appId,
    formId: props.dashDef.id,
    targetType: NotifyTargetType.Dashboard,
    triggerMode: FormNotifyTriggerMode.CustomScheduled,
    startTime: normalized.custom?.startTime,
    endTime: normalized.custom?.endTime,
    repeatType: normalized.repeatType,
    repeatConfig: normalized.repeatConfig,
    direction: TimerOffsetDirection.At,
    notifyText: notifyText.value,
    notifiers: JSON.stringify(convertTagsToCandidates(notifierTags.value)),
    channels: channels.value,
    disabled: !notifyEnabled.value,
  };

  notify.value = notify.value?.id
    ? await formNotifyService.put<FormNotify>(notify.value.id, request)
    : await formNotifyService.post<FormNotify>(request);
  applyNotify(notify.value);
  ElMessage.success(t("common.saveSuccess"));
}
</script>

<style scoped lang="scss">
.dashboard-settings-page {
  background: var(--et-bg-page);
  height: 100%;
  overflow: auto;
  padding: var(--et-space-20) 0;
}

.settings-card {
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color-light);
  box-shadow: var(--et-shadow-light);
  margin: 0 auto var(--et-space-16);
  width: 820px;
}

.settings-card__header {
  align-items: center;
  border-bottom: 1px solid var(--et-border-color-light);
  display: flex;
  gap: var(--et-space-12);
  min-height: var(--et-size-48);
  padding: 0 var(--et-space-20);

  strong {
    color: var(--et-text-primary);
  }

  span {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-13);
  }
}

.settings-card__body {
  padding: var(--et-space-20);
}

.field-block {
  margin-top: var(--et-space-14);
}

.field-label {
  color: var(--et-text-primary);
  font-weight: 600;
  margin-bottom: var(--et-space-8);
}

.field-tip {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  margin-top: var(--et-space-8);
}

.short-control {
  width: 280px;
}

.notify-time-settings {
  max-width: 620px;
}

.member-box {
  border: 1px dashed var(--et-border-color);
  min-height: var(--et-size-86);
  padding: var(--et-space-12);
}
</style>
