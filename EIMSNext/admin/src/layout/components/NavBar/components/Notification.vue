<template>
  <div class="middle-center">
    <el-badge class="middle-center" style="display: flex; width: 100%;" :offset="[-15, 18]" :is-dot="msgCnt > 0">
      <et-icon icon="el-Bell" />
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { BADGE_REFRESH_INTERVAL } from "@/utils/badge";
import { useSettingsStore } from "@/store";

const settingsStore = useSettingsStore();
let msgTimer: ReturnType<typeof setInterval> | null = null;
const msgCnt = computed(() => settingsStore.notificationUnreadCount);

const queryMsgCount = async () => {
  await settingsStore.refreshNotificationUnreadCount();
};

onMounted(() => {
  queryMsgCount();

  msgTimer = setInterval(() => {
    queryMsgCount();
  }, BADGE_REFRESH_INTERVAL);
});

onBeforeUnmount(() => {
  if (msgTimer) {
    clearInterval(msgTimer);
    msgTimer = null;
  }
});
</script>
