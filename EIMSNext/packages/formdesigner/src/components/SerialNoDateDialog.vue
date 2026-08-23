<template>
  <el-dialog
    v-model="visible"
    class="_fd-serialno-dialog _fd-config-dialog"
    :title="t('com.serialno.dateFormatTitle')"
    destroy-on-close
    :close-on-click-modal="false"
    append-to-body
    width="440px"
  >
    <el-radio-group v-model="mode" class="_fd-serialno-format-group">
      <div class="_fd-serialno-format-block">
        <el-radio value="preset" class="_fd-serialno-format-radio">
          {{ t('com.serialno.presetFormat') }}
        </el-radio>
        <el-select
          v-model="presetValue"
          :disabled="mode !== 'preset'"
          size="default"
          class="_fd-serialno-format-select"
        >
          <el-option
            v-for="opt in presetOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
      <div class="_fd-serialno-format-block">
        <el-radio value="custom" class="_fd-serialno-format-radio">
          {{ t('com.serialno.customFormat') }}
        </el-radio>
        <div class="_fd-serialno-format-control-wrap">
          <el-input
            v-model="customValue"
            :disabled="mode !== 'custom'"
            size="default"
            class="_fd-serialno-format-input"
            :placeholder="t('com.serialno.formatPlaceholder')"
          />
          <div class="_fd-serialno-format-preview">
            {{ t('com.serialno.formatPreview', { value: previewText || '—' }) }}
          </div>
        </div>
      </div>
    </el-radio-group>
    <template #footer>
      <el-button @click="visible = false">{{ t('props.cancel') }}</el-button>
      <el-button type="primary" @click="confirm">{{ t('props.ok') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch, inject } from "vue";
import dayjs from "dayjs";

export default defineComponent({
  name: "SerialNoDateDialog",
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const designer = inject("designer");
    const t = designer.setupState.t;
    const visible = ref(true);

    const presetOptions = [
      { label: "2015", value: "yyyy" },
      { label: "201501", value: "yyyyMM" },
      { label: "20150101", value: "yyyyMMdd" },
      { label: "2015-01", value: "yyyy-MM" },
      { label: "2015-01-01", value: "yyyy-MM-dd" },
    ];
    const isPreset = (v) => presetOptions.some((o) => o.value === v);
    const toDayjsFormat = (fmt) =>
      (fmt || "")
        .replace(/yyyy/g, "YYYY")
        .replace(/yy/g, "YY")
        .replace(/dd/g, "DD");

    const local = ref({ ...props.modelValue });
    watch(
      () => props.modelValue,
      (v) => {
        local.value = { ...v };
      }
    );

    const mode = ref(isPreset(local.value.format) ? "preset" : "custom");
    const presetValue = ref(isPreset(local.value.format) ? local.value.format : "yyyyMMdd");
    const customValue = ref(mode.value === "custom" ? local.value.format : "yyyyMMdd");

    const previewText = computed(() => {
      const fmt = mode.value === "preset" ? presetValue.value : customValue.value;
      if (!fmt) return "";
      try {
        return dayjs("2015-01-01").format(toDayjsFormat(fmt));
      } catch (e) {
        return fmt;
      }
    });

    function confirm() {
      const finalFmt = mode.value === "preset" ? presetValue.value : customValue.value;
      emit("update", { ...local.value, format: finalFmt });
      visible.value = false;
    }

    return {
      t,
      visible,
      presetOptions,
      mode,
      presetValue,
      customValue,
      previewText,
      confirm,
    };
  },
});
</script>

<style>
._fd-serialno-dialog ._fd-serialno-format-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  margin: 0 20px 10px 20px;
}
._fd-serialno-dialog ._fd-serialno-format-block {
  display: grid;
  grid-template-columns: 20px 1fr;
  column-gap: 8px;
  row-gap: 6px;
}
._fd-serialno-dialog ._fd-serialno-format-radio {
  grid-column: 1 / 3;
  margin-right: 0;
}
._fd-serialno-dialog ._fd-serialno-format-select,
._fd-serialno-dialog ._fd-serialno-format-input {
  grid-column: 2;
  width: 200px;
}
._fd-serialno-dialog ._fd-serialno-format-control-wrap {
  grid-column: 2;
  display: flex;
  flex-direction: column;
}
._fd-serialno-dialog ._fd-serialno-format-preview {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
