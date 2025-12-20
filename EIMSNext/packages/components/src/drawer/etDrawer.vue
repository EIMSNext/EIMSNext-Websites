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
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
          </el-button>
          <slot name="title" />
        </slot>
      </div>
      <div class="nav-center">
        <slot name="top-center" />
      </div>
      <div class="nav-right"><slot name="top-right" /></div>
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
}>();

const emit = defineEmits(["update:modelValue", "close"]);

function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>
<style lang="scss">
.top-nav-bar {
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  font-size: 16px;
  height: 60px;
  justify-content: space-between;
  left: 0;
  line-height: 30px;
  padding: 0 10px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--fc-bg-color-2);
  box-shadow: unset;

  .nav-center,
  .nav-left,
  .nav-right {
    align-items: center;
    display: flex;
    flex: none;
  }

  .nav-center {
    bottom: 0;
    font-size: 18px;
    left: 50%;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    z-index: 1;
  }
}
.back-btn {
  align-items: center;
  display: flex;
  position: relative;
  padding: 0px;
  border: none;

  .back-icon {
    cursor: pointer;
    font-size: 32px;
    margin-right: 8px;
    vertical-align: middle;
    width: 32px;
  }
}
.main-content {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 60px;
}
</style>
