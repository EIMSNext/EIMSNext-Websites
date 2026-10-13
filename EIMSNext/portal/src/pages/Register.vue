<template>
  <!-- PC：原型参考图（无卡片、底部链接切换 手机/邮箱 注册） -->
  <div v-if="!isMobile" class="pc-login pc-register">
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
        <div class="login-title">{{ t("register.title") }}</div>
        <div class="login-register">
          <span>{{ t("register.hasAccount") }}</span>
          <router-link class="pc-link" :to="keepQuery('/login')">{{ t("register.goLogin") }}</router-link>
        </div>

        <form @submit.prevent="submit">
          <div v-if="registerType === 'phone'" class="pc-phone-row">
            <div class="pc-area">
              +86
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"/></svg>
            </div>
            <div class="pc-field first-item">
              <input
                v-model.trim="form.phone"
                name="phone"
                maxlength="11"
                autocomplete="tel"
                :placeholder="t('register.phonePlaceholder')"
              />
            </div>
          </div>
          <div v-else class="pc-field first-item">
            <input
              v-model.trim="form.email"
              name="email"
              autocomplete="email"
              :placeholder="t('register.emailPlaceholder')"
            />
          </div>

          <div class="pc-field pc-code-row">
            <input v-model.trim="form.code" name="code" :placeholder="t('register.codePlaceholder')" />
            <button class="append" type="button" :disabled="countdown > 0" @click="handleSendCode">
              {{ sendCodeText }}
            </button>
          </div>

          <div class="pc-field has-toggle">
            <input
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="t('register.passwordPlaceholder')"
              @focus="showPasswordTips = true"
              @blur="showPasswordTips = false"
            />
            <button class="input-toggle" type="button" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 0 0 325.76-179.2l-44.8-64A320 320 0 0 1 512 832a320 320 0 0 1-280.96-179.2l-44.8 64A384 384 0 0 0 512 896m-288-384a288 288 0 0 1 576 0 288 288 0 0 1-576 0"/></svg>
              <svg v-else viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 320c-176 0-320 143.4-320 320 0 55.2 14.1 107.1 38.9 152.3L188 835.2c-6.1 10.6-2.5 24.2 8.2 30.3 10.6 6.1 24.2 2.5 30.3-8.2l35.3-61.2C311.6 842.6 407 880 512 880c176 0 320-143.4 320-320S688 320 512 320m0 512c-141.2 0-256-86.1-256-192s114.8-192 256-192 256 86.1 256 192-114.8 192-256 192m0-288c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96"/></svg>
            </button>
            <div v-if="showPasswordTips" class="password-tips">
              <div :class="{ passed: passwordState.hasLength }">
                <span class="tip-icon">{{ passwordState.hasLength ? "✓" : "○" }}</span>
                <span>{{ t("register.passwordRuleLength") }}</span>
              </div>
              <div :class="{ passed: passwordState.hasCategoryCount }">
                <span class="tip-icon">{{ passwordState.hasCategoryCount ? "✓" : "○" }}</span>
                <span>{{ t("register.passwordRuleCategory") }}</span>
              </div>
            </div>
          </div>

          <p v-if="notice" class="pc-form-item-notice">{{ notice }}</p>
          <p v-if="error" class="pc-form-item-error">{{ error }}</p>

          <p class="agreement-text">
            {{ t("register.agreementPrefix") }}
            <a class="pc-link" href="#">{{ t("register.serviceTerms") }}</a>
            {{ t("register.and") }}
            <a class="pc-link" href="#">{{ t("register.privacyPolicy") }}</a>
          </p>

          <button class="pc-btn" type="submit" :disabled="loading">{{ t("register.submit") }}</button>

          <div class="help-link-row">
            <span>{{ registerType === "phone" ? t("register.phoneUnavailable") : t("register.emailUnavailable") }}</span>
            <a class="pc-link" href="#" @click.prevent="toggleRegisterType">{{ t("register.clickHere") }}</a>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Mobile：原型参考图（无卡片、左对齐、底部链接切换） -->
  <div v-else class="m-page">
    <div class="m-register-body">
      <div class="m-reg-title">{{ t("register.title") }}</div>
      <div class="m-reg-sub">
        {{ t("register.hasAccount") }}
        <router-link class="m-link" :to="keepQuery('/login')">{{ t("register.goLogin") }}</router-link>
      </div>

      <form class="m-form" @submit.prevent="submit">
        <div v-if="registerType === 'phone'" class="m-phone-row">
          <div class="m-select">
            +86
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"/></svg>
          </div>
          <div class="m-field outlined">
            <input
              v-model.trim="form.phone"
              name="phone"
              maxlength="11"
              autocomplete="tel"
              inputmode="numeric"
              :placeholder="t('register.phonePlaceholder')"
            />
          </div>
        </div>
        <div v-else class="m-field outlined">
          <input
            v-model.trim="form.email"
            name="email"
            type="email"
            autocomplete="email"
            :placeholder="t('register.emailPlaceholder')"
          />
        </div>

        <div class="m-field outlined">
          <input v-model.trim="form.code" name="code" inputmode="numeric" :placeholder="t('register.codePlaceholder')" />
          <button class="m-send" type="button" :disabled="countdown > 0" @click="handleSendCode">
            {{ sendCodeText }}
          </button>
        </div>

        <div class="m-field outlined">
          <input
            v-model="form.password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :placeholder="t('register.passwordPlaceholder')"
            @focus="showPasswordTips = true"
            @blur="showPasswordTips = false"
          />
          <button class="input-toggle" type="button" @click="showPassword = !showPassword">
            <svg v-if="showPassword" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 0 0 325.76-179.2l-44.8-64A320 320 0 0 1 512 832a320 320 0 0 1-280.96-179.2l-44.8 64A384 384 0 0 0 512 896m-288-384a288 288 0 0 1 576 0 288 288 0 0 1-576 0"/></svg>
            <svg v-else viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 320c-176 0-320 143.4-320 320 0 55.2 14.1 107.1 38.9 152.3L188 835.2c-6.1 10.6-2.5 24.2 8.2 30.3 10.6 6.1 24.2 2.5 30.3-8.2l35.3-61.2C311.6 842.6 407 880 512 880c176 0 320-143.4 320-320S688 320 512 320m0 512c-141.2 0-256-86.1-256-192s114.8-192 256-192 256 86.1 256 192-114.8 192-256 192m0-288c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96"/></svg>
          </button>
        </div>
        <div v-if="showPasswordTips" class="m-agreement">
          <div>{{ passwordState.hasLength ? "✓" : "○" }} {{ t("register.passwordRuleLength") }}</div>
          <div>{{ passwordState.hasCategoryCount ? "✓" : "○" }} {{ t("register.passwordRuleCategory") }}</div>
        </div>

        <p v-if="notice" class="m-notice">{{ notice }}</p>
        <p v-if="error" class="m-error">{{ error }}</p>

        <p class="m-agreement">
          {{ t("register.agreementPrefix") }}
          <a class="m-link" href="#">{{ t("register.serviceTerms") }}</a>
          {{ t("register.and") }}
          <a class="m-link" href="#">{{ t("register.privacyPolicy") }}</a>
        </p>

        <button class="m-btn" type="submit" :disabled="loading">{{ t("register.submit") }}</button>

        <div class="m-help-row">
          <span>{{ registerType === "phone" ? t("register.phoneUnavailable") : t("register.emailUnavailable") }}</span>
          <a class="m-link" href="#" @click.prevent="toggleRegisterType">{{ t("register.clickHere") }}</a>
        </div>
      </form>
    </div>

    <div class="m-lang left">
      <button class="trigger" type="button" @click="langMenuOpen = !langMenuOpen">
        <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 357.376-256H154.624A384 384 0 0 0 512 896m-376.64-384a384.32 384.32 0 0 0 0 64h753.28a384.32 384.32 0 0 0 0-64zM512 128c-138.56 0-258.56 89.152-301.376 212.992h602.752C770.56 217.152 650.56 128 512 128"/></svg>
        <span>{{ curLangLabel }}</span>
        <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"/></svg>
      </button>
      <div v-if="langMenuOpen" class="menu left">
        <button type="button" :class="{ active: locale === 'zh-CN' }" @click="selectLang('zh-CN')">简体中文</button>
        <button type="button" :class="{ active: locale === 'en' }" @click="selectLang('en')">English</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Moon, Sunny } from "@element-plus/icons-vue";
import { toggleDarkMode, withLocalAuthCodePrefix } from "@eimsnext/utils";
import { identityClient, extractAuthError } from "@/auth/client";
import { redirectToCallback, resolveRedirectUrl } from "@/auth/callback";
import { getPasswordStrengthState, isStrongPassword } from "@/utils/password";
import { isMobile } from "@/utils/device";

type RegisterType = "phone" | "email";

const { t, locale } = useI18n();
const route = useRoute();

const registerType = ref<RegisterType>("phone");
const form = reactive({ phone: "", email: "", code: "", password: "" });
const loading = ref(false);
const countdown = ref(0);
const showPassword = ref(false);
const showPasswordTips = ref(false);
const error = ref("");
const notice = ref("");
const isDark = ref(localStorage.getItem("portal-theme") === "dark");
const langMenuOpen = ref(false);

let countdownTimer: ReturnType<typeof setInterval> | undefined;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

const passwordState = computed(() => getPasswordStrengthState(form.password));
const sendCodeText = computed(() =>
  countdown.value > 0 ? `${countdown.value}${t("comp.register.resendAfter")}` : t("register.sendCode"),
);

const curLangLabel = computed(() => (locale.value === "en" ? "English" : "简体中文"));

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/;

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

onMounted(() => {
  document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});

// 原型交互：手机/邮箱注册通过底部「点击此处」链接切换
function toggleRegisterType() {
  registerType.value = registerType.value === "phone" ? "email" : "phone";
}

watch(registerType, () => {
  form.code = "";
  form.password = "";
  stopCountdown();
  error.value = "";
});

function validateAccount(): string | undefined {
  if (registerType.value === "phone") {
    if (!form.phone) return t("register.phoneRequired");
    if (!PHONE_RE.test(form.phone)) return t("register.phoneInvalid");
  } else {
    if (!form.email) return t("register.emailRequired");
    if (!EMAIL_RE.test(form.email)) return t("register.emailInvalid");
  }
  return undefined;
}

function showNotice(message: string) {
  notice.value = message;
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ""), 3000);
}

function startCountdown() {
  stopCountdown();
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) stopCountdown();
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
  countdown.value = 0;
}

async function handleSendCode() {
  if (countdown.value > 0) return;
  error.value = "";

  const invalid = validateAccount();
  if (invalid) {
    error.value = invalid;
    return;
  }

  try {
    await identityClient.post("/identity/sendRegCode", {
      type: registerType.value,
      target: registerType.value === "phone" ? form.phone : form.email,
    });
    startCountdown();
    showNotice(t("register.codeSent"));
  } catch (e) {
    error.value = extractAuthError(e) || t("common.systemError");
  }
}

async function submit() {
  if (loading.value) return;
  error.value = "";

  const invalid = validateAccount();
  if (invalid) {
    error.value = invalid;
    return;
  }
  if (!form.code) {
    error.value = t("register.codeRequired");
    return;
  }
  if (!form.password) {
    error.value = t("register.passwordRequired");
    return;
  }
  if (!isStrongPassword(form.password)) {
    error.value = t("register.passwordRuleLength") + "；" + t("register.passwordRuleCategory");
    return;
  }

  const target = resolveRedirectUrl(route.query.redirect_url as string);
  if (!target) {
    error.value = t("login.invalidRedirect");
    return;
  }

  loading.value = true;
  try {
    await identityClient.post("/identity/register", {
      type: registerType.value,
      phone: registerType.value === "phone" ? form.phone : undefined,
      email: registerType.value === "email" ? form.email : undefined,
      code: form.code,
      password: form.password,
    });

    // 与 admin 注册页一致：注册成功后自动登录（授权码模式，portal 保留会话后换新码回传）
    const username = registerType.value === "phone" ? form.phone : form.email;
    const res = await identityClient.requestAuthorizationCode(username, form.password);
    await identityClient.requestWebToken(withLocalAuthCodePrefix(res.code), true);
    const session: any = await identityClient.post("/identity/authorizeCodeSession", {});
    redirectToCallback(target, withLocalAuthCodePrefix(session.code));
  } catch (e) {
    error.value = extractAuthError(e) || t("common.systemError");
  } finally {
    loading.value = false;
  }
}
</script>
