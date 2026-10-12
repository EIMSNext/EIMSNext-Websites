<template>
  <div class="settings-page">
    <template v-if="kind === 'version'">
      <VersionInfo />
    </template>
    <template v-else-if="kind === 'enterprise'">
      <h2>{{ $t("admin.enterprise.basicInfo") }}</h2>
      <div class="enterprise-panel">
        <EnterpriseInfo />
      </div>
    </template>
    <template v-else-if="kind === 'enterprise-settings'">
      <EnterpriseSettings />
    </template>
    <template v-else-if="kind === 'product-settings'">
      <ProductSettings />
    </template>
    <template v-else>
      <h2>{{ $t("route.system") }}</h2>
      <div class="empty">暂无内容</div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import EnterpriseInfo from "./EnterpriseInfo.vue";
import EnterpriseSettings from "./EnterpriseSettings.vue";
import ProductSettings from "./ProductSettings.vue";
import VersionInfo from "./VersionInfo.vue";
const route = useRoute();
const kind = computed(() => String(route.path.split("/").pop()));
</script>
<style scoped lang="scss">
.settings-page{background:var(--et-bg-overlay,var(--et-bg-page));min-height:100%;padding:4px 16px;color:var(--et-text-color-primary)}h2{font-size:17px;margin:14px 0 22px;border-left:4px solid var(--et-color-primary);padding-left:10px}.enterprise-panel{background:var(--et-bg-base);border-radius:8px;padding:8px 16px 0}.empty{color:var(--et-text-secondary);padding:40px;text-align:center}
</style>
