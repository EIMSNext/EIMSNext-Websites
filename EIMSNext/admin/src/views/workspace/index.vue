<template>
  <Layout>
    <div class="workspace-container">
      <el-row :gutter="10" class="mt-5">
        <el-col :span="24">
          <MyTasksCard></MyTasksCard>
        </el-col>
      </el-row>
      <el-row :gutter="10" class="mt-5">
        <el-col :span="24">
          <MyAppsCard></MyAppsCard>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup lang="ts">
defineOptions({
  name: "Workspace",
  inheritAttrs: false,
});
import { useRouter } from "vue-router";
import Layout from "@/layout/index.vue";
import MyAppsCard from "./components/MyAppsCard.vue";

import { useUserStore, useAppStore, useFormStore, useContextStore } from "@eimsnext/store";

import MyTasksCard from "./components/MyTasksCard.vue";

const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();
const contextStore = useContextStore();
</script>

<style lang="scss" scoped>
.workspace-container {
  position: relative;
  padding: var(--et-space-24);

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }
}
</style>
