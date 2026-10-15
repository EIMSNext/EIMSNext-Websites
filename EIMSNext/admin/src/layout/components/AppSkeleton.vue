<template>
  <div class="app-skeleton" aria-hidden="true">
    <aside class="sk-side">
      <div class="sk-block sk-logo" />
      <div v-for="i in 7" :key="i" class="sk-block sk-menu" :style="{ width: i % 3 === 2 ? '72%' : '86%' }" />
    </aside>
    <section class="sk-body">
      <header class="sk-topbar">
        <div class="sk-block sk-crumb" />
        <div class="sk-topbar-right">
          <div v-for="i in 3" :key="i" class="sk-block sk-circle" />
          <div class="sk-block sk-avatar" />
        </div>
      </header>
      <div class="sk-content">
        <div class="sk-block sk-banner" />
        <div class="sk-cards">
          <div v-for="i in 6" :key="i" class="sk-block sk-card" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// portal 回跳换码/用户初始化期间的落地占位：workbench 布局骨架，替代空白等待
</script>

<style scoped>
.app-skeleton {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color-page, #f2f3f5);
}

.sk-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 216px;
  padding: 16px 14px;
  background: var(--el-bg-color, #fff);
  border-right: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.sk-logo {
  width: 120px;
  height: 34px;
  margin-bottom: 10px;
}

.sk-menu {
  height: 32px;
  border-radius: 6px;
}

.sk-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.sk-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 20px;
  background: var(--el-bg-color, #fff);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.sk-crumb {
  width: 180px;
  height: 16px;
}

.sk-topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sk-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.sk-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.sk-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow: hidden;
}

.sk-banner {
  height: 96px;
  border-radius: 8px;
}

.sk-cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}

.sk-card {
  height: 140px;
  border-radius: 8px;
}

.sk-block {
  background: var(--el-fill-color, #f0f2f5);
  animation: sk-pulse 1.6s ease-in-out infinite;
}

@keyframes sk-pulse {
  0%,
  100% {
    opacity: 0.65;
  }

  50% {
    opacity: 1;
  }
}
</style>
