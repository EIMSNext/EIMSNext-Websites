<template>
  <div class="mobile-card app-card">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.app-card {
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 4%);
}

html.dark .app-card {
  box-shadow: none;
}
</style>
