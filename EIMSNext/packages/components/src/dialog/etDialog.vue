<template>
  <el-dialog
    class="et-dialog"
    :model-value="modelValue"
    v-bind="attrs"
    ref="ori"
    @close="cancel"
  >
    <slot></slot>
    <slot name="header"></slot>
    <slot name="footer" v-if="showFooter">
      <div class="el-dialog__footer footer-wrapper">
        <div class="footer-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="footer-right">
          <slot name="footer-right">
            <el-button @click="cancel">{{ cancelLabel }}</el-button>
            <el-button type="primary" @click="save">{{ okLabel }}</el-button>
          </slot>
        </div>
      </div>
    </slot>
  </el-dialog>
</template>
<script lang="ts" setup>
import "./style/index.scss";
import { computed, ref, useAttrs } from "vue";
import { useI18n } from "vue-i18n";

const attrs = useAttrs();
// const ori = ref(null);
// defineExpose({ ori });

defineOptions({
  name: "EtDialog",
});
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    cancelText?: string;
    okText?: string;
    showFooter?: boolean;
  }>(),
  {
    cancelText: "",
    okText: "",
    showFooter: true,
  },
);

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);

const cancelLabel = computed(() => props.cancelText || t("common.cancel"));
const okLabel = computed(() => props.okText || t("common.ok"));
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const save = () => {
  emit("ok");
};
</script>
