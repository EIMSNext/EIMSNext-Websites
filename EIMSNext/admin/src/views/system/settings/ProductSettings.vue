<template>
  <div class="product-settings">
    <h2>{{ $t("admin.systemSettings.productStyle.title") }}</h2>
    <SettingRow :label="$t('admin.workbench.customize')">
      <el-button @click="openWorkbenchCustomize">{{ $t("common.set") }}</el-button>
      <span>{{ $t("admin.systemSettings.productStyle.customWorkbenchTip") }}</span>
    </SettingRow>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import SettingRow from "./SettingRow.vue";

const router = useRouter();

const openWorkbenchCustomize = () => {
  router.push("/workbench/customize");
};
</script>

<style scoped lang="scss">
.product-settings {
  h2 {
    font-size: 17px;
    margin: 14px 0 22px;
    border-left: 4px solid var(--et-color-primary);
    padding-left: 10px;
  }
}
</style>
