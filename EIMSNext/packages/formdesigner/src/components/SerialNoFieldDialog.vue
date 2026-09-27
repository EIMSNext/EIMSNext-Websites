<template>
  <el-dialog
    v-model="visible"
    class="_fd-serialno-dialog _fd-config-dialog"
    :title="t('com.serialno.fieldTitle')"
    destroy-on-close
    :close-on-click-modal="false"
    append-to-body
    width="440px"
  >
    <div class="_fd-serialno-row _fd-serialno-row--col">
      <label class="_fd-serialno-label">{{ t('com.serialno.selectField') }}</label>
      <el-tree-select
        v-model="local.field"
        :data="fieldOptions"
        :props="treeProps"
        check-strictly
        :render-after-expand="false"
        default-expand-all
        clearable
        filterable
        style="width: 100%"
        :placeholder="t('com.serialno.fieldPlaceholder')"
      />
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ t('props.cancel') }}</el-button>
      <el-button type="primary" @click="confirm">{{ t('props.ok') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch, inject } from "vue";

export default defineComponent({
  name: "SerialNoFieldDialog",
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

    const activeField = computed(() => designer.setupState.activeRule?.field);
    const fieldOptions = computed(() => {
      const source = designer.setupState.fieldList || [];
      return source
        .filter((item) => {
          const value = item.value ?? item.field;
          return value && value !== activeField.value && String(value).indexOf(">") === -1;
        })
        .map((item) => ({
          ...item,
          children: undefined,
        }));
    });

    const treeProps = {
      value: "value",
      label: "label",
      children: "children",
    };

    function confirm() {
      emit("update", { ...local.value });
      visible.value = false;
    }
    return { t, visible, local, fieldOptions, treeProps, confirm };
  },
});
</script>

<style>
._fd-serialno-dialog ._fd-serialno-row--col {
  align-items: flex-start;
  flex-direction: column;
  gap: 6px;
}
._fd-serialno-dialog ._fd-serialno-row--col ._fd-serialno-label {
  flex: none;
}
</style>
