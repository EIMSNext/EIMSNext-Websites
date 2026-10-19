<template>
  <MobilePage :title="t('mobile.workbench.title')" @back="goBack">
    <template #right>
      <van-button class="lang-button" size="mini" plain @click="showLangSheet = true">
        {{ t("navbar.language") }}
      </van-button>
      <van-button class="logout-button" size="mini" plain type="danger" @click="showLogoutConfirm = true">
        {{ t("navbar.logout") }}
      </van-button>
    </template>
    <div class="workbench-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <MobileCard class="task-card" @click="goToMyTasks">
          <div class="task-main">
            <div class="task-icon">
              <van-icon name="clock-o" size="28" />
            </div>
            <div>
              <div class="task-title">{{ t("mobile.workbench.task") }}</div>
              <div class="task-count">{{ taskCount }}</div>
            </div>
          </div>
          <van-icon name="arrow" />
        </MobileCard>

        <MobileCard class="quick-actions">
          <div class="action-item" @click="goToMyStarted">
            <van-icon name="records" />
            <span>{{ t("mobile.workflow.started") }}</span>
          </div>
          <div class="action-item" @click="goToMyApproved">
            <van-icon name="passed" />
            <span>{{ t("mobile.workflow.approved") }}</span>
          </div>
          <div class="action-item" @click="goToMyCced">
            <van-icon name="share-o" />
            <span>{{ t("mobile.workflow.cced") }}</span>
          </div>
        </MobileCard>

        <div class="section-title">{{ t("mobile.workbench.myApps") }}</div>
        <div class="app-grid">
          <MobileCard
            v-for="app in apps"
            :key="app.id"
            class="app-item"
            @click="gotoApp(app)"
          >
            <div class="app-icon" :style="{ backgroundColor: getAppIconColor(app) }">
              <img v-if="isImageIcon(app.icon)" :src="app.icon" alt="" />
              <van-icon v-else name="apps-o" size="24" />
            </div>
            <div class="app-name">{{ app.name }}</div>
          </MobileCard>
        </div>
      </van-pull-refresh>
    </div>
  </MobilePage>

  <van-action-sheet
    v-model:show="showLangSheet"
    :actions="langActions"
    :cancel-text="t('common.cancel')"
    close-on-click-action
    @select="onLangSelect"
  />

  <van-dialog
    v-model:show="showLogoutConfirm"
    :title="t('shell.logoutTitle')"
    :message="t('shell.logoutConfirm')"
    show-cancel-button
    @confirm="handleLogout"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Locale, showToast } from "vant";
import enUS from "vant/es/locale/lang/en-US";
import zhCN from "vant/es/locale/lang/zh-CN";
import type { AppDef } from "@eimsnext/models";
import { useUserStoreHook } from "@eimsnext/store";
import { buildPortalAuthUrl } from "@eimsnext/utils";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { appServiceMobile, taskServiceMobile } from "@/services/mobileService";

const router = useRouter();
const { t, locale } = useI18n();
const refreshing = ref(false);
const taskCount = ref(0);

// 语言切换：i18n + vant 内置文案 + localStorage（admin/portal 同 key）一次生效
const showLangSheet = ref(false);
const langActions = computed(() => [
  { name: "简体中文", key: "zh-CN", color: locale.value === "zh-CN" ? "var(--van-primary-color)" : undefined },
  { name: "English", key: "en", color: locale.value === "en" ? "var(--van-primary-color)" : undefined },
]);

const onLangSelect = (action: { key: string }) => {
  if (action.key === locale.value) return;
  locale.value = action.key;
  localStorage.setItem("language", action.key);
  Locale.use(action.key === "en" ? "en-US" : "zh-CN", action.key === "en" ? enUS : zhCN);
  showToast(t("langSelect.message.success"));
};
const apps = ref<AppDef[]>([]);
const showLogoutConfirm = ref(false);

const goBack = () => router.back();
const goToMyTasks = () => router.push("/wftask");
const goToMyStarted = () => router.push("/wftask?tab=started");
const goToMyApproved = () => router.push("/wftask?tab=approved");
const goToMyCced = () => router.push("/wftask?tab=cced");
const gotoApp = (app: AppDef) => router.push(`/app/${app.id}`);
const getAppIconColor = (app: AppDef) => app.iconColor || "var(--et-color-primary)";
const isImageIcon = (icon?: string) => /^(https?:|data:|blob:|\/)/i.test(icon || "");

const loadApps = async () => {
  apps.value = await appServiceMobile.getMyApps();
};

const loadTaskCount = async () => {
  taskCount.value = await taskServiceMobile.getCount();
};

// 与 PC 端一致：走 userStore.logout() -> identityService.logout()，
// 再跳 portal 失效其自身会话（否则下次进 portal 会自动回传 code 重新登录）
const handleLogout = async () => {
  try {
    await useUserStoreHook().logout();
  } catch {
    // userStore.logout 内部会清理本地 token，服务端拒绝（如 token 已过期）时忽略
  } finally {
    const portalLogout = buildPortalAuthUrl("logout", { redirectPath: "/" });
    if (portalLogout) {
      window.location.assign(portalLogout);
    } else {
      throw new Error("portalUrl is not configured; cannot logout");
    }
  }
};

const onRefresh = async () => {
  await Promise.all([loadApps(), loadTaskCount()]);
  refreshing.value = false;
};

onMounted(() => {
  void onRefresh();
});
</script>

<style scoped lang="scss">
.lang-button {
  padding: 0 8px;
  margin-right: 8px;
}

.logout-button {
  padding: 0 8px;
}

.workbench-content {
  padding: 12px;
}

.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.task-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--et-bg-primary-soft);
  color: var(--et-color-primary);
}

.task-title {
  color: var(--mobile-text-secondary);
  font-size: 13px;
}

.task-count {
  color: var(--mobile-text-primary);
  font-size: 24px;
  font-weight: 700;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: var(--mobile-text-secondary);
  font-size: 12px;
}

.section-title {
  margin-bottom: 10px;
  color: var(--mobile-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-height: 108px;
  justify-content: center;
}

.app-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: var(--el-color-white, #fff);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
}

.app-name {
  color: var(--mobile-text-primary);
  font-size: 13px;
  text-align: center;
  word-break: break-word;
}
</style>
