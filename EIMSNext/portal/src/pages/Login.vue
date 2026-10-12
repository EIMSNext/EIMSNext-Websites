<template>
  <!-- PC：admin 登录页 1:1 -->
  <div v-if="!isMobile" class="pc-login">
    <a class="brand-logo" href="https://www.eimsnext.com" target="_self">
      <img class="pc-logo" src="@/assets/logo2.png" alt="" />
    </a>
    <div class="banner">
      <div class="bg-banner"></div>
    </div>
    <div class="main">
      <div class="lang-switch">
        <button class="pc-switch" :class="{ on: isDark }" type="button" @click="toggleTheme">
          <span class="icon icon-sun"><Sunny /></span>
          <span class="icon icon-moon"><Moon /></span>
          <span class="knob"></span>
        </button>
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
            <label class="pc-checkbox">
              <span class="box"></span>
              {{ t("login.rememberMe") }}
            </label>
            <router-link class="pc-link forget-password" :to="keepQuery('/forget-password')">
              {{ t("login.forgetPassword") }}
            </router-link>
          </div>

          <p v-if="error" class="pc-form-item-error">{{ error }}</p>
          <button class="pc-btn" type="submit" :disabled="loading || redirecting">
            {{ t("login.login") }}
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Mobile：原型参考图（居中卡片、填充输入框、底部右下语言切换） -->
  <div v-else class="m-page">
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
            <label class="m-check">
              <span class="box"></span>
              {{ t("login.rememberMe") }}
            </label>
            <router-link class="m-link" :to="keepQuery('/forget-password')">
              {{ t("login.forgetPassword") }}
            </router-link>
          </div>

          <p v-if="error" class="m-error">{{ error }}</p>

          <button class="m-btn" type="submit" :disabled="loading || redirecting">
            {{ t("login.login") }}
          </button>

          <div class="m-links-row">
            <router-link class="m-link" :to="keepQuery('/register')">
              {{ t("login.noAccount") }} {{ t("login.registerNow") }}
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <div class="m-lang right">
      <button class="trigger" type="button" @click="langMenuOpen = !langMenuOpen">
        <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 357.376-256H154.624A384 384 0 0 0 512 896m-376.64-384a384.32 384.32 0 0 0 0 64h753.28a384.32 384.32 0 0 0 0-64zM512 128c-138.56 0-258.56 89.152-301.376 212.992h602.752C770.56 217.152 650.56 128 512 128"/></svg>
        <span>{{ curLangLabel }}</span>
        <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"/></svg>
      </button>
      <div v-if="langMenuOpen" class="menu right">
        <button type="button" :class="{ active: locale === 'zh-CN' }" @click="selectLang('zh-CN')">简体中文</button>
        <button type="button" :class="{ active: locale === 'en' }" @click="selectLang('en')">English</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Moon, Sunny } from "@element-plus/icons-vue";
import { accessToken, toggleDarkMode } from "@eimsnext/utils";
import { identityClient, extractAuthError } from "@/auth/client";
import { currentSession, redirectToCallback, resolveRedirectUrl } from "@/auth/callback";
import { isMobile } from "@/utils/device";

const { t, locale } = useI18n();
const route = useRoute();

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const redirecting = ref(false);
const isCapslock = ref(false);
const showPassword = ref(false);
const error = ref("");
const isDark = ref(localStorage.getItem("portal-theme") === "dark");
const langMenuOpen = ref(false);

const curLangLabel = computed(() => (locale.value === "en" ? "English" : "简体中文"));

// redirect_url / reason 等参数在 登录↔注册↔找回密码 之间透传
function keepQuery(path: string) {
  return { path, query: route.query };
}

function toggleTheme() {
  isDark.value = !isDark.value;
  toggleDarkMode(isDark.value);
  localStorage.setItem("portal-theme", isDark.value ? "dark" : "light");
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

onMounted(() => {
  document.addEventListener("click", onDocClick);

  // 调用方因 token 失效回跳（redirect_url 带 reason=invalid_token）时，
  // 同步清掉本应用会话，避免「自动跳转 → 401 → 回跳」死循环
  if (route.query.reason === "invalid_token") {
    accessToken.clear();
    return;
  }

  const session = currentSession();
  const target = resolveRedirectUrl(route.query.redirect_url as string);
  if (session && target) {
    redirecting.value = true;
    redirectToCallback(target, session.token, session.expiresIn);
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
    const res: any = await identityClient.login(username, form.password);
    redirectToCallback(target, res.access_token, res.expires_in);
  } catch (e) {
    error.value = extractAuthError(e) || t("common.systemError");
  } finally {
    loading.value = false;
  }
}
</script>
