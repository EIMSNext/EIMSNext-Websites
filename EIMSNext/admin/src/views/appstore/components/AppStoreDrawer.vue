<template>
  <et-drawer v-model="visible" @close="visible = false">
    <template #title>{{ t("admin.shell.appCenter") }}</template>
    <div class="appstore-wrapper">
    <AppStorePanel @close="visible = false" />
    </div>
  </et-drawer>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";
import AppStorePanel from "./AppStorePanel.vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "AppStoreDrawer" });

const settingStore = useSettingsStore();
const { t } = useI18n();

const visible = computed({
  get: () => settingStore.appStoreVisible,
  set: (val: boolean) => { settingStore.appStoreVisible = val; },
});
</script>
<style scoped>
.appstore-wrapper {
  display: flex;
  justify-content: center;
  background: var(--et-bg-page);
  height: 100%;
}
</style>
