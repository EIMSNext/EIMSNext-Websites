<template>
  <MobilePage :title="t('mobile.notFound.title')" :backable="false">
    <div class="not-found">
      <van-empty :description="t('mobile.notFound.message')">
        <van-button type="primary" size="small" round @click="router.replace('/workbench')">
          {{ t("mobile.notFound.back") }}
        </van-button>
      </van-empty>
    </div>
  </MobilePage>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import MobilePage from "@/components/base/MobilePage.vue";

const router = useRouter();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.not-found {
  padding-top: 30vh;
}
</style>
