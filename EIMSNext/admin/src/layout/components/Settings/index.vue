<template>
  <el-drawer v-model="settingsVisible" size="300" :title="t('settings.project')">
    <el-divider>{{ t("settings.theme") }}</el-divider>

    <div class="flex-center">
      <el-switch v-model="isDark" active-icon="Moon" inactive-icon="Sunny" @change="changeTheme" />
    </div>

    <el-divider>{{ t("settings.interface") }}</el-divider>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ t("settings.themeColor") }}</span>
      <ThemeColorPicker v-model="settingsStore.themeColor" @update:model-value="changeThemeColor" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ t("settings.tagsView") }}</span>
      <el-switch v-model="settingsStore.tagsView" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ t("settings.fixedHeader") }}</span>
      <el-switch v-model="settingsStore.fixedHeader" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ t("settings.watermark") }}</span>
      <el-switch v-model="settingsStore.watermarkEnabled" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { Themes } from "@/enums/Themes";

import { useSettingsStore, usePermissionStore, useSystemStore } from "@/store";
import { useLocale } from "element-plus";
const { t } = useLocale();

const route = useRoute();
const appStore = useSystemStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const isDark = ref<boolean>(settingsStore.theme === Themes.DARK);

const settingsVisible = computed({
  get() {
    return settingsStore.settingsVisible;
  },
  set() {
    settingsStore.settingsVisible = false;
  },
});

/**
 *  切换主题颜色
 *
 * @param color 颜色
 */
function changeThemeColor(color: string) {
  settingsStore.changeThemeColor(color);
}

/**
 * 切换主题
 *
 * @param val 是否为暗黑模式
 */
const changeTheme = (val: any) => {
  isDark.value = val;
  settingsStore.changeTheme(isDark.value ? Themes.DARK : Themes.LIGHT);
};

</script>

<style lang="scss" scoped></style>
