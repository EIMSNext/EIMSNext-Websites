<template>
  <el-dropdown trigger="click">
    <div class="middle-center">
      <user-avatar :avatar="userStore.currentUser.avatar" :label="userStore.currentUser.empName" />
    </div>
    <template #dropdown>
      <el-dropdown-menu class="user-profile-menu">
        <el-dropdown-item class="user-profile-summary" @click="doNothing">
          <div class="user-info">
            <div class="nickname">{{ userStore.currentUser.empName }}</div>
            <div class="user-corp">
              <div class="corp-name">{{ contextStore.corpName }}</div>
              <el-tag class="corp-tag">
                {{ userStore.currentUser.userType == UserType.CorpOwmer ? "我创建的" : "我加入的" }}
              </el-tag>
            </div>
          </div>
        </el-dropdown-item>
        <el-dropdown-item divided @click="handleOpenUserProfile">
          <div class="user-panel-item">
            <et-icon icon="el-setting" />
            <span class="item-text">{{ t("navbar.profile") }}</span>
          </div>
        </el-dropdown-item>
        <a target="_blank" href="https://gitee.com/eimsnext/EIMSNext-Websites">
          <el-dropdown-item>
            <div class="user-panel-item">
              <et-icon icon="el-link" />
              <span class="item-text">{{ t("navbar.source") }}</span>
            </div>
          </el-dropdown-item>
        </a>
        <a target="_blank" href="https://www.eimsnext.com">
          <el-dropdown-item>
            <div class="user-panel-item">
              <et-icon icon="el-house" />
              <span class="item-text">{{ t("navbar.homepage") }}</span>
            </div>
          </el-dropdown-item>
        </a>
        <el-dropdown-item divided @click="logout">
          <div class="user-panel-item">
            <et-icon icon="logout" />
            <span class="item-text">{{ t("navbar.logout") }}</span>
          </div>
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
import { CurrentUser, UserType } from "@eimsnext/models";
import { useUserStore, useContextStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
const { t } = useLocale();

const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const contextStore = useContextStore();
const route = useRoute();
const router = useRouter();

userStore.get().then((res: CurrentUser) => {
  if (!res) {
    router.push(`/login?redirect=${route.fullPath}`);
  }
});
const doNothing = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};
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
  ElMessageBox.confirm("确定退出系统吗？", "提示", {
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

<style lang="scss" scoped>
.user-info {
  width: 100%;

  .nickname {
    color: var(--et-text-primary);
    font-size: var(--et-font-size-18);
    font-weight: 600;
    line-height: var(--et-line-height-26);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-corp {
    align-items: center;
    display: flex;
    font-size: var(--et-font-size-12);
    justify-content: space-between;
    line-height: var(--et-line-height-20);

    .corp-name {
      color: var(--et-text-secondary);
      flex: auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .corp-tag {
      background: var(--et-bg-muted);
      border-radius: var(--et-radius-2);
      color: var(--et-text-primary);
      cursor: default;
      flex: none;
      font-size: var(--et-font-size-12);
      padding: 0 var(--et-space-4);
    }
  }
}

.user-panel-item {
  height: var(--et-size-22);
  width: 100%;
  display: flex;
  align-items: center;

  .item-text {
    margin-left: var(--et-space-3);
  }
}

.user-profile-menu {
  width: var(--et-size-260);
  padding: var(--et-space-6);
}

.user-profile-summary {
  cursor: default;
  color: var(--et-text-secondary) !important;
  background-color: var(--et-bg-container) !important;
}
</style>
