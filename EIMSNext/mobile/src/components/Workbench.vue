<template>
  <MobilePage :title="t('mobile.workbench.title')" @back="goBack">
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
            <div class="app-icon">
              <img v-if="app.icon" :src="app.icon" alt="" />
              <van-icon v-else name="apps-o" size="24" />
            </div>
            <div class="app-name">{{ app.name }}</div>
          </MobileCard>
        </div>
      </van-pull-refresh>
    </div>
  </MobilePage>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { AppDef } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { appServiceMobile, taskServiceMobile } from "@/services/mobileService";

const router = useRouter();
const { t } = useI18n();
const refreshing = ref(false);
const taskCount = ref(0);
const apps = ref<AppDef[]>([]);

const goBack = () => router.back();
const goToMyTasks = () => router.push("/wftask");
const goToMyStarted = () => router.push("/wftask?tab=started");
const goToMyApproved = () => router.push("/wftask?tab=approved");
const goToMyCced = () => router.push("/wftask?tab=cced");
const gotoApp = (app: AppDef) => router.push(`/app/${app.id}`);

const loadApps = async () => {
  apps.value = await appServiceMobile.getMyApps();
};

const loadTaskCount = async () => {
  taskCount.value = await taskServiceMobile.getCount();
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
  background: var(--mobile-bg-page);

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
