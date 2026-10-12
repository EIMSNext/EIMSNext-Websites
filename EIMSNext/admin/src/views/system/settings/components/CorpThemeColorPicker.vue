<template>
  <el-popover
    :visible="visible"
    trigger="click"
    placement="bottom-start"
    :width="380"
    popper-class="corp-theme-popover"
    @update:visible="emit('update:visible', $event)"
  >
    <template #reference>
      <button
        type="button"
        class="theme-trigger"
        :disabled="disabled"
        :style="{ backgroundColor: modelValue }"
        :title="$t('admin.systemSettings.enterpriseSettings.themeColor.title')"
      />
    </template>

    <div class="corp-theme-panel">
      <div class="panel-header">
        <span class="panel-title">
          {{ $t("admin.systemSettings.enterpriseSettings.themeColor.title") }}
        </span>
        <span class="panel-tip">
          {{ $t("admin.systemSettings.enterpriseSettings.themeColor.tip") }}
        </span>
      </div>

      <ul class="color-picker-wrapper">
        <li
          v-for="color in colors"
          :key="color"
          class="theme-color-item"
          :style="{ borderColor: color === draft ? color : 'transparent' }"
          @click="draft = color"
        >
          <span class="theme-color" :style="{ background: color }" />
        </li>
      </ul>

      <div class="panel-footer">
        <el-button @click="cancel">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="saving" @click="confirm">
          {{ $t("common.ok") }}
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { CORP_THEME_COLORS } from "../themeColors";

const props = defineProps<{
  modelValue: string;
  visible: boolean;
  saving?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "confirm", color: string): void;
}>();

const colors = CORP_THEME_COLORS;
const draft = ref(props.modelValue || colors[0]);

watch(
  () => props.visible,
  (open) => {
    if (open) draft.value = props.modelValue || colors[0];
  }
);

function cancel() {
  emit("update:visible", false);
}

function confirm() {
  emit("confirm", draft.value);
}
</script>

<style scoped lang="scss">
.theme-trigger {
  width: 168px;
  height: 32px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    border-color: var(--et-color-primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 20px;
  padding: 0;
  list-style: none;
}

.theme-color-item {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.theme-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: block;
}
</style>

<style lang="scss">
.corp-theme-popover {
  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .panel-title {
    color: var(--et-text-primary);
    font-weight: 600;
    font-size: var(--et-font-size-14, 14px);
  }

  .panel-tip {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-13, 13px);
  }

  .panel-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
