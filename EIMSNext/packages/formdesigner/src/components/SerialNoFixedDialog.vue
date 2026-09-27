<template>
  <el-dialog
    v-model="visible"
    class="_fd-serialno-dialog _fd-config-dialog"
    :title="t('com.serialno.fixedTitle')"
    destroy-on-close
    :close-on-click-modal="false"
    append-to-body
    width="420px"
  >
    <div class="_fd-serialno-row">
      <label class="_fd-serialno-label">{{ t('com.serialno.fixedValue') }}</label>
      <el-input v-model="local.value" :placeholder="t('com.serialno.fixedPlaceholder')" />
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
  name: "SerialNoFixedDialog",
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const designer = inject("designer");
    const t = designer.setupState.t;
    const visible = ref(true);
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
    return { t, visible, local, confirm };
  },
});
</script>
