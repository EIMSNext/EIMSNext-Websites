<template>
  <div class="navbar">
    <div class="navbar__left">
      <!--  -->
      <et-icon icon="el-Grid" size="24"></et-icon>
    </div>
    <!-- 导航栏右侧 -->
    <NavbarRight />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: $navbar-height;
  background: var(--et-bg-container);

  &__left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    min-width: var(--et-size-40);
    height: var(--et-size-50);
    line-height: var(--et-size-50);
    color: var(--et-text-primary);
    cursor: pointer;
  }
}
</style>
