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
      <div class="footer-wrapper">
        <div class="footer-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="footer-right">
          <slot name="footer-right">
            <el-button @click="cancel">{{ cancelText }}</el-button>
            <el-button type="primary" @click="save">{{ okText }}</el-button>
          </slot>
        </div>
      </div>
    </slot>
  </el-dialog>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { ref, useAttrs } from "vue";

const attrs = useAttrs();
// const ori = ref(null);
// defineExpose({ ori });

defineOptions({
  name: "EtDialog",
});
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    cancelText?: string;
    okText?: string;
    showFooter?: boolean;
  }>(),
  {
    cancelText: "取消",
    okText: "确定",
    showFooter: true,
  }
);

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const save = () => {
  emit("ok");
};
</script>
