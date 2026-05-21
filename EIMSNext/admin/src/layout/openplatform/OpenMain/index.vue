<template>
  <section class="open-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "OpenPlatformMain" });
</script>

<style scoped lang="scss">
.open-main {
  min-height: calc(100vh - var(--et-size-50));
}
</style>
