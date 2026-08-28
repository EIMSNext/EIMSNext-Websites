<template>
  <div class="login">
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
          <div class="account-login">
            <div class="login-title">{{ t("login.loginTitle") }}</div>
            <div class="login-register"><span>{{ t("login.noAccount") }}</span>
              <el-link type="primary" underline="never" href="/register" target="_self">
                {{ t("login.registerNow") }}
              </el-link>
            </div>
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
                  <div v-if="isCapslock" class="capslock-tip">{{ t("login.capsLock") }}</div>
                </div>
                <div class="login-options">
                  <el-checkbox>
                    {{ t("login.rememberMe") }}
                  </el-checkbox>

                  <el-link type="primary" underline="never" class="forget-password" href="/#/forget-password"
                    target="_self">
                    {{ t("login.forgetPassword") }}
                  </el-link>
                </div>

                <el-button :loading="loading" type="primary" size="large" class="login-btn"
                  @click.prevent="handleLoginSubmit">
                  {{ t("login.login") }}
                </el-button>
                <div class="integration-login">
                  <div class="integration-title">第三方登录</div>
                  <div class="integration-list">
                    <button v-for="item in integrationItems" :key="item.type" type="button"
                      class="integration-item" :class="item.className" @click="handleIntegrationLogin(item.type)">
                      <span class="integration-short">{{ item.shortLabel }}</span>
                      <span class="integration-name">{{ item.label }}</span>
                    </button>
                  </div>
                </div>
                <!-- <div class="footer">
                <div class="switch-btn">{{ t("admin.loginExtra.codeLogin") }}</div>
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
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { Themes } from "@/enums/Themes";

import { useSettingsStore } from "@/store";
import {
  useUserStore,
} from "@eimsnext/store";
import { LoginRequest } from "@eimsnext/services";
import { identityService } from "@eimsnext/services";
import { useLocale } from "element-plus";
import { integrationLoginItems, type IntegrationLoginType } from "@/constants/integrationLogin";
import { createIntegrationState, getLoginRedirect } from "@/utils/integrationLogin";

const { t } = useLocale();

const userStore = useUserStore();
const settingsStore = useSettingsStore();

const route = useRoute();
const loginFormRef = ref<FormInstance>();

const isDark = ref(settingsStore.theme === Themes.DARK); // 是否暗黑模式
const loading = ref(false); // 按钮 loading 状态
const isCapslock = ref(false); // 是否大写锁定
const integrationItems = integrationLoginItems;

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
        .catch(() => {
          // The HTTP interceptor displays the server's business error.
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

async function handleIntegrationLogin(type: IntegrationLoginType) {
  try {
    const redirect = getLoginRedirect(route.query.redirect);
    const state = createIntegrationState(type, redirect);
    const result = await identityService.getIntegrationAuthorizationUrl(type, state);
    const authorizationUrl = result.authorizationUrl;
    if (!authorizationUrl) {
      throw new Error("该集成登录未启用或配置不完整");
    }

    window.location.href = authorizationUrl;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "第三方登录发起失败");
  }
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

      .capslock-tip {
        color: var(--el-color-warning);
        font-size: var(--et-font-size-12);
        line-height: var(--et-line-height-18);
        margin-top: var(--et-space-6);
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

      .integration-login {
        margin-top: var(--et-space-28);
      }

      .integration-title {
        color: var(--et-text-secondary);
        font-size: var(--et-font-size-13);
        line-height: var(--et-line-height-20);
        margin-bottom: var(--et-space-12);
      }

      .integration-list {
        display: grid;
        gap: var(--et-space-12);
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .integration-item {
        align-items: center;
        background: var(--et-bg-container);
        border: 1px solid var(--et-border-color);
        border-radius: var(--et-size-12);
        color: inherit;
        cursor: pointer;
        display: flex;
        gap: var(--et-space-10);
        padding: var(--et-space-12);
        text-align: left;
        transition: all 0.2s ease;
      }

      .integration-item:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-1px);
      }

      .integration-short {
        align-items: center;
        border-radius: 50%;
        color: #fff;
        display: inline-flex;
        font-size: var(--et-font-size-14);
        font-weight: 600;
        height: var(--et-size-32);
        justify-content: center;
        width: var(--et-size-32);
      }

      .integration-name {
        font-size: var(--et-font-size-14);
      }

      .integration-item.wechat .integration-short {
        background: #2aae67;
      }

      .integration-item.wxwork .integration-short {
        background: #3875f6;
      }

      .integration-item.feishu .integration-short {
        background: #00c2b8;
      }

      .integration-item.dingding .integration-short {
        background: #1677ff;
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
