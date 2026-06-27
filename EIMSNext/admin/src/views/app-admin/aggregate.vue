<template>
  <div class="app-admin-page">
    <div class="page-card todo-card">TODO</div>
  </div>
</template>

<style scoped lang="scss">
.app-admin-page {
  height: 100%;
  padding: var(--et-space-12);
}

.page-card {
  align-items: center;
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color-light);
  border-radius: var(--et-radius-8);
  display: flex;
  height: 100%;
  justify-content: center;
}

.todo-card {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-20);
  font-weight: 700;
}
</style>
