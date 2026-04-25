<template>
  <div class="navbar__right">
    <!-- 非手机设备（窄屏）才显示 -->
    <!-- <template> -->
    <!-- 全屏 -->
    <Fullscreen />
    <!-- 消息通知 -->
    <Notification @click="settingStore.messageCenterVisible = true" />
    <!-- </template> -->
    <!-- 语言选择 -->
    <LangSelect :show-label="false" />

    <!-- 用户头像（个人中心、注销登录等） -->
    <UserProfile />

    <!-- 设置面板 -->
    <div v-if="defaultSettings.showSettings" @click="settingStore.settingsVisible = true">
      <et-icon icon="el-setting" size="18" />
    </div>
  </div>
</template>
<script setup lang="ts">
import defaultSettings from "@/settings";
import { useSettingsStore } from "@/store";
import UserProfile from "./UserProfile.vue";

const settingStore = useSettingsStore();
</script>

<style lang="scss" scoped>
.navbar__right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: var(--et-space-10);
  
  & > * {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: var(--et-size-40);
    height: var(--et-size-50);
    line-height: var(--et-size-50);
    color: var(--et-text-primary);
    align-items: center;
    cursor: pointer;

    &:hover {
      background: var(--et-bg-hover);
    }
  }
}

:deep(.el-divider--horizontal) {
  margin: var(--et-space-10) 0;
}
</style>
