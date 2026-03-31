<template>
  <div class="login">
    <el-link :underline="false" class="brand-logo" target="_self" href="https://www.eimsnext.com">
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
          <div class="account-login">
            <div class="login-title">{{ t("login.loginTitle") }}</div>
            <!-- <div class="login-register"><span>没有账号？</span>
              <el-link type="primary" :underline="false" href="/register" target="_self">
                免费注册
              </el-link>
            </div> -->
            <el-form ref="loginFormRef" :model="loginData" :rules="loginRules">
              <div class="login-content">
                <div class="login-form">
                  <div class="login-form-item first-item">
                    <el-input ref="username" v-model="loginData.username" :placeholder="t('login.username')"
                      name="username" size="large" />
                  </div>
                  <div class="login-form-item">
                    <el-input v-model="loginData.password" :placeholder="t('login.password')" type="password"
                      name="password" size="large" show-password @keyup="checkCapslock"
                      @keyup.enter="handleLoginSubmit" />
                  </div>
                </div>
                <div class="login-options">
                  <el-checkbox>
                    {{ t("login.rememberMe") }}
                  </el-checkbox>

                  <el-link type="primary" :underline="false" class="forget-password" href="/forget-password"
                    target="_self">
                    {{ t("login.forgetPassword") }}
                  </el-link>
                </div>

                <el-button :loading="loading" type="primary" size="large" class="login-btn"
                  @click.prevent="handleLoginSubmit">
                  {{ t("login.login") }}
                </el-button>
                <!-- <div class="footer">
                <div class="switch-btn">验证码登录</div>
              </div> -->
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LocationQuery, useRoute } from "vue-router";
import router from "@/router";
import type { FormInstance } from "element-plus";
import { Themes } from "@/enums/Themes";

import { useSettingsStore } from "@/store";
import {
  useUserStore,
} from "@eimsnext/store";
import { LoginRequest } from "@eimsnext/services";
import { useLocale } from "element-plus";

const { t } = useLocale();

const userStore = useUserStore();
const settingsStore = useSettingsStore();

const route = useRoute();
const loginFormRef = ref<FormInstance>();

const isDark = ref(settingsStore.theme === Themes.DARK); // 是否暗黑模式
const loading = ref(false); // 按钮 loading 状态
const isCapslock = ref(false); // 是否大写锁定

const loginData = ref<LoginRequest>({
  username: "admin@eimsnext.com",
  password: "123456",
  grant_type: "password",
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 8,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
  };
});

// 登录
async function handleLoginSubmit() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      userStore
        .login(loginData.value)
        .then(async () => {
          await userStore.initialize(true);

          const { path, queryParams } = parseRedirect();
          router.push({ path: path, query: queryParams });
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

/**
 * 解析 redirect 字符串 为 path 和  queryParams
 *
 * @returns { path: string, queryParams: Record<string, string> } 解析后的 path 和 queryParams
 */
function parseRedirect(): {
  path: string;
  queryParams: Record<string, string>;
} {
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

// 主题切换
const toggleTheme = () => {
  const newTheme = settingsStore.theme === Themes.DARK ? Themes.LIGHT : Themes.DARK;
  settingsStore.changeTheme(newTheme);
};

// 检查输入大小写
function checkCapslock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapslock.value = event.getModifierState("CapsLock");
  }
}
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
      width: var(--et-size-320);

      .login-title {
        font-size: var(--et-font-size-32);
        font-weight: 500;
        line-height: var(--et-line-height-48);
      }

      .login-register {
        font-size: var(--et-font-size-14);
        line-height: var(--et-line-height-20);
        margin: var(--et-space-10) 0 var(--et-space-40);
      }

      .login-form>.login-form-item {
        margin-top: var(--et-space-16);
        height: var(--et-size-40);
      }

      .login-form > .login-form-item.first-item {
        margin-top: 0;
      }

      .login-options {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        margin-top: var(--et-space-12);

        .forget-password {
          flex: auto;
          justify-content: flex-end;
        }
      }

      .login-btn {
        margin-top: var(--et-space-28);
        width: 100%;
      }
    }
  }
}

html.dark {
  .login {
    background: url("@/assets/images/login/login-background-dark.jpg") no-repeat center right;

    .login-content {
      background: transparent;
      box-shadow: var(--el-box-shadow);
    }
  }
}
</style>
