<template>
  <div class="realtime-display" :class="{ 'long-format': setting.format.length > 20 }">
    <span>{{ displayValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/zh-cn";
import { IRealTimeSetting } from "./type";

const props = defineProps<{ setting: IRealTimeSetting }>();
const { locale } = useI18n();
const now = ref(Date.now());
let timer: number | undefined;

const displayValue = computed(() => {
  const localeName = locale.value.toLowerCase().startsWith("zh") ? "zh-cn" : "en";
  return dayjs(now.value).locale(localeName).format(props.setting.format);
});

onMounted(() => {
  now.value = Date.now();
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer);
});
</script>

<style scoped lang="scss">
.realtime-display {
  container-type: inline-size;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--et-space-8);
  box-sizing: border-box;
  color: var(--et-text-primary);
  line-height: 1.15;
  text-align: center;

  span {
    max-width: 100%;
    font-size: clamp(24px, 11cqw, 64px);
    overflow-wrap: anywhere;
  }

  &.long-format span {
    font-size: clamp(16px, 6cqw, 42px);
  }
}
</style>
