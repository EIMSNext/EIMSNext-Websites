<template>
  <MobilePage title="工作台" @back="goBack">
    <div class="workspace-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <MobileCard class="todo-card" @click="goToMyTasks">
          <div class="todo-main">
            <div class="todo-icon">
              <van-icon name="clock-o" size="28" />
            </div>
            <div>
              <div class="todo-title">待办</div>
              <div class="todo-count">{{ todoCount }}</div>
            </div>
          </div>
          <van-icon name="arrow" />
        </MobileCard>

        <MobileCard class="quick-actions">
          <div class="action-item" @click="goToMyStarted">
            <van-icon name="records" />
            <span>我发起的</span>
          </div>
          <div class="action-item" @click="goToMyApproved">
            <van-icon name="passed" />
            <span>我已审批</span>
          </div>
          <div class="action-item" @click="goToMyCced">
            <van-icon name="share-o" />
            <span>抄送我的</span>
          </div>
        </MobileCard>

        <div class="section-title">我的应用</div>
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
import type { App } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { appServiceMobile, todoServiceMobile } from "@/services/mobileService";

const router = useRouter();
const refreshing = ref(false);
const todoCount = ref(0);
const apps = ref<App[]>([]);

const goBack = () => router.back();
const goToMyTasks = () => router.push("/wftodo");
const goToMyStarted = () => router.push("/wftodo?tab=started");
const goToMyApproved = () => router.push("/wftodo?tab=approved");
const goToMyCced = () => router.push("/wftodo?tab=cced");
const gotoApp = (app: App) => router.push(`/app/${app.id}`);

const loadApps = async () => {
  apps.value = await appServiceMobile.getMyApps();
};

const loadTodoCount = async () => {
  todoCount.value = await todoServiceMobile.getCount();
};

const onRefresh = async () => {
  await Promise.all([loadApps(), loadTodoCount()]);
  refreshing.value = false;
};

onMounted(() => {
  void onRefresh();
});
</script>

<style scoped lang="scss">
.workspace-content {
  padding: 12px;
}

.todo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.todo-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e8f3ff;
  color: #1677ff;
}

.todo-title {
  color: var(--mobile-text-secondary);
  font-size: 13px;
}

.todo-count {
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
