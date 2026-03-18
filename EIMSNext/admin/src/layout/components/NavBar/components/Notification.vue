<template>
  <div class="middle-center">
    <el-badge class="middle-center" :offset="[-15, 18]" :is-dot="msgCnt > 0">
      <et-icon icon="el-Bell" />
    </el-badge>
  </div>
</template>

<script setup lang="ts">

let msgTimer: NodeJS.Timeout | null = null
const msgCnt = ref(1)

const queryMsgCount = async () => { }

onMounted(() => {
  queryMsgCount()

  // 1分钟 = 60 * 1000 毫秒
  msgTimer = setInterval(() => {
    queryMsgCount()
  }, 60 * 1000)
});


onBeforeUnmount(() => {
  if (msgTimer) {
    clearInterval(msgTimer)
    msgTimer = null
  }
})

</script>