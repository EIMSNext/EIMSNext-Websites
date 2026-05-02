<template>
  <button @click="changLang">Change Lang</button>
  <form-builder :locale="locale" :formName="formName"></form-builder>
</template>

<script lang="ts" setup>
import { ref,computed } from "vue";
import { FormBuilder } from "@eimsnext/form-builder";
import "@eimsnext/form-builder/dist/index.css";
// 导入 Element Plus 中英文语言包
import zhCn_EL from "element-plus/es/locale/lang/zh-cn";
import en_EL from "element-plus/es/locale/lang/en";
// 本地语言包
import { ZhCn as zhCn_App, En as en_App } from "@eimsnext/locale";

const locales = {
  "zh-CN": {
    ...zhCn_EL,
    ...zhCn_App,
  },
  en: {
    ...en_EL,
    ...en_App,
  },
};
const locale = computed(() => {
  if (language.value == "en") {
    return locales.en;
  } else {
    return locales["zh-CN"];
  }
});
const language = ref("zh-CN");
const formName = ref("test form");
const changLang = () => {
  if (language.value == "en") {
    language.value = "zh-CN";
  } else {
    language.value = "en";
  }
};
</script>

<style>
body {
  min-height: 100vh;
  padding: 0;
  margin: 0;
  display: flex !important;
  flex-direction: column !important;
}

#app {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
