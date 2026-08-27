<template>
  <div class="login-page">
    <div class="login-header">
      <div class="brand-wrap">
        <div class="header-title">EIMS</div>
      </div>
      <div class="header-actions">
        <div class="theme-switch" @click="toggleTheme">
          <van-icon :name="isDark ? 'moon-o' : 'sun-o'" />
        </div>
        <div class="lang-switch" @click="toggleLang">
          <span>{{ nextLangLabel }}</span>
        </div>
      </div>
    </div>
    <div class="login-content">
      <van-form class="login-form" @submit="handleLogin">
        <van-cell-group inset>
          <van-field
            v-model="loginData.username"
            name="username"
            :placeholder="t('mobile.login.usernamePlaceholder')"
            :rules="[{ required: true, message: t('mobile.login.usernameRequired') }]"
          />
          <van-field
            v-model="loginData.password"
            type="password"
            name="password"
            :placeholder="t('mobile.login.passwordPlaceholder')"
            :rules="[{ required: true, message: t('mobile.login.passwordRequired') }]"
          />
        </van-cell-group>
        <div class="login-btn">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            {{ t("mobile.login.submit") }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Locale, showToast } from 'vant'
import enUS from 'vant/es/locale/lang/en-US'
import zhCN from 'vant/es/locale/lang/zh-CN'
import { useI18n } from 'vue-i18n'
import type { LoginRequest } from '@eimsnext/services'
import { mobileIdentityService } from '@/services/mobileService'
import { toggleDarkMode } from '@eimsnext/utils'
import { useUserStoreHook } from '@eimsnext/store'

const router = useRouter()
const { t, locale } = useI18n()

const currentLang = ref(locale.value === 'en' ? 'en' : 'zh-CN')
const loading = ref(false)
const isDark = ref(document.documentElement.classList.contains('dark'))
const loginData = ref<LoginRequest>({
  username: '',
  password: '',
  grant_type: 'password'
})

const nextLangLabel = computed(() =>
  currentLang.value === 'zh-CN' ? 'EN' : '中文'
)

const setVantLocale = (lang: string) => {
  Locale.use(lang === 'en' ? 'en-US' : 'zh-CN', lang === 'en' ? enUS : zhCN)
}

const toggleLang = () => {
  const nextLang = currentLang.value === 'zh-CN' ? 'en' : 'zh-CN'
  currentLang.value = nextLang
  locale.value = nextLang
  localStorage.setItem('language', nextLang)
  setVantLocale(nextLang)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  toggleDarkMode(isDark.value)
  localStorage.setItem('mobile-theme', isDark.value ? 'dark' : 'light')
}

const handleLogin = async () => {
  loading.value = true
  try {
    await mobileIdentityService.login(loginData.value)
    try {
      await useUserStoreHook().initialize(true)
    } catch (e) {
      console.warn('mobile login: userStore.initialize failed', e)
    }
    showToast(t('mobile.login.success'))
    const redirect = (router.currentRoute.value.query.redirect as string) || '/workbench'
    router.replace(redirect)
  } catch {
    showToast(t('mobile.login.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100%;
  background-color: var(--mobile-bg-card);
  display: flex;
  flex-direction: column;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;

  .brand-wrap {
    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--mobile-text-primary);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .theme-switch,
  .lang-switch {
    font-size: 14px;
    color: var(--mobile-text-secondary);
    cursor: pointer;
  }
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px 32px;
}

.login-btn {
  margin-top: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
