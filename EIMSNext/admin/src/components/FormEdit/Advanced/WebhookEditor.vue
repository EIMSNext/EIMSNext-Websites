<template>
  <div class="api-config-pane">
    <div class="config-content">
      <div class="config-pane">
        <div class="pane-label">{{ t("common.name") }}</div>
        <div class="pane-row">
          <el-input v-model="hook.name" class="pane-row-stretch" autocomplete="new-password" />
        </div>
        <div class="pane-label">{{ t("admin.webhook.serverUrl") }}</div>
        <div class="pane-row">
          <el-input v-model="hook.url" class="pane-row-stretch" autocomplete="new-password" />
          <el-button type="primary" class="btn-test" :loading="testing" @click="testConnection">{{ t("admin.webhook.testConnection") }}</el-button>
        </div>
        <div class="pane-label">{{ t("common.secret") }}</div>
        <div class="pane-row">
          <el-input v-model="hook.secret" class="pane-row-stretch" autocomplete="new-password" />
          <el-button type="primary" class="btn-test" @click="generateSecret">{{ t("admin.webhook.generateSecret") }}</el-button>
        </div>
        <div class="pane-label">{{ t("admin.webhook.trigger") }}</div>
        <div class="pane-row">
          <div class="triggers-container">
            <div class="push-event-title">
              <span>{{ t("admin.webhook.dataEvent") }}</span>
              <span class="push-event-title-desc">{{ t("admin.webhook.dataEventDesc") }}</span>
              <el-button size="small" class="btn-sample">{{ t("admin.webhook.viewSample") }}</el-button>
            </div>
            <div class="push-event-triggers">
              <el-checkbox
                :modelValue="dataCreated"
                @change="(val) => triggerChanged(WebHookTrigger.Data_Created, val)"
              >
                {{ t("admin.data_created") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="dataUpdated"
                @change="(val) => triggerChanged(WebHookTrigger.Data_Updated, val)"
              >
                {{ t("admin.data_updated") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="dataRemoved"
                @change="(val) => triggerChanged(WebHookTrigger.Data_Removed, val)"
              >
                {{ t("admin.data_removed") }}
              </el-checkbox>
            </div>
            <div class="push-event-title">
              <span>{{ t("admin.webhook.workflowEvent") }}</span>
              <span class="push-event-title-desc">{{ t("admin.webhook.workflowEventDesc") }}</span>
              <el-button size="small" class="btn-sample">{{ t("admin.webhook.viewSample") }}</el-button>
            </div>
            <div class="push-event-triggers">
              <el-checkbox
                :modelValue="wfStatusUpdated"
                @change="(val) => triggerChanged(WebHookTrigger.WfStatus_Updated, val)"
              >
                {{ t("admin.wfstatus_updated") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="wfTaskUpdated"
                @change="(val) => triggerChanged(WebHookTrigger.WfTask_Updated, val)"
              >
                {{ t("admin.wftask_updated") }}
              </el-checkbox>
            </div>
          </div>
        </div>
        <div class="pane-label">{{ t("common.remark") }}</div>
        <div class="pane-row">
          <el-input v-model="hook.remark" type="textarea" :rows="4" class="pane-row-stretch" />
        </div>
      </div>
      <div class="btn-pane"><el-button type="primary" @click="save">{{ t("common.save") }}</el-button></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FormDef, Webhook, WebhookRequest, WebHookTrigger } from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";
import { webhookService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { cloneDeep } from "lodash-es";
import { nanoid } from "nanoid";

const { t } = useI18n();

defineOptions({
  name: "WebhookEditor",
});

const props = defineProps<{
  modelValue: Webhook;
  formDef: FormDef;
}>();

const hook = ref<Webhook>(cloneDeep(props.modelValue) || {});

const dataCreated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.Data_Created));
const dataUpdated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.Data_Updated));
const dataRemoved = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.Data_Removed));
const wfStatusUpdated = computed(() =>
  FlagEnum.has(triggers.value, WebHookTrigger.WfStatus_Updated)
);
const wfTaskUpdated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.WfTask_Updated));

const emit = defineEmits(["update:modelValue", "saved"]);
const triggers = ref(hook.value.triggers || WebHookTrigger.NotSet);
const testing = ref(false);

function initFromModelValue() {
  hook.value = cloneDeep(props.modelValue) || {};
  triggers.value = hook.value.triggers || WebHookTrigger.NotSet;
}

onMounted(() => {
  initFromModelValue();
});

const triggerChanged = (perm: WebHookTrigger, checked: any) => {
  if (checked) {
    triggers.value = FlagEnum.combine(triggers.value, perm);
  } else {
    triggers.value = FlagEnum.remove(triggers.value, perm);
  }

  hook.value.triggers = triggers.value;
  emit("update:modelValue", hook.value);
};

const generateSecret = () => {
  hook.value.secret = nanoid(24);
};

const buildWebhookRequest = (): WebhookRequest => ({
  id: hook.value.id,
  appId: props.formDef.appId,
  formId: props.formDef.id,
  name: hook.value.name,
  url: hook.value.url,
  secret: hook.value.secret,
  remark: hook.value.remark,
  triggers: hook.value.triggers,
  disabled: hook.value.disabled ?? false,
});

const resolveRequestErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object") {
    const response = "response" in error && error.response && typeof error.response === "object"
      ? error.response as Record<string, any>
      : undefined;
    const data = response?.data && typeof response.data === "object"
      ? response.data as Record<string, any>
      : undefined;

    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }

    if (typeof data?.Message === "string" && data.Message) {
      return data.Message;
    }

    if ("message" in error && typeof error.message === "string" && error.message) {
      return error.message;
    }
  }

  return fallback;
};

const testConnection = async () => {
  if (!hook.value?.url) {
    ElMessage.error(t("admin.webhook.serverUrlRequired"));
    return;
  }

  try {
    testing.value = true;
    const result = await webhookService.test<{ success: boolean; message?: string }>(buildWebhookRequest());
    if (result?.success) {
      ElMessage.success(result.message || t("admin.webhook.testSuccess"));
      return;
    }

    ElMessage.error(result?.message || t("admin.webhook.testFailed"));
  } catch (error) {
    ElMessage.error(resolveRequestErrorMessage(error, t("admin.webhook.testFailed")));
  } finally {
    testing.value = false;
  }
};

const save = async () => {
  if (!hook.value) return;

  const newHook = buildWebhookRequest();

  if (hook.value.id) {
    hook.value = await webhookService.patch<Webhook>(hook.value.id, newHook);
  } else {
    hook.value = await webhookService.post<Webhook>(newHook);
  }

  emit("saved", hook.value);
};
</script>
<style lang="scss" scoped>
.api-config-pane {
  background: var(--et-bg-page);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  .config-content {
    background: var(--et-bg-container);
    border-radius: var(--et-radius-6);
    bottom: 0;
    left: 0;
    margin: var(--et-space-20) auto;
    position: absolute;
    right: 0;
    top: 0;
    width: var(--et-size-700);

    .config-pane {
      bottom: var(--et-size-56);
      left: 0;
      overflow: auto;
      padding: 0 var(--et-space-30) var(--et-space-10);
      position: absolute;
      right: 0;
      top: 0;

      .pane-label {
        color: var(--et-text-secondary);
        line-height: var(--et-line-height-20);
        margin-top: var(--et-space-20);
      }

      .pane-row {
        align-items: center;
        display: flex;
        margin-top: var(--et-space-8);

        .pane-row-stretch {
          flex: 1 1 auto;
          min-width: 0;
        }

        .btn-test {
          width: var(--et-size-150);
          min-width: var(--et-size-150);
          margin-left: var(--et-space-20);
        }

        .triggers-container {
          display: inline-block;
          max-width: 100%;

          .push-event-title {
            margin-bottom: var(--et-space-8);

            .push-event-title-desc {
              font-size: var(--et-font-size-12);
              color: var(--et-text-secondary);
              margin: 0 var(--et-space-8);
            }

            .btn-sample {
              color: var(--et-color-primary);
              border: none;
              margin-left: var(--et-space-5);
            }
          }

          .push-event-triggers {
            display: flex;
            flex-direction: column;
            margin-bottom: var(--et-space-12);
          }
        }
      }
    }

    .btn-pane {
      align-items: center;
      border-top: 1px solid var(--et-border-color);
      bottom: 0;
      display: flex;
      height: var(--et-size-56);
      justify-content: center;
      left: 0;
      position: absolute;
      right: 0;
    }
  }
}
</style>
