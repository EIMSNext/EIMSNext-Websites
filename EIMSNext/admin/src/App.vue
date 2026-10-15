<template>
  <el-config-provider :locale="locale">
    <!-- 首次导航就绪前渲染 workbench 骨架，替代空白等待（换码/初始化窗口期） -->
    <app-skeleton v-if="!routerReady" />
    <template v-else>
      <!-- 开启水印 -->
      <el-watermark v-if="watermarkEnabled" :font="{ color: fontColor }" :content="defaultSettings.watermarkContent"
        :z-index="9999" class="wh-full">
        <router-view />
      </el-watermark>
      <!-- 关闭水印 -->
      <router-view v-else />
    </template>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useSystemStore, useSettingsStore } from "@/store";
import defaultSettings from "@/settings";
import { Themes } from "@/enums/Themes";
import AppSkeleton from "@/layout/components/AppSkeleton.vue";
import router from "@/router";

const systemStore = useSystemStore();
const settingsStore = useSettingsStore();

const locale = computed(() => systemStore.locale);
const watermarkEnabled = computed(() => settingsStore.watermarkEnabled);
const routerReady = ref(false);

// 首次导航（含 portal 回跳换码/用户初始化）完成后才交给 router-view
router.isReady().then(() => {
  routerReady.value = true;
});

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === Themes.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
</script>
