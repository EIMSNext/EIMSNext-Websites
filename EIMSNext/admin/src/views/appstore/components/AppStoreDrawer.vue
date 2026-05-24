<template>
  <et-drawer v-model="visible" @close="visible = false">
    <template #title>应用中心</template>
    <div class="appstore-wrapper">
      <AppStorePanel @close="visible = false" />
    </div>
  </et-drawer>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";
import AppStorePanel from "./AppStorePanel.vue";

defineOptions({ name: "AppStoreDrawer" });

const settingStore = useSettingsStore();

const visible = computed({
  get: () => settingStore.appStoreVisible,
  set: (val: boolean) => { settingStore.appStoreVisible = val; },
});
</script>
<style scoped>
.appstore-wrapper {
  display: flex;
  justify-content: center;
}
</style>