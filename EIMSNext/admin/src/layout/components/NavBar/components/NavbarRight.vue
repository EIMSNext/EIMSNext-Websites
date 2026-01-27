<template>
  <div class="navbar__right">
    <!-- 非手机设备（窄屏）才显示 -->
    <!-- <template> -->
    <!-- 全屏 -->
    <Fullscreen />
    <!-- 消息通知 -->
    <Notification />
    <!-- </template> -->
    <!-- 语言选择 -->
    <LangSelect :show-label="false" />

    <!-- 用户头像（个人中心、注销登录等） -->
    <UserProfile />

    <!-- 设置面板 -->
    <div v-if="defaultSettings.showSettings" @click="settingStore.settingsVisible = true">
      <et-icon icon="el-setting" />
    </div>
  </div>
</template>
<script setup lang="ts">
import defaultSettings from "@/settings";
import { useSystemStore, useSettingsStore } from "@/store";
import UserProfile from "./UserProfile.vue";

const appStore = useSystemStore();
const settingStore = useSettingsStore();
</script>

<style lang="scss" scoped>
.navbar__right {
  display: flex;
  align-items: center;
  justify-content: center;

  &>* {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 40px;
    height: 50px;
    line-height: 50px;
    color: var(--et-color-text);
    align-items: center;
    cursor: pointer;

    &:hover {
      background: rgb(0 0 0 / 10%);
    }
  }
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

.dark .navbar__right>*:hover {
  background: rgb(255 255 255 / 20%);
}
</style>
