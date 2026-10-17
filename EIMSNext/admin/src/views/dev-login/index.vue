<template>
  <div class="dev-login">
    <div class="panel">
      <div class="title">Dev 登录</div>
      <el-input v-model="username" placeholder="用户名" @keyup.enter="login" />
      <el-input v-model="password" type="password" placeholder="密码" show-password @keyup.enter="login" />
      <el-button type="primary" :loading="loading" @click="login">登录</el-button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { http } from "@eimsnext/utils";

// 仅开发测试用的本地登录页：requestDevToken → POST /dev/token（Development 专用端点，
// 明文表单，grant_type/client_id 由服务端强制，生产环境 404）。token 落盘后跳 /workbench，
// 后续 initialize/主题/动态路由由全局守卫完成——与 portal 正常登录后的链路一致。
// 本页无任何入口跳转，仅手工输入 URL 访问，不影响 portal 登录。
const router = useRouter();
const username = ref("admin@eimsnext.com");
const password = ref("123456");
const loading = ref(false);
const error = ref("");

async function login() {
  if (!username.value || !password.value || loading.value) return;

  loading.value = true;
  error.value = "";
  try {
    await http.identity.requestDevToken(username.value, password.value);
    router.replace("/workbench");
  } catch (err: any) {
    error.value = err?.response?.data?.error_description || err?.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.dev-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--et-bg-page, #f4f7fb);
  width: 100%;

  .panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 360px;
    padding: 28px;
    border-radius: 8px;
    background: var(--et-bg-container, #fff);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);

    .title {
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 4px;
    }

    .error {
      color: var(--el-color-danger);
      font-size: 13px;
    }
  }
}
</style>
