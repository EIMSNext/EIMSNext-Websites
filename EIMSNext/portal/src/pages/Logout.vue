<template>
  <div class="auth-page center-page">
    <span class="spinner"></span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { accessToken } from "@eimsnext/utils";
import { identityClient } from "@/auth/client";

// 调用方登出流程：调用方先自行登出并清掉本 origin 的 token，再跳到这里失效 auth 自身会话。
// redirect_url 的语义是「重新登录后回到哪」：本页不外跳，仅转发给 /login，
// 由登录成功后（Login.submit）回跳调用方（admin/mobile 均适用）——
// 避免登出后先跳回调用方、再被其守卫踢回登录页的多余绕转；登出即单点登出。
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  try {
    if (accessToken.get()) {
      await identityClient.post("/identity/logout", {});
    }
  } catch {
    // 本地会话清理必须完成，即使服务端拒绝过期 token
  } finally {
    accessToken.clear();
  }

  const redirectUrl = route.query.redirect_url as string | undefined;
  router.replace(redirectUrl ? { path: "/login", query: { redirect_url: redirectUrl } } : "/login");
});
</script>
