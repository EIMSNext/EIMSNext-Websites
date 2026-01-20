<template>
  <WfApprovalLogs :filter="filter" />
</template>

<script setup lang="ts">
defineOptions({
  name: "MyTasksGlobal",
});

import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import WfApprovalLogs from "@/views/wftodo/components/WfApprovalLogs.vue";
import { useAppStore } from "@eimsnext/store";
import { App } from "@eimsnext/models";
import { getAppIcon, getAppIconColor } from "@/utils/common";

const route = useRoute();
const appStore = useAppStore();

const selectedApp = ref<App | null>(null);
const filter = ref({ nodeType: 0 });

// 监听路由参数变化
watch(
  () => route.query.appId,
  (newAppId) => {
    if (newAppId) {
      // 从应用列表中找到对应应用
      const app = appStore.items.find((item) => item.id === newAppId);
      if (app) {
        selectedApp.value = app;
      } else {
        selectedApp.value = null;
      }
    } else {
      selectedApp.value = null;
    }
  },
  { immediate: true }
);

// 获取所有应用
onMounted(async () => {
  await appStore.load();
});
</script>