<template>
  <div class="enterprise-settings">
    <h2>{{ $t("admin.systemSettings.enterpriseSettings.culture.title") }}</h2>
    <!-- <SettingRow :label="$t('admin.systemSettings.enterpriseSettings.culture.customLogin')">
      <el-switch v-model="login" />
      <el-button>{{ $t("common.set") }}</el-button>
      <span>{{ $t("admin.systemSettings.enterpriseSettings.culture.customLoginTip") }}</span>
    </SettingRow> -->
    <SettingRow :label="$t('admin.systemSettings.enterpriseSettings.culture.style')">
      <el-switch v-model="styleEnabled" :loading="styleSaving" @change="saveStyleEnabled" />
      <CorpThemeColorPicker
        v-model:visible="themePickerVisible"
        :model-value="currentThemeColor"
        :saving="themeSaving"
        :disabled="!styleEnabled"
        @confirm="saveThemeColor"
      />
      <span>{{ $t("admin.systemSettings.enterpriseSettings.culture.styleTip") }}<el-link
          type="primary"
          underline="never"
        >{{ $t("admin.systemSettings.enterpriseSettings.learnMore") }}</el-link></span>
    </SettingRow>
    <hr />
    <h2>{{ $t("admin.systemSettings.enterpriseSettings.collaboration.title") }}</h2>
    <!-- <SettingRow :label="$t('admin.systemSettings.enterpriseSettings.collaboration.notifyMute')">
      <el-button>{{ $t("common.set") }}</el-button>
      <span>{{ $t("admin.systemSettings.enterpriseSettings.collaboration.notifyMuteTip") }}<el-link
          type="primary"
          underline="never"
        >{{ $t("admin.systemSettings.enterpriseSettings.learnMore") }}</el-link></span>
    </SettingRow> -->
    <SettingRow :label="$t('admin.systemSettings.enterpriseSettings.collaboration.systemTimezone')">
      <span>{{ $t("admin.systemSettings.enterpriseSettings.collaboration.systemTimezoneFollow") }}</span>
      <el-link type="primary" underline="never">{{ $t("admin.profile.edit") }}</el-link>
      <span>{{ $t("admin.systemSettings.enterpriseSettings.collaboration.systemTimezoneTip") }}</span>
    </SettingRow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { corporateSettingService } from "@eimsnext/services";
import type { CorporateSetting } from "@eimsnext/models";
import {
  CORP_THEME_COLOR_SETTING_NAME,
  CORP_STYLE_ENABLED_SETTING_NAME,
} from "@eimsnext/utils";
import { useSettingsStore } from "@/store";
import SettingRow from "./SettingRow.vue";
import CorpThemeColorPicker from "./components/CorpThemeColorPicker.vue";

const { t } = useI18n();
const settingsStore = useSettingsStore();

const login = ref(true);
const themePickerVisible = ref(false);
const themeSaving = ref(false);
const styleSaving = ref(false);

const styleEnabled = computed({
  get: () => settingsStore.corpStyleEnabled,
  set: (value: boolean) => settingsStore.setCorpStyleEnabled(value),
});

/** 色块展示当前企业主题色；企业色未读取时回退到当前生效色。 */
const currentThemeColor = computed(
  () => settingsStore.corpThemeColor || settingsStore.themeColor,
);

/** 企业配置按名称做“存在则更新、不存在则新增”。 */
const upsertSetting = async (name: string, value: string) => {
  const query = `$filter=name eq '${name}'&$top=1`;
  const [existing] = await corporateSettingService.query<CorporateSetting>(query);
  if (existing) {
    await corporateSettingService.patch<CorporateSetting>(existing.id, {
      id: existing.id,
      value,
    });
    return;
  }
  await corporateSettingService.post<CorporateSetting>({
    id: "",
    name,
    value,
    desc: "",
  });
};

/** 保存企业主题色（OData 仅管理员可用）。 */
const saveThemeColor = async (color: string) => {
  if (!color) return;
  themeSaving.value = true;
  try {
    await upsertSetting(CORP_THEME_COLOR_SETTING_NAME, color);
    // 保存后立即生效：直接用企业色覆盖用户色，便于管理员即时预览
    settingsStore.applyCorpThemeColor(color);
    themePickerVisible.value = false;
    ElMessage.success(t("admin.systemSettings.enterpriseSettings.themeColor.saved"));
  } catch {
    ElMessage.error(t("admin.systemSettings.enterpriseSettings.themeColor.saveFailed"));
  } finally {
    themeSaving.value = false;
  }
};

/** 保存企业风格开关。 */
const saveStyleEnabled = async (value: string | number | boolean) => {
  const enabled = Boolean(value);
  styleSaving.value = true;
  try {
    await upsertSetting(CORP_STYLE_ENABLED_SETTING_NAME, String(enabled));
    ElMessage.success(t("admin.systemSettings.enterpriseSettings.style.saved"));
  } catch {
    settingsStore.setCorpStyleEnabled(!enabled);
    ElMessage.error(t("admin.systemSettings.enterpriseSettings.style.saveFailed"));
  } finally {
    styleSaving.value = false;
  }
};
</script>

<style scoped lang="scss">
.enterprise-settings {
  h2 {
    font-size: 17px;
    margin: 14px 0 22px;
    border-left: 4px solid var(--et-color-primary);
    padding-left: 10px;
  }

  hr {
    border: 0;
    border-top: 1px solid var(--el-border-color);
    margin: 30px 0;
  }
}
</style>
