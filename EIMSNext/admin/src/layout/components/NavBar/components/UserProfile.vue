<template>
  <el-dropdown trigger="click">
    <div class="middle-center">
      <template v-if="userStore.currentUser.avatar">
        <img :src="userStore.currentUser.avatar" class="rounded-full" />
      </template>
      <template v-else>
        <et-icon icon="el-icon-User" class="rounded-full"></et-icon>
      </template>
      <!-- <span>{{ userStore.currentUser.empName }}</span> -->
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>
          {{ userStore.currentUser.empName }}
        </el-dropdown-item>
        <el-dropdown-item @click="handleOpenUserProfile">
          {{ t("navbar.profile") }}
        </el-dropdown-item>
        <a target="_blank" href="https://gitee.com/eimsnext/EIMSNext-Websites">
          <el-dropdown-item>{{ t("navbar.gitee") }}</el-dropdown-item>
        </a>
        <a target="_blank" href="https://www.eimsnext.com">
          <el-dropdown-item>{{ t("navbar.document") }}</el-dropdown-item>
        </a>
        <el-dropdown-item divided @click="logout">
          {{ t("navbar.logout") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
defineOptions({
  name: "UserProfile",
});

import { useTagsViewStore } from "@/store";
import { CurrentUser } from "@eimsnext/models";
import { useUserStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
const { t } = useLocale();

const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

userStore.get().then((res: CurrentUser) => {
  if (!res) {
    router.push(`/login?redirect=${route.fullPath}`);
  }
});

/**
 * 打开个人中心页面
 */
function handleOpenUserProfile() {
  router.push({ name: "Profile" });
}

/**
 * 注销登出
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login`);
      });
  });
}
</script>

<style lang="scss" scoped></style>
