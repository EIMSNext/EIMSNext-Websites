<template>
  <div class="navbar">
    <div class="navbar__left">
      <el-popover trigger="click" placement="bottom-start" :width="320" :show-arrow="false">
        <template #reference>
          <div class="platform-entry">
            <et-icon icon="el-Grid" size="24" />
          </div>
        </template>
        <div class="platform-popover">
          <router-link class="platform-item" to="/workbench">
            <div class="platform-icon platform-icon--workbench">
              <et-icon icon="homepage" size="24" />
            </div>
            <div class="platform-title">{{ $t("admin.shell.workbench") }}</div>
          </router-link>
          <div class="platform-item platform-item--disabled">
            <div class="platform-icon platform-icon--knowledge">
              <et-icon icon="el-Reading" size="24" />
            </div>
            <div>
              <div class="platform-title">{{ $t("admin.shell.knowledgeBase") }}</div>
              <div class="platform-desc">{{ $t("admin.shell.comingSoon") }}</div>
            </div>
          </div>
          <router-link class="platform-item" to="/open-platform/pluginstore">
            <div class="platform-icon platform-icon--open">
              <et-icon icon="el-Connection" size="24" />
            </div>
            <div class="platform-title">{{ $t("admin.shell.openPlatform") }}</div>
          </router-link>
          <router-link v-if="isPlatAdmin" class="platform-item" to="/platform-admin">
            <div class="platform-icon platform-icon--admin">
              <et-icon icon="el-Setting" size="24" />
            </div>
            <div class="platform-title">{{ $t("admin.platformAdmin.title") }}</div>
          </router-link>
        </div>
      </el-popover>
    </div>
    <!-- 导航栏右侧 -->
    <NavbarRight />
  </div>
</template>

<script setup lang="ts">
import { UserType } from "@eimsnext/models";
import { useUserStore } from "@eimsnext/store";

const userStore = useUserStore();
const isPlatAdmin = computed(() => userStore.currentUser.userType === UserType.PlatAdmin);
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: $navbar-height;
  background: var(--et-bg-container);

  &__left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: var(--et-size-50);
    line-height: var(--et-size-50);
    color: var(--et-text-primary);
    cursor: pointer;
    padding-left: var(--et-space-2);
  }
}

.platform-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--et-size-40);
  border-radius: 8px;

  &:hover {
    background: var(--et-bg-hover);
  }
}

.platform-popover {
  display: grid;
  gap: 10px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  text-decoration: none;
  color: var(--et-text-primary);
  border-radius: 8px;

  &:hover {
    background: var(--et-bg-hover);
  }
}

.platform-item--disabled {
  cursor: default;
}

.platform-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.platform-icon--workbench {
  background: var(--et-bg-success-soft);
  color: var(--et-color-success);
}

.platform-icon--knowledge {
  background: var(--et-bg-warning-soft);
  color: var(--et-color-warning);
}

.platform-icon--open {
  background: var(--et-bg-primary-soft);
  color: var(--et-color-primary);
}

.platform-icon--admin {
  background: var(--et-bg-danger-soft);
  color: var(--et-color-danger);
}

.platform-title {
  font-weight: 600;
}

.platform-desc {
  color: var(--et-text-secondary);
  font-size: 12px;
  margin-top: 4px;
}
</style>
