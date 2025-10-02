<template>
  <el-dialog
    class="et-confirm-dialog"
    ref="ori"
    :model-value="modelValue"
    v-bind="attrs"
    :show-close="false"
    :append-to-body="true"
    :destroy-on-close="true"
    @close="cancel"
  >
    <div class="confirm-content">
      <el-icon
        class="msg-icon"
        :class="{
          error: icon == MessageIcon.Error,
          warning: icon == MessageIcon.Warning,
          info: icon == MessageIcon.Info || icon == MessageIcon.Question,
        }"
        :color="iconColor"
      >
        <InfoFilled v-if="icon == MessageIcon.Info" />
        <QuestionFilled v-if="icon == MessageIcon.Question" />
        <WarningFilled v-if="icon == MessageIcon.Warning" />
        <CircleCloseFilled v-if="icon == MessageIcon.Error" />
      </el-icon>
      <div class="confirm-body">
        <div class="title">{{ title }}</div>
        <div class="message">
          <slot></slot>
        </div>
      </div>
    </div>
    <slot name="footer">
      <div class="footer-wrapper">
        <div class="footer-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="footer-right">
          <slot name="footer-right">
            <el-button v-if="showCancel" @click="cancel">{{
              cancelText
            }}</el-button>
            <el-button v-if="showNoSave" @click="save(false)">{{
              noSaveText
            }}</el-button>
            <el-button type="primary" @click="save(true)">{{
              okText
            }}</el-button>
          </slot>
        </div>
      </div>
    </slot>
  </el-dialog>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { ref, useAttrs } from "vue";
import { MessageIcon } from "./type";

const attrs = useAttrs();
// const ori = ref(null);
// defineExpose({ ori });

defineOptions({
  name: "EtConfirmDialog",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    icon?: MessageIcon;
    title?: string;
    showCancel?: boolean;
    showNoSave?: boolean;
    cancelText?: string;
    noSaveText?: string;
    okText?: string;
    iconColor?: string;
  }>(),
  {
    icon: MessageIcon.Question,
    title: "数据有修改，是否保存？",
    showCancel: true,
    showNoSave: true,
    cancelText: "取消",
    noSaveText: "不保存",
    okText: "保存并继续",
  }
);

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const save = (save: boolean) => {
  emit("ok", save);
};
</script>
