<template>
  <div class="realtime-settings no-drag">
    <span class="setting-label">{{ t("admin.dashboardDesigner.timeFormat") }}</span>
    <el-select
      v-model="format"
      class="format-select"
      popper-class="realtime-format-dropdown"
      @change="updateSetting"
    >
      <el-option
        v-for="option in REAL_TIME_FORMAT_OPTIONS"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { IRealTimeSetting, REAL_TIME_FORMAT_OPTIONS } from "./type";

const props = defineProps<{ modelValue: IRealTimeSetting }>();
const emit = defineEmits<{ updated: [setting: IRealTimeSetting] }>();
const { t } = useI18n();
const format = ref(props.modelValue.format);

watch(() => props.modelValue.format, (value) => {
  format.value = value;
});

const updateSetting = () => {
  emit("updated", { ...props.modelValue, format: format.value });
};
</script>

<style scoped lang="scss">
.realtime-settings {
  display: flex;
  align-items: center;
  gap: var(--et-space-10);
  width: 270px;
}

.setting-label {
  flex: 0 0 auto;
  color: var(--et-text-primary);
}

.format-select {
  flex: 1;
  min-width: 0;
}

:global(.realtime-format-dropdown) {
  min-width: 260px;
}
</style>
