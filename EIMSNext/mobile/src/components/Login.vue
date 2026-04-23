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
          <span>{{ currentLang === 'zh-CN' ? '中文' : 'EN' }}</span>
        </div>
      </div>
    </div>
    <div class="login-content">
      <van-form ref="loginFormRef" @submit="handleLogin">
        <van-cell-group inset>
          <van-field
            v-model="loginData.username"
            name="username"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="loginData.password"
            type="password"
            name="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>
        <div class="login-btn">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { LoginRequest } from '@eimsnext/services'
import { mobileAuthService } from '@/services/mobileService'

const router = useRouter()

const currentLang = ref('zh-CN')
const loading = ref(false)
const isDark = ref(document.documentElement.classList.contains('dark'))
const loginData = ref<LoginRequest>({
  username: '',
  password: '',
  grant_type: 'password'
})

const toggleLang = () => {
  currentLang.value = currentLang.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('mobile-theme', isDark.value ? 'dark' : 'light')
}

const handleLogin = async () => {
  loading.value = true
  try {
    await mobileAuthService.login(loginData.value)
    showToast('登录成功')
    router.replace('/workspace')
  } catch {
    showToast('登录失败')
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
  padding: 0 20px;
}

.login-btn {
  margin-top: 24px;
  padding: 0 16px;
}
</style>
