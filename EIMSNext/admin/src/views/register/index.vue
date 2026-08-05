<template>
  <div class="login register-page">
    <el-link underline="never" class="brand-logo" target="_self" href="https://www.eimsnext.com">
      <img class="logo" src="@/assets/logo2.png" alt=""></img>
    </el-link>
    <div class="banner">
      <div class="bg-banner"></div>
    </div>
    <div class="main">
      <div class="lang-switch">
        <el-switch v-model="isDark" inline-prompt active-icon="Moon" inactive-icon="Sunny" @change="toggleTheme" />
        <lang-select class="ml-5 cursor-pointer" />
      </div>

      <div class="content">
        <div class="login-container">
          <div class="account-login register-card">
            <div class="login-title">{{ t("register.title") }}</div>
            <div class="login-register"><span>{{ t("register.hasAccount") }}</span>
              <el-link type="primary" underline="never" href="/login" target="_self">
                {{ t("register.goLogin") }}
              </el-link>
            </div>

            <el-radio-group v-model="registerType" class="register-switch">
              <el-radio-button value="phone">{{ t("register.phoneTab") }}</el-radio-button>
              <el-radio-button value="email">{{ t("register.emailTab") }}</el-radio-button>
            </el-radio-group>

            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" @submit.prevent>
              <div class="login-content">
                <div class="login-form">
                  <div v-if="registerType === 'phone'" class="login-form-item first-item phone-form-item">
                    <el-select v-model="registerForm.areaCode" class="area-code" size="large">
                      <el-option label="+86" value="+86" />
                    </el-select>
                    <el-form-item prop="phone" class="inline-form-item">
                      <el-input v-model="registerForm.phone" :placeholder="t('register.phonePlaceholder')" name="phone"
                        size="large" maxlength="11" :validate-event="false" />
                    </el-form-item>
                  </div>
                  <div v-else class="login-form-item first-item">
                    <el-form-item prop="email">
                      <el-input v-model="registerForm.email" :placeholder="t('register.emailPlaceholder')" name="email"
                        size="large" :validate-event="false" />
                    </el-form-item>
                  </div>

                  <div class="login-form-item code-form-item">
                    <el-form-item prop="code">
                      <el-input v-model="registerForm.code" :placeholder="t('register.codePlaceholder')" size="large"
                        :validate-event="false">
                        <template #append>
                          <el-button link type="primary" class="code-btn" :disabled="sendCodeDisabled"
                            @click="handleSendCode">
                            {{ sendCodeText }}
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </div>

                  <div class="login-form-item password-form-item">
                    <el-form-item prop="password">
                      <el-popover placement="bottom-start" :width="320" trigger="click" :visible="showPasswordTips"
                        popper-class="register-password-popover">
                        <template #reference>
                          <el-input v-model="registerForm.password" :placeholder="t('register.passwordPlaceholder')"
                            type="password" name="password" size="large" show-password :validate-event="false"
                            @focus="showPasswordTips = true" @blur="showPasswordTips = false" />
                        </template>
                        <div class="password-tip-list">
                          <div class="password-tip-item" :class="{ passed: passwordState.hasLength }">
                            <span class="password-tip-icon">{{ passwordState.hasLength ? "✓" : "○" }}</span>
                            <span>{{ t("register.passwordRuleLength") }}</span>
                          </div>
                          <div class="password-tip-item" :class="{ passed: passwordState.hasCategoryCount }">
                            <span class="password-tip-icon">{{ passwordState.hasCategoryCount ? "✓" : "○" }}</span>
                            <span>{{ t("register.passwordRuleCategory") }}</span>
                          </div>
                        </div>
                      </el-popover>
                    </el-form-item>
                  </div>
                </div>

                <div class="agreement-text">
                  {{ t("register.agreementPrefix") }}
                  <el-link type="primary" underline="never" href="#">{{ t("register.serviceTerms") }}</el-link>
                  {{ t("register.and") }}
                  <el-link type="primary" underline="never" href="#">{{ t("register.privacyPolicy") }}</el-link>
                </div>

                <el-button :loading="loading" type="primary" size="large" class="login-btn"
                  @click.prevent="handleRegisterSubmit">
                  {{ t("register.submit") }}
                </el-button>

                <div class="help-link-row">
                  <span>{{ registerType === "phone" ? t("register.phoneUnavailable") : t("register.emailUnavailable") }}</span>
                  <el-link type="primary" underline="never" href="#">{{ t("register.clickHere") }}</el-link>
                </div>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, useLocale } from "element-plus";
import { computed, reactive, ref, watch } from "vue";
import { LocationQuery, useRoute } from "vue-router";
import router from "@/router";
import { Themes } from "@/enums/Themes";
import { useSettingsStore } from "@/store";
import { useUserStore } from "@eimsnext/store";
import { authService, LoginRequest } from "@eimsnext/services";
import { getPasswordStrengthMessage, getPasswordStrengthState, isStrongPassword } from "@/utils/password";

type RegisterType = "phone" | "email";

const { t } = useLocale();
const route = useRoute();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const registerFormRef = ref<FormInstance>();
const registerType = ref<RegisterType>("phone");
const isDark = ref(settingsStore.theme === Themes.DARK);
const loading = ref(false);
const countdown = ref(0);
const showPasswordTips = ref(false);
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const registerForm = reactive({
  areaCode: "+86",
  phone: "",
  email: "",
  code: "",
  password: "",
});

const passwordState = computed(() => getPasswordStrengthState(registerForm.password));
const sendCodeText = computed(() => (countdown.value > 0 ? `${countdown.value}${t("comp.register.resendAfter")}` : t("register.sendCode")));
const sendCodeDisabled = computed(() => countdown.value > 0);

const registerRules = computed<FormRules>(() => ({
  phone: [
    {
      validator: (_rule, value, callback) => {
        if (registerType.value !== "phone") {
          callback();
          return;
        }
        if (!value) {
          callback(new Error(t("register.phoneRequired")));
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(value)) {
          callback(new Error(t("register.phoneInvalid")));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  email: [
    {
      validator: (_rule, value, callback) => {
        if (registerType.value !== "email") {
          callback();
          return;
        }
        if (!value) {
          callback(new Error(t("register.emailRequired")));
          return;
        }
        if (!/^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/.test(value)) {
          callback(new Error(t("register.emailInvalid")));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: t("register.codeRequired"), trigger: "blur" }],
  password: [
    { required: true, message: t("register.passwordRequired"), trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error(t("register.passwordRequired")));
          return;
        }
        if (!isStrongPassword(value)) {
          callback(new Error(getPasswordStrengthMessage(t("register.passwordLabel"), t)));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
}));

watch(registerType, () => {
  registerForm.code = "";
  registerForm.password = "";
  stopCountdown();
  registerFormRef.value?.clearValidate();
});

async function handleSendCode() {
  const field = registerType.value === "phone" ? "phone" : "email";
  try {
    await registerFormRef.value?.validateField(field);
  } catch {
    return;
  }

  const target = registerType.value === "phone" ? registerForm.phone : registerForm.email;
  await authService.sendRegCode({
    type: registerType.value,
    target,
  });
  startCountdown();
  ElMessage.success(t("register.codeSent"));
}

async function handleRegisterSubmit() {
  const valid = await registerFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    await authService.register({
      type: registerType.value,
      phone: registerType.value === "phone" ? registerForm.phone : undefined,
      email: registerType.value === "email" ? registerForm.email : undefined,
      code: registerForm.code,
      password: registerForm.password,
    });

    const username = registerType.value === "phone" ? registerForm.phone : registerForm.email;
    const loginData: LoginRequest = {
      username,
      password: registerForm.password,
      grant_type: "password",
    };
    await userStore.login(loginData);
    await userStore.initialize(true);

    const { path, queryParams } = parseRedirect();
    router.push({ path, query: queryParams });
  } catch {
    // The shared HTTP error handler presents the registration failure message.
  } finally {
    loading.value = false;
  }
}

function parseRedirect(): { path: string; queryParams: Record<string, string> } {
  const query: LocationQuery = route.query;
  const redirect = (query.redirect as string) ?? "/";

  const url = new URL(redirect, window.location.origin);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return { path, queryParams };
}

function startCountdown() {
  stopCountdown();
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      stopCountdown();
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
  countdown.value = 0;
}

const toggleTheme = () => {
  const newTheme = settingsStore.theme === Themes.DARK ? Themes.LIGHT : Themes.DARK;
  settingsStore.changeTheme(newTheme);
};
</script>

<style lang="scss" scoped>
.logo {
  height: var(--et-size-36);
}

.login {
  align-items: center;
  background: var(--et-bg-muted);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  .brand-logo {
    left: var(--et-size-60);
    position: absolute;
    top: var(--et-size-40);
    z-index: 9;
    height: var(--et-size-24);
    padding: 0;
  }

  .lang-switch {
    align-items: center;
    color: var(--et-text-tertiary);
    cursor: pointer;
    display: inline-flex;
    font-size: var(--et-font-size-14);
    justify-content: center;
    line-height: var(--et-line-height-18);
    position: absolute;
    right: var(--et-space-24);
    top: var(--et-space-24);
  }

  .banner {
    position: relative;
    flex: 0.58;
    height: 100%;

    .bg-banner {
      background-image: url("@/assets/images/login/login-image.jpg");
      background-position: 50%;
      background-repeat: no-repeat;
      background-size: cover;
      height: 100%;
      width: 100%;
    }
  }

  .main {
    align-items: center;
    display: flex;
    flex: 0.42;
    height: 100%;
    justify-content: center;
    overflow-y: auto;
    position: relative;

    .content {
      width: 420px;

      .login-title {
        font-size: var(--et-font-size-32);
        font-weight: 500;
        line-height: var(--et-line-height-48);
      }

      .login-register {
        font-size: var(--et-font-size-14);
        line-height: var(--et-line-height-20);
        margin: var(--et-space-10) 0 var(--et-space-24);
      }

      .register-switch {
        display: inline-flex;
        margin-bottom: var(--et-space-24);
        width: 100%;
      }

      .login-form>.login-form-item {
        margin-top: var(--et-space-16);
      }

      .login-form > .login-form-item.first-item {
        margin-top: 0;
      }

      .login-btn {
        margin-top: var(--et-space-24);
        width: 100%;
        height: 44px;
      }
    }
  }
}

.register-card {
  background: var(--et-bg-container);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 36px 32px 28px;
}

.phone-form-item {
  display: flex;
  gap: var(--et-space-12);

  .area-code {
    width: 88px;
    flex: none;
  }

  .inline-form-item {
    flex: 1;
    margin-bottom: 0;
  }
}

.agreement-text {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-22);
  margin-top: var(--et-space-20);
}

.help-link-row {
  align-items: center;
  color: var(--et-text-secondary);
  display: flex;
  font-size: var(--et-font-size-14);
  gap: 4px;
  line-height: var(--et-line-height-20);
  margin-top: var(--et-space-16);
}

.password-tip-list {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
}

.password-tip-item {
  align-items: flex-start;
  color: var(--et-text-secondary);
  display: flex;
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-20);
}

.password-tip-item.passed {
  color: var(--et-text-primary);
}

.password-tip-icon {
  margin-right: var(--et-space-8);
  width: 16px;
}

.code-btn {
  color: var(--et-text-tertiary);
  min-width: 104px;
}

:deep(.register-page .el-form-item) {
  margin-bottom: 0;
}

:deep(.register-page .el-input__wrapper) {
  min-height: 44px;
}

:deep(.register-page .el-input-group__append .el-button.is-disabled) {
  color: var(--et-text-placeholder);
}

:deep(.register-page .el-input-group__append) {
  padding: 0 var(--et-space-12);
}

:deep(.register-page .el-radio-group) {
  display: flex;
}

:deep(.register-page .el-radio-button) {
  flex: 1;
}

:deep(.register-page .el-radio-button__inner) {
  background: var(--et-fill-color-light);
  border: none;
  box-shadow: none;
  color: var(--et-text-secondary);
  height: 40px;
  line-height: 24px;
  width: 100%;
}

:deep(.register-page .el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 10px 0 0 10px;
}

:deep(.register-page .el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 10px 10px 0;
}

:deep(.register-page .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--et-color-primary);
  color: #fff;
}

:deep(.register-page .el-select .el-input__wrapper) {
  border-radius: 10px;
}

:deep(.register-page .el-input-group__append) {
  background: var(--et-fill-color-blank);
}

:deep(.register-password-popover) {
  border-radius: 12px;
  padding: 14px 16px;
}

@media (max-width: 960px) {
  .login {
    .banner {
      display: none;
    }

    .main {
      flex: 1;
      padding: 88px 16px 24px;

      .content {
        width: 100%;
        max-width: 420px;
      }
    }

    .brand-logo {
      left: 24px;
      top: 24px;
    }
  }

  .register-card {
    padding: 28px 20px 24px;
  }
}

html.dark {
  .login {
    background: url("@/assets/images/login/login-background-dark.jpg") no-repeat center right;
  }

  .register-card {
    box-shadow: var(--el-box-shadow);
  }
}
</style>
