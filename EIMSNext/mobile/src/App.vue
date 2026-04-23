<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@eimsnext/store'
import { appSetting } from '@eimsnext/utils'

const userStore = useUserStore()

onMounted(async () => {
  const token = localStorage.getItem(appSetting.tokenKey || 'jat')
  if (token) {
    try {
      await userStore.initialize()
    } catch {
      localStorage.removeItem(appSetting.tokenKey || 'jat')
    }
  }
})
</script>
