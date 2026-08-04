<script setup lang="ts">
import router from "@/router";
import { useLocale } from "element-plus";

const { t } = useLocale();
</script>

<template>
  <div class="forget-password-page">
    <div class="forget-password-panel">
      <h1>{{ t("login.forgetPassword") }}</h1>
      <p>{{ t("login.forgetPasswordHint") }}</p>
      <el-button type="primary" @click="router.push('/login')">
        {{ t("login.backToLogin") }}
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forget-password-page {
  align-items: center;
  background: var(--et-bg-muted);
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.forget-password-panel {
  background: var(--et-bg-base);
  border-radius: var(--et-radius-8);
  box-shadow: var(--el-box-shadow-light);
  max-width: 420px;
  padding: var(--et-size-40);
  text-align: center;
  width: calc(100% - var(--et-size-48));
}

h1 {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-24);
  margin: 0 0 var(--et-space-16);
}

p {
  color: var(--et-text-secondary);
  line-height: var(--et-line-height-24);
  margin: 0 0 var(--et-space-24);
}
</style>
