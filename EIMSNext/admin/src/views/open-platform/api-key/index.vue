<template>
  <div class="placeholder-page">
    <div class="placeholder-card">
      <div class="placeholder-kicker">预留能力</div>
      <h1 class="placeholder-title">API Key</h1>
      <p class="placeholder-text">后续将在此接入开放平台密钥管理，统一查看密钥、权限范围、更新时间和调用约束。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "OpenPlatformApiKeyPage" });
</script>

<style scoped lang="scss">
.placeholder-page { min-height: 100%; }

.placeholder-card {
  padding: 28px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.placeholder-kicker {
  color: var(--et-color-primary);
  font-size: 12px;
  font-weight: 700;
}

.placeholder-title {
  margin: 8px 0 0;
  font-size: 32px;
}

.placeholder-text {
  max-width: 720px;
  margin-top: 12px;
  color: var(--et-text-secondary);
  line-height: 1.8;
}

:global(html.dark) .placeholder-card {
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 24px 54px rgba(2, 6, 23, 0.42);
}
</style>
