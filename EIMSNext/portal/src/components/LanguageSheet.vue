<template>
  <Teleport to="body">
    <Transition name="lang-sheet">
      <div v-if="show" class="lang-sheet">
        <div class="lang-sheet__mask" @click="close"></div>
        <div class="lang-sheet__panel">
          <button
            v-for="opt in options"
            :key="opt.value"
            class="lang-sheet__item"
            :class="{ active: opt.value === current }"
            type="button"
            @click="select(opt.value)"
          >
            <span>{{ opt.label }}</span>
            <svg v-if="opt.value === current" viewBox="0 0 1024 1024"><path fill="currentColor" d="M866.6 249.4c-14-14-36.7-14-50.7 0L400.2 665.1 208.1 473c-14-14-36.7-14-50.7 0s-14 36.7 0 50.7l217.1 217.1c7 7 16.2 10.5 25.4 10.5s18.3-3.5 25.4-10.5l441.4-441.4c14-14 14-36.7-.1-50.7z"/></svg>
          </button>
          <button class="lang-sheet__cancel" type="button" @click="close">{{ t("common.cancel") }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({ name: "LanguageSheet" });

defineProps<{
  show: boolean;
  current: string;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  select: [lang: string];
}>();

const { t } = useI18n();

const options = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
];

function close() {
  emit("update:show", false);
}

function select(lang: string) {
  emit("select", lang);
  close();
}
</script>

<style scoped lang="scss">
/* 对齐 mobile 端 vant action-sheet 的交互：遮罩 + 底部圆角面板滑入，
 * 移动端不用小屏下拉浮层（定位易被安全区/软键盘顶飞） */
.lang-sheet {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.lang-sheet__mask {
  background: rgb(0 0 0 / 70%);
  inset: 0;
  position: absolute;
  transition: opacity 0.25s ease;
}

.lang-sheet__panel {
  background: var(--mobile-bg-card, #fff);
  border-radius: 16px 16px 0 0;
  bottom: 0;
  box-sizing: border-box;
  left: 0;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
  position: absolute;
  transform: translateY(0);
  transition: transform 0.3s ease;
  width: 100%;
}

.lang-sheet__item {
  align-items: center;
  background: none;
  border: none;
  color: var(--mobile-text-primary, #323233);
  cursor: pointer;
  display: flex;
  font-size: 16px;
  gap: 8px;
  height: 48px;
  justify-content: center;
  padding: 0 16px;
  width: 100%;

  &.active {
    color: var(--el-color-primary, #409eff);
    font-weight: 600;
  }

  svg {
    height: 16px;
    width: 16px;
  }
}

.lang-sheet__cancel {
  background: none;
  border: none;
  color: var(--mobile-text-secondary, #969799);
  cursor: pointer;
  display: block;
  font-size: 16px;
  height: 48px;
  margin-top: 8px;
  width: 100%;

  &::before {
    border-top: 1px solid var(--mobile-border-color, rgb(0 0 0 / 6%));
    content: "";
    display: block;
    margin: 0 16px 7px;
  }
}

/* 进出场动效：遮罩淡入淡出，面板滑入滑出 */
.lang-sheet-enter-active,
.lang-sheet-leave-active {
  .lang-sheet__mask {
    transition: opacity 0.25s ease;
  }

  .lang-sheet__panel {
    transition: transform 0.3s ease;
  }
}

.lang-sheet-enter-from,
.lang-sheet-leave-to {
  .lang-sheet__mask {
    opacity: 0;
  }

  .lang-sheet__panel {
    transform: translateY(100%);
  }
}
</style>
