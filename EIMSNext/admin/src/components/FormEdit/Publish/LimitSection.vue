<template>
  <div class="limit-section">
    <h4 class="section-title">{{ t("publicpublish.submitLimit") }}</h4>

    <div class="form-group">
      <el-checkbox :model-value="enabled" @update:model-value="onAccessCodeChange">
        {{ t("publicpublish.accessCode") }}
      </el-checkbox>
      <el-input
        v-if="enabled"
        :model-value="accessCode"
        type="password"
        :placeholder="t('publicpublish.accessCodePlaceholder')"
        @update:model-value="onAccessCodeInputChange"
        @blur="markDirty"
      />
    </div>

    <div class="form-group">
      <el-checkbox :model-value="customExpireEnabled" @update:model-value="onCustomExpireChange">
        {{ t("publicpublish.customExpire") }}
      </el-checkbox>
      <span class="expire-status">{{ expireStatusText }}</span>
      <el-date-picker
        v-if="customExpireEnabled"
        :model-value="expireTime"
        type="datetime"
        value-format="x"
        @update:model-value="onExpireTimeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

const { t } = useI18n();

const props = defineProps<{
  enabled: boolean;
  accessCode: string;
  expireTime: number | null;
}>();

const emit = defineEmits<{
  "update:enabled": [v: boolean];
  "update:accessCode": [v: string];
  "update:expireTime": [v: number | null];
  change: [];
}>();

const customExpireEnabled = computed(() => props.expireTime != null);

const expireStatusText = computed(() => {
  if (!props.expireTime) return t("publicpublish.neverExpire");
  return t("publicpublish.expireUntil", { date: dayjs(props.expireTime).format("YYYY-MM-DD HH:mm") });
});

function onAccessCodeChange(v: boolean | string | number) {
  emit("update:enabled", Boolean(v));
  emit("change");
}

function onAccessCodeInputChange(v: string) {
  emit("update:accessCode", v);
  emit("change");
}

function onCustomExpireChange(v: boolean | string | number) {
  if (v) {
    const defaultExpire = Date.now() + 30 * 24 * 60 * 60 * 1000;
    emit("update:expireTime", defaultExpire);
  } else {
    emit("update:expireTime", null);
  }
  emit("change");
}

function onExpireTimeChange(v: number | null) {
  emit("update:expireTime", v);
  emit("change");
}

function markDirty() {
  emit("change");
}
</script>

<style scoped lang="scss">
.limit-section {
  border-top: 1px solid var(--et-border-color-light);
  margin: var(--et-space-16) 0;
}

.section-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-14);
  font-weight: 600;
  margin-bottom: var(--et-space-12);
}

.form-group {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--et-space-12);

  .el-input {
    flex: 1;
    min-width: 240px;
  }
}

.expire-status {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
}
</style>
