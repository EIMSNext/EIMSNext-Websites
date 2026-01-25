<template>
  <div class="navbar">
    <div class="navbar__left">
      <!--  -->
      <et-icon icon="el-icon-Grid" size="24"></et-icon>
    </div>
    <!-- 导航栏右侧 -->
    <NavbarRight />
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: $navbar-height;
  background: var(--el-bg-color);

  &__left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 40px;
    height: 50px;
    line-height: 50px;
    color: var(--et-color-text);
    cursor: pointer;
  }
}
</style>
