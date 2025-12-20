<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div style="display: inline-flex;">
      <et-icon icon="language" :size="size" />
      <span v-if="showLabel" class="ml-[5px]">{{ curLang.label }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.value"
          :disabled="systemStore.language === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store/system";
import { LanguageEnum } from "@/enums/LanguageEnum";

defineProps({
  size: {
    type: String,
    required: false,
  },
  showLabel: {
    type: Boolean,
    required: false,
    default: () => true,
  },
});

const langOptions = [
  { label: "简体中文", value: LanguageEnum.ZH_CN },
  { label: "English", value: LanguageEnum.EN },
];

const curLang = ref({ label: "简体中文", value: LanguageEnum.ZH_CN });

const systemStore = useSystemStore();
if (systemStore.language) {
  curLang.value = langOptions.find((x) => x.value === systemStore.language) || {
    label: "简体中文",
    value: LanguageEnum.ZH_CN,
  };
}

function handleLanguageChange(lang: string) {
  systemStore.changeLanguage(lang);
  curLang.value = langOptions.find((x) => x.value === lang) || {
    label: "简体中文",
    value: LanguageEnum.ZH_CN,
  };
}
</script>
