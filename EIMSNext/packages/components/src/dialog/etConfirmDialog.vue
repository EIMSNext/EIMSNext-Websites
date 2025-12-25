<template>
  <el-dialog class="et-confirm-dialog" ref="ori" :model-value="modelValue" v-bind="attrs" :show-close="false"
    :append-to-body="true" :destroy-on-close="true" @close="cancel">
    <div class="confirm-content">
      <el-icon class="msg-icon" :class="{
        error: icon == MessageIcon.Error,
        warning: icon == MessageIcon.Warning,
        info: icon == MessageIcon.Info || icon == MessageIcon.Question,
      }" :color="iconColor">
        <InfoFilled v-if="icon == MessageIcon.Info" />
        <QuestionFilled v-if="icon == MessageIcon.Question" />
        <WarningFilled v-if="icon == MessageIcon.Warning" />
        <CircleCloseFilled v-if="icon == MessageIcon.Error" />
      </el-icon>
      <div class="confirm-body">
        <div class="title">{{ titleRef }}</div>
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
              cancelTextRef
            }}</el-button>
            <el-button v-if="showNoSave" @click="save(false)">{{
              noSaveTextRef
            }}</el-button>
            <el-button type="primary" @click="save(true)">{{
              okTextRef
            }}</el-button>
          </slot>
        </div>
      </div>
    </slot>
  </el-dialog>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { computed, onMounted, ref, useAttrs } from "vue";
import { MessageIcon } from "./type";
//下面的导入对于函数式调用是必须的
import { ElDialog, ElIcon, ElButton } from "element-plus";
import {
  InfoFilled,
  QuestionFilled,
  WarningFilled,
  CircleCloseFilled,
} from "@element-plus/icons-vue";
import { useLocale } from "element-plus";
const { t } = useLocale()


const defaultTitle = computed(() => t("common.message.editConfirm_Title"))
const defaultCancelText = computed(() => t("common.cancel"))
const defaultOKText = computed(() => t("common.ok"))
const defaultNoSaveText = computed(() => t("common.noSave"))

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
    showCancel: true,
    showNoSave: true,
  }
);

const titleRef = computed(() => props.title || t("common.message.editConfirm_Title"));
const cancelTextRef = computed(() => props.cancelText || t("common.cancel"));
const okTextRef = computed(() => props.okText || t("common.ok"));
const noSaveTextRef = computed(() => props.noSaveText || t("common.noSave"));

const getIconClass = computed(() => {
  let iconCls =
    props.icon == MessageIcon.Error
      ? "error"
      : props.icon == MessageIcon.Warning
        ? "warning"
        : "info";

  return `msg-icon ${iconCls}`;
});

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const save = (save: boolean) => {
  emit("ok", save);
};
</script>
