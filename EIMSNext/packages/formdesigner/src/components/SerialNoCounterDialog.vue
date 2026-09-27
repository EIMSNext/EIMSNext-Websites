<template>
  <el-dialog
    v-model="visible"
    class="_fd-serialno-dialog _fd-config-dialog"
    :title="t('com.serialno.counterTitle')"
    destroy-on-close
    :close-on-click-modal="false"
    append-to-body
    width="420px"
  >
    <div class="_fd-serialno-row">
      <label class="_fd-serialno-label">{{ t('com.serialno.digits') }}</label>
      <el-input-number
        v-model="local.digits"
        :min="1"
        :max="10"
        :step="1"
        controls-position="right"
      />
    </div>
    <div class="_fd-serialno-row">
      <label class="_fd-serialno-label">{{ t('com.serialno.padZero') }}</label>
      <el-switch v-model="local.padZero" />
    </div>
    <div class="_fd-serialno-row">
      <label class="_fd-serialno-label">{{ t('com.serialno.resetCycle') }}</label>
      <el-select v-model="local.reset" style="width: 100%">
        <el-option
          v-for="opt in resetOptions"
          :key="opt.value"
          :label="t(opt.label)"
          :value="opt.value"
        />
      </el-select>
    </div>
    <div class="_fd-serialno-row">
      <label class="_fd-serialno-label">{{ t('com.serialno.start') }}</label>
      <el-input-number
        v-model="local.start"
        :min="0"
        controls-position="right"
      />
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ t('props.cancel') }}</el-button>
      <el-button type="primary" @click="confirm">{{ t('props.ok') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, watch, inject } from "vue";

export default defineComponent({
  name: "SerialNoCounterDialog",
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const designer = inject("designer");
    const t = designer.setupState.t;
    const visible = ref(true);
    const resetOptions = [
      { value: "never", label: "com.serialno.reset.never" },
      { value: "day", label: "com.serialno.reset.day" },
      { value: "month", label: "com.serialno.reset.month" },
      { value: "year", label: "com.serialno.reset.year" },
    ];
    const local = ref({ ...props.modelValue });
    watch(
      () => props.modelValue,
      (v) => {
        local.value = { ...v };
      }
    );
    function confirm() {
      emit("update", { ...local.value });
      visible.value = false;
    }
    return { t, visible, resetOptions, local, confirm };
  },
});
</script>

<style>
._fd-serialno-dialog ._fd-serialno-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}
._fd-serialno-dialog ._fd-serialno-label {
  flex: 0 0 80px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
._fd-serialno-dialog ._fd-serialno-row .el-input-number,
._fd-serialno-dialog ._fd-serialno-row .el-select {
  flex: 1;
}
</style>
