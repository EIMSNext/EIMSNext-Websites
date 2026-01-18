<template>
  <el-config-provider :locale="locale">
    <!-- 开启水印 -->
    <el-watermark v-if="watermarkEnabled" :font="{ color: fontColor }" :content="defaultSettings.watermarkContent"
      :z-index="9999" class="wh-full">
      <router-view />
    </el-watermark>
    <!-- 关闭水印 -->
    <router-view v-else />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useSystemStore, useSettingsStore } from "@/store";
import defaultSettings from "@/settings";
import { Themes } from "@/enums/Themes";

const systemStore = useSystemStore();
const settingsStore = useSettingsStore();

const locale = computed(() => systemStore.locale);
const watermarkEnabled = computed(() => settingsStore.watermarkEnabled);

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === Themes.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
</script>
