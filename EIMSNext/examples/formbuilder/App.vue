<template>
  <button @click="changLang">Change Lang</button>
  <form-builder :locale="localeRef.locale" :formName="formName"></form-builder>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { FormBuilder } from "@eimsnext/form-builder";
import "@eimsnext/form-builder/dist/index.css";
import { ZhCn, En } from "@eimsnext/form-designer";

const localeRef = reactive({ lang: "zh-CN", locale: ZhCn });
const formName = ref("test form");
const changLang = () => {
  console.log(localeRef.lang);
  if (localeRef.lang == "en") {
    localeRef.lang = "zh-CN";
    localeRef.locale = ZhCn;
  } else {
    localeRef.lang = "en";
    localeRef.locale = En;
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
