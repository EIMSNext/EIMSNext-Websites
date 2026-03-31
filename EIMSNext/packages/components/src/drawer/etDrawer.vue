<template>
  <el-drawer
    :model-value="modelValue"
    :append-to-body="appendToBody"
    direction="btt"
    :with-header="false"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    size="100%"
    :show-close="false"
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

async function close() {
  let allow = true;
  if (props.closing) allow = await props.closing();

  if (allow) {
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
      display: flex;
      position: relative;
      padding: var(--et-space-0);
      border: none;
      color: var(--et-text-primary);

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
