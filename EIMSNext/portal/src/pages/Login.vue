<template>
  <!-- PC：admin 登录页 1:1 -->
  <div v-if="!isMobile" class="pc-login">
    <div v-if="redirecting" class="redirect-mask">
      <span class="redirect-ring"></span>
      <span class="redirect-text">{{ t("login.redirecting") }}</span>
    </div>
    <a class="brand-logo" href="https://www.eimsnext.com" target="_self">
      <img class="pc-logo" src="@/assets/logo2.png" alt="" />
    </a>
    <div class="banner">
      <div class="bg-banner"></div>
    </div>
    <div class="main">
      <div class="lang-switch">
        <!-- <button class="pc-switch" :class="{ on: isDark }" type="button" @click="toggleTheme">
          <span class="icon icon-sun"><Sunny /></span>
          <span class="icon icon-moon"><Moon /></span>
          <span class="knob"></span>
        </button> -->
        <div class="pc-lang">
          <button class="trigger" type="button" @click.stop="langMenuOpen = !langMenuOpen">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 357.376-256H154.624A384 384 0 0 0 512 896m-376.64-384a384.32 384.32 0 0 0 0 64h753.28a384.32 384.32 0 0 0 0-64zM512 128c-138.56 0-258.56 89.152-301.376 212.992h602.752C770.56 217.152 650.56 128 512 128"/></svg>
            <span>{{ curLangLabel }}</span>
          </button>
          <div v-if="langMenuOpen" class="menu">
            <button type="button" :class="{ active: locale === 'zh-CN' }" @click="selectLang('zh-CN')">简体中文</button>
            <button type="button" :class="{ active: locale === 'en' }" @click="selectLang('en')">English</button>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="login-title">{{ t("login.loginTitle") }}</div>
        <div class="login-register">
          <span>{{ t("login.noAccount") }}</span>
          <router-link class="pc-link" :to="keepQuery('/register')">{{ t("login.registerNow") }}</router-link>
        </div>

        <form @submit.prevent="submit">
          <div class="pc-field first-item">
            <input
              v-model.trim="form.username"
              name="username"
              autocomplete="username"
              :placeholder="t('login.username')"
            />
          </div>
          <div class="pc-field has-toggle">
            <input
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :placeholder="t('login.password')"
              @keyup="checkCapslock"
            />
            <button class="input-toggle" type="button" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 320c-176 0-320 143.4-320 320 0 55.2 14.1 107.1 38.9 152.3L188 835.2c-6.1 10.6-2.5 24.2 8.2 30.3 10.6 6.1 24.2 2.5 30.3-8.2l35.3-61.2C311.6 842.6 407 880 512 880c176 0 320-143.4 320-320S688 320 512 320m0 512c-141.2 0-256-86.1-256-192s114.8-192 256-192 256 86.1 256 192-114.8 192-256 192m0-288c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96"/></svg>
              <svg v-else viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 320c-176 0-320 143.4-320 320 0 55.2 14.1 107.1 38.9 152.3L188 835.2c-6.1 10.6-2.5 24.2 8.2 30.3 10.6 6.1 24.2 2.5 30.3-8.2l35.3-61.2C311.6 842.6 407 880 512 880c176 0 320-143.4 320-320S688 320 512 320m0 512c-141.2 0-256-86.1-256-192s114.8-192 256-192 256 86.1 256 192-114.8 192-256 192m0-288c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96"/></svg>
            </button>
          </div>
          <div v-if="isCapslock" class="capslock-tip">{{ t("login.capsLock") }}</div>

          <div class="pc-options">
            <router-link class="pc-link forget-password" :to="keepQuery('/forget-password')">
              {{ t("login.forgetPassword") }}
            </router-link>
          </div>

          <p v-if="error" class="pc-form-item-error">{{ error }}</p>
          <button class="pc-btn" type="submit" :disabled="loading || redirecting">
            {{ t("login.login") }}
          </button>

          <div class="integration-login">
            <div class="integration-title">{{ t("login.otherLoginMethods") }}</div>
            <div class="integration-list">
              <button
                v-for="item in integrationItems"
                :key="item.type"
                type="button"
                class="integration-item"
                :title="item.label"
                @click="handleIntegrationLogin(item.type)"
              >
                <img class="integration-icon" :src="item.icon" :alt="item.label" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Mobile：原型参考图（居中卡片、填充输入框、底部右下语言切换） -->
  <div v-else class="m-page">
    <div v-if="redirecting" class="redirect-mask">
      <span class="redirect-ring"></span>
      <span class="redirect-text">{{ t("login.redirecting") }}</span>
    </div>
    <div class="m-login-body">
      <div class="m-card">
        <div class="m-card-title">{{ t("login.loginTitle") }}</div>
        <form class="m-form" @submit.prevent="submit">
          <div class="m-field filled">
            <input
              v-model.trim="form.username"
              name="username"
              autocomplete="username"
              :placeholder="t('login.username')"
            />
          </div>
          <div class="m-field filled">
            <input
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :placeholder="t('login.password')"
            />
            <button class="input-toggle" type="button" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 0 0 325.76-179.2l-44.8-64A320 320 0 0 1 512 832a320 320 0 0 1-280.96-179.2l-44.8 64A384 384 0 0 0 512 896m-288-384a288 288 0 0 1 576 0 288 288 0 0 1-576 0"/></svg>
              <svg v-else viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 320c-176 0-320 143.4-320 320 0 55.2 14.1 107.1 38.9 152.3L188 835.2c-6.1 10.6-2.5 24.2 8.2 30.3 10.6 6.1 24.2 2.5 30.3-8.2l35.3-61.2C311.6 842.6 407 880 512 880c176 0 320-143.4 320-320S688 320 512 320m0 512c-141.2 0-256-86.1-256-192s114.8-192 256-192 256 86.1 256 192-114.8 192-256 192m0-288c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96"/></svg>
            </button>
          </div>

          <div class="m-check-row">
            <router-link class="m-link" :to="keepQuery('/forget-password')">
              {{ t("login.forgetPassword") }}
            </router-link>
          </div>

          <p v-if="error" class="m-error">{{ error }}</p>

          <button class="m-btn" type="submit" :disabled="loading || redirecting">
            {{ t("login.login") }}
          </button>

          <div class="m-integration">
            <div class="m-integration-title">{{ t("login.otherLoginMethods") }}</div>
            <div class="m-integration-list">
              <button
                v-for="item in integrationItems"
                :key="item.type"
                type="button"
                class="m-integration-item"
                :title="item.label"
                @click="handleIntegrationLogin(item.type)"
              >
                <img class="m-integration-icon" :src="item.icon" :alt="item.label" />
              </button>
            </div>
          </div>

          <div class="m-links-row">
            <router-link class="m-link" :to="keepQuery('/register')">
              {{ t("login.noAccount") }} {{ t("login.registerNow") }}
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <div class="m-lang right">
      <button class="trigger" type="button" @click.stop="langSheetOpen = true">
        <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 357.376-256H154.624A384 384 0 0 0 512 896m-376.64-384a384.32 384.32 0 0 0 0 64h753.28a384.32 384.32 0 0 0 0-64zM512 128c-138.56 0-258.56 89.152-301.376 212.992h602.752C770.56 217.152 650.56 128 512 128"/></svg>
        <span>{{ curLangLabel }}</span>
        <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"/></svg>
      </button>
      <!-- 小屏下拉浮层不适用移动端（定位易被安全区/软键盘顶飞），改用底部弹出语言选择（对齐 mobile 端 vant 交互）：
      <div v-if="langMenuOpen" class="menu right">
        <button type="button" :class="{ active: locale === 'zh-CN' }" @click="selectLang('zh-CN')">简体中文</button>
        <button type="button" :class="{ active: locale === 'en' }" @click="selectLang('en')">English</button>
      </div> -->
    </div>

    <LanguageSheet v-model:show="langSheetOpen" :current="locale" @select="selectLang" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { accessToken, withLocalAuthCodePrefix } from "@eimsnext/utils";
import { identityClient, extractAuthError } from "@/auth/client";
import { currentSession, redirectToCallback, resolveRedirectUrl } from "@/auth/callback";
import { integrationLoginItems, type IntegrationLoginType } from "@/constants/integrationLogin";
import { createIntegrationState } from "@/utils/integrationLogin";
import { isMobile } from "@/utils/device";
import LanguageSheet from "@/components/LanguageSheet.vue";

const { t, locale } = useI18n();
const route = useRoute();

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const redirecting = ref(false);
const isCapslock = ref(false);
const showPassword = ref(false);
const error = ref("");
const langMenuOpen = ref(false);
// 移动端语言选择底部弹层（PC 仍用下拉）
const langSheetOpen = ref(false);

const curLangLabel = computed(() => (locale.value === "en" ? "English" : "简体中文"));

const integrationItems = integrationLoginItems;

// 已有会话时对调用方的连续自动回跳上限：调用方反复换码失败（授权码过期/客户端配置错）时，
// 停留本页等用户手动登录，避免 portal 与调用方之间无声互跳打死结
const AUTO_REDIRECT_LIMIT = 2;
const AUTO_REDIRECT_KEY = "portal_auto_redirects";

// redirect_url / reason 等参数在 登录↔注册↔找回密码 之间透传
function keepQuery(path: string) {
  return { path, query: route.query };
}

function selectLang(lang: string) {
  locale.value = lang;
  localStorage.setItem("language", lang);
  langMenuOpen.value = false;
}

function onDocClick() {
  langMenuOpen.value = false;
}

function checkCapslock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapslock.value = event.getModifierState("CapsLock");
  }
}

onMounted(async () => {
  document.addEventListener("click", onDocClick);

  // 调用方因 token 失效回跳（redirect_url 带 reason=invalid_token）时，
  // 同步清掉本应用会话，避免「自动跳转 → 401 → 回跳」死循环
  if (route.query.reason === "invalid_token") {
    accessToken.clear();
    sessionStorage.removeItem(AUTO_REDIRECT_KEY);
    return;
  }

  // 回跳地址非法时登录成功也无处可去，进页面即提示，而非等用户填完账密才报错
  const target = resolveRedirectUrl(route.query.redirect_url as string);
  if (!target) {
    error.value = t("login.invalidRedirect");
    return;
  }

  const session = currentSession();
  if (session) {
    redirecting.value = true;
    const attempts = Number(sessionStorage.getItem(AUTO_REDIRECT_KEY) || 0);
    if (attempts >= AUTO_REDIRECT_LIMIT) {
      redirecting.value = false;
      return;
    }
    sessionStorage.setItem(AUTO_REDIRECT_KEY, String(attempts + 1));

    // 已有会话：token 换一次性授权码（lg_ 前缀）回传，URL 不暴露 access_token
    try {
      const res: any = await identityClient.post("/identity/authorizeCodeSession", {});
      redirectToCallback(target, withLocalAuthCodePrefix(res.code));
    } catch {
      // 换码失败则留在登录页重新登录
      redirecting.value = false;
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});

async function submit() {
  if (loading.value || redirecting.value) return;
  error.value = "";

  const username = form.username.trim();
  if (!username) {
    error.value = t("login.message.username.required");
    return;
  }
  if (!form.password) {
    error.value = t("login.message.password.required");
    return;
  }

  const target = resolveRedirectUrl(route.query.redirect_url as string);
  if (!target) {
    error.value = t("login.invalidRedirect");
    return;
  }

  loading.value = true;
  try {
    // 授权码模式：签发 code → portal 自身换取并保留会话（免登录）→ 用会话换新码回传调用方
    // （授权码一次性，portal 消费后不能复用，须重新签发）
    const res = await identityClient.requestAuthorizationCode(username, form.password);
    await identityClient.requestWebToken(withLocalAuthCodePrefix(res.code), true);
    // 凭据已通过、会话已建立：进入回跳阶段，上遮罩锁住表单，防止重复提交/改字段
    redirecting.value = true;
    // 手动登录成功即重置自动回跳计数，恢复「有会话免登录」的快捷路径
    sessionStorage.removeItem(AUTO_REDIRECT_KEY);
    const session: any = await identityClient.post("/identity/authorizeCodeSession", {});
    redirectToCallback(target, withLocalAuthCodePrefix(session.code));
  } catch (e) {
    redirecting.value = false;
    error.value = extractAuthError(e) || t("common.systemError");
  } finally {
    loading.value = false;
  }
}

// 第三方集成登录：取授权地址后整页跳转（回调处理后续实现）
async function handleIntegrationLogin(type: IntegrationLoginType) {
  if (loading.value || redirecting.value) return;
  error.value = "";

  const target = resolveRedirectUrl(route.query.redirect_url as string);
  if (!target) {
    error.value = t("login.invalidRedirect");
    return;
  }

  loading.value = true;
  try {
    const state = createIntegrationState(type, target.toString());
    const result = await identityClient.get<{
      type?: string;
      Type?: string;
      enabled?: boolean;
      Enabled?: boolean;
      authorizationUrl?: string;
      AuthorizationUrl?: string;
    }>("/open/integration/authorize", { type, state }, false, false);

    const authorizationUrl = result.authorizationUrl ?? result.AuthorizationUrl;
    if (!authorizationUrl) {
      throw new Error("该集成登录未启用或配置不完整");
    }

    window.location.href = authorizationUrl;
  } catch (e) {
    error.value = extractAuthError(e) || "第三方登录发起失败";
  } finally {
    loading.value = false;
  }
}
</script>
