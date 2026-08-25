<template>
  <div class="placeholder-page">
    <div class="placeholder-card">
      <div class="placeholder-kicker">{{ $t("admin.openPlatform.reservedCapability") }}</div>
      <h1 class="placeholder-title">{{ $t("admin.openPlatform.apiLog") }}</h1>
      <p class="placeholder-text">{{ $t("admin.openPlatform.apiLogDesc") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "OpenPlatformApiLogPage" });
</script>

<style scoped lang="scss">
.placeholder-page { min-height: 100%; }

.placeholder-card {
  padding: 28px;
  border-radius: var(--et-radius-10);
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  box-shadow: var(--et-shadow-md);
}

.placeholder-kicker {
  color: var(--et-color-primary);
  font-size: 12px;
  font-weight: 700;
}

.placeholder-title {
  margin: 8px 0 0;
  font-size: 32px;
  color: var(--et-text-primary);
}

.placeholder-text {
  max-width: 720px;
  margin-top: 12px;
  color: var(--et-text-secondary);
  line-height: 1.8;
}

:global(html.dark) .placeholder-card {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
  box-shadow: var(--et-shadow-overlay);
}
</style>
