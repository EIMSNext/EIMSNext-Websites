<template>
  <div class="auth-page center-page">
    <span class="spinner"></span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { accessToken } from "@eimsnext/utils";
import { identityClient } from "@/auth/client";
import { resolveRedirectUrl } from "@/auth/callback";

// 调用方登出流程（接线后）：调用方先自行登出并清掉本 origin 的 token，
// 再跳转到这里失效 auth 自身会话，最后回跳 redirect_url（不带 token）。
// 调用方守卫发现无 token，会再次进入 /portal/login 完成重新登录。
const route = useRoute();

onMounted(async () => {
  const target = resolveRedirectUrl(route.query.redirect_url as string);

  try {
    if (accessToken.get()) {
      await identityClient.post("/identity/logout", {});
    }
  } catch {
    // 本地会话清理必须完成，即使服务端拒绝过期 token
  } finally {
    accessToken.clear();
  }

  if (target) {
    window.location.replace(target.toString());
  }
});
</script>
