<template>
  <el-drawer
    :model-value="modelValue"
    class="et-drawer"
    :append-to-body="appendToBody"
    direction="btt"
    :with-header="false"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    size="100%"
    :show-close="false"
    :before-close="onBeforeClose"
    @update:modelValue="onUpdateModelValue"
  >
    <div class="top-nav-bar">
      <div class="nav-left">
        <slot name="top-left">
          <el-button class="back-btn" @click="close">
            <et-icon class="back-icon" icon="el-ArrowLeft" />
          </el-button>
          <slot name="title" />
        </slot>
      </div>
      <div class="nav-center">
        <slot name="top-center" />
      </div>
      <div class="nav-right">
        <slot name="top-right" />
      </div>
    </div>
    <div class="main-content">
      <slot />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
defineOptions({
  name: "EtDrawer",
});

const props = defineProps<{
  modelValue: boolean;
  appendToBody?: boolean;
  closing?: () => Promise<boolean>;
}>();

const emit = defineEmits(["update:modelValue", "close"]);

async function allowClose() {
  let allow = true;
  if (props.closing) allow = await props.closing();
  return allow;
}

// 左上角返回按钮：守卫通过后同步父组件并 emit close
async function close() {
  if (await allowClose()) {
    emit("update:modelValue", false);
    emit("close");
  }
}

// Escape 等 el-drawer 内部关闭意图：先过守卫，再把决定权交还 el-drawer。
// 拒绝时 hide(true)，visible 不变——避免"视觉已关、父组件仍持 true"的状态不一致
async function onBeforeClose(hide: (cancel?: boolean) => void) {
  if (await allowClose()) hide();
  else hide(true);
}

// el-drawer 关闭动画结束会补发 update:modelValue(false)（use-dialog afterLeave）：
// 父组件仍持 true 时代为同步 + emit close（守卫已由 close/onBeforeClose 跑过，此处不重跑）
function onUpdateModelValue(val: boolean) {
  if (!val && props.modelValue) {
    emit("update:modelValue", false);
    emit("close");
  }
}
</script>
<style lang="scss" scoped>
.top-nav-bar {
  background: var(--et-bg-container);
  display: flex;
  font-size: var(--et-font-size-16);
  height: var(--et-size-60);
  justify-content: space-between;
  left: 0;
  line-height: var(--et-line-height-30);
  padding: 0 var(--et-space-10);
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--et-z-dropdown);
  border-bottom: 1px solid var(--et-border-color-light);
  box-shadow: var(--et-shadow-sm);

  .nav-center,
  .nav-left,
  .nav-right {
    align-items: center;
    display: flex;
    flex: none;

    .back-btn {
      align-items: center;
      background: transparent;
      border: none;
      color: var(--et-text-primary);
      display: flex;
      padding: var(--et-space-0);

      &.el-button:focus,
      &.el-button:hover {
        background: var(--et-bg-hover);
        color: var(--et-text-primary);
      }

      .back-icon {
        cursor: pointer;
        font-size: var(--et-font-size-32);
        margin-right: var(--et-space-8);
        vertical-align: middle;
        width: var(--et-size-32);
      }
    }
  }

  .nav-center {
    bottom: 0;
    font-size: var(--et-font-size-18);
    left: 50%;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    z-index: var(--et-z-base);
  }
}
.main-content {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: var(--et-size-60);
}
</style>
