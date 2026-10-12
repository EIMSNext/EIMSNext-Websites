<template>
  <!-- PC：admin forget-password 页 1:1 -->
  <div v-if="!isMobile" class="pc-forget">
    <div class="pc-forget-panel">
      <h1>{{ t("login.forgetPassword") }}</h1>
      <p>{{ t("login.forgetPasswordHint") }}</p>
      <button class="pc-btn" style="width: auto; margin-top: 0" type="button" @click="backToLogin">
        {{ t("login.backToLogin") }}
      </button>
    </div>
  </div>

  <!-- Mobile -->
  <div v-else class="m-page">
    <div class="m-login-body">
      <div class="m-card">
        <div class="m-card-title">{{ t("login.forgetPassword") }}</div>
        <p class="m-hint">{{ t("login.forgetPasswordHint") }}</p>
        <button class="m-btn" type="button" @click="backToLogin">{{ t("login.backToLogin") }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { isMobile } from "@/utils/device";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

function backToLogin() {
  router.push({ path: "/login", query: route.query });
}
</script>
