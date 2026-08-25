<template>
  <et-dialog
    :model-value="modelValue"
    class="http-sample-dialog"
    :title="t('eventFlow.httpSampleDialog.title')"
    :show-footer="false"
    width="520px"
    @cancel="onCancel"
  >
    <div v-if="phase === 'loading'" class="phase phase-loading">
      <div class="spinner">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <div class="tip">
        <span>{{ loadingTip }}</span>
        <a class="help-link" :href="helpDocUrl" target="_blank">{{ t("common.helpDoc") }}</a>
      </div>
    </div>

    <div v-else-if="phase === 'success'" class="phase phase-success">
      <div class="check">
        <el-icon><CircleCheckFilled /></el-icon>
      </div>
      <div class="success-text">{{ t("common.success") }}</div>
    </div>

    <div class="footer">
      <el-button v-if="phase === 'success'" type="primary" @click="onViewSample">
        {{ t("eventFlow.httpSampleDialog.viewSample") }}
      </el-button>
      <el-button v-else @click="onCancel">
        {{ t("common.cancel") }}
      </el-button>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { CircleCheckFilled, Loading } from "@element-plus/icons-vue";
import { useLocale } from "element-plus";
import { EtDialog } from "@/dialog";
import { eventFlowSampleService, EventFlowHttpSampleResult } from "@eimsnext/services";

defineOptions({
  name: "HttpSampleDialog",
});

const { t } = useLocale();

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    eventFlowId?: string;
    corpId?: string;
    hookUrl: string;
    helpDocUrl?: string;
  }>(),
  {
    helpDocUrl: "https://help.example.com/eventflow/http-trigger",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  cancel: [];
  captured: [result: EventFlowHttpSampleResult];
}>();

type Phase = "loading" | "success";

const phase = ref<Phase>("loading");
let pollTimer: number | null = null;

const POLL_INTERVAL = 2000;

const loadingTip = computed(() => {
  return t("eventFlow.httpSampleDialog.loading").replace("{0}", props.hookUrl);
});

function clearPoll() {
  if (pollTimer != null) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function scheduleNextPoll() {
  clearPoll();
  pollTimer = window.setTimeout(pollSample, POLL_INTERVAL);
}

function pollSample() {
  if (!props.eventFlowId) {
    emit("update:modelValue", false);
    return;
  }

  eventFlowSampleService
    .getHttpSample(props.eventFlowId, props.corpId ?? "")
    .then((res) => {
      if (res?.hasSample && res.sampleFields) {
        phase.value = "success";
        emit("captured", res);
        clearPoll();
      } else {
        scheduleNextPoll();
      }
    })
    .catch(() => {
      scheduleNextPoll();
    });
}

function startPolling() {
  phase.value = "loading";
  clearPoll();
  pollSample();
}

function onCancel() {
  clearPoll();
  emit("update:modelValue", false);
  emit("cancel");
}

function onViewSample() {
  clearPoll();
  emit("update:modelValue", false);
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      startPolling();
    } else {
      clearPoll();
    }
  },
);

onBeforeUnmount(() => {
  clearPoll();
});
</script>

<style lang="scss" scoped>
.http-sample-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.phase {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--et-space-20);
  padding: var(--et-space-30) var(--et-space-20) var(--et-space-20);
}

.phase-loading {
  .spinner {
    align-items: center;
    display: flex;
    height: var(--et-size-80);
    justify-content: center;

    .el-icon {
      color: var(--et-color-primary);
      font-size: var(--et-font-size-32);
    }
  }

  .tip {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-14);
    line-height: var(--et-line-height-22);
    text-align: center;

    .hook-url {
      color: var(--et-color-primary);
      margin: 0 var(--et-space-2);
      text-decoration: none;
    }

    .help-link {
      color: var(--et-color-primary);
      margin-left: var(--et-space-8);
      text-decoration: none;
    }
  }
}

.phase-success {
  padding-top: var(--et-space-40);
  padding-bottom: var(--et-space-30);

  .check {
    align-items: center;
    background: var(--et-bg-success-soft);
    border-radius: var(--et-radius-round);
    display: flex;
    height: var(--et-size-72);
    justify-content: center;
    width: var(--et-size-72);

    .el-icon {
      color: var(--et-color-success);
      font-size: var(--et-font-size-36);
    }
  }

  .success-text {
    color: var(--et-text-primary);
    font-size: var(--et-font-size-16);
    font-weight: 600;
  }
}

.footer {
  align-items: center;
  border-top: 1px solid var(--et-border-color);
  display: flex;
  height: var(--et-size-56);
  justify-content: flex-end;
  padding: 0 var(--et-space-20);
}
</style>
