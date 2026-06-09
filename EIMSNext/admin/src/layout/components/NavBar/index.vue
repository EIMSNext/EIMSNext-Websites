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
          <router-link class="platform-item" to="/workspace">
            <div class="platform-icon platform-icon--workspace">
              <et-icon icon="homepage" size="24" />
            </div>
            <div class="platform-title">{{ $t("admin.shell.workspace") }}</div>
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
        </div>
      </el-popover>
    </div>
    <!-- 导航栏右侧 -->
    <NavbarRight />
  </div>
</template>

<script setup lang="ts"></script>

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

.platform-icon--workspace {
  background: color-mix(in srgb, #34d399 18%, white);
  color: #059669;
}

.platform-icon--knowledge {
  background: color-mix(in srgb, #f59e0b 18%, white);
  color: #d97706;
}

.platform-icon--open {
  background: color-mix(in srgb, #4f46e5 18%, white);
  color: #4338ca;
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
