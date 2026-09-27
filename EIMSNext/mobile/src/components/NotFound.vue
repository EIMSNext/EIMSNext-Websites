<template>
  <main class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <button type="button" @click="router.replace('/workbench')">返回工作台</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

h1,
p {
  margin: 0;
}

button {
  min-height: 40px;
  padding: 0 16px;
}
</style>
