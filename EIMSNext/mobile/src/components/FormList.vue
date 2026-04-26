<template>
  <MobilePage @back="goBack">
    <template #title>
      <div class="app-header-title">
        <span class="app-title-icon">
          <img v-if="app?.icon" :src="app.icon" alt="" />
          <van-icon v-else name="apps-o" />
        </span>
        <span>{{ app?.name || "表单" }}</span>
      </div>
    </template>

    <div class="form-page">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="目录" name="forms">
          <div class="form-list-wrap">
            <van-search v-model="keyword" placeholder="输入名称来搜索" />
            <van-pull-refresh v-model="refreshing" @refresh="loadForms">
              <div class="form-list">
                <MobileCard
                  v-for="form in filteredForms"
                  :key="form.id"
                  class="form-item"
                  @click="goToFormData(form)"
                >
                  <div class="form-item-left">
                    <div class="form-icon">
                      <van-icon name="description" />
                    </div>
                    <div class="form-name">{{ form.name }}</div>
                  </div>
                  <van-icon name="arrow" />
                </MobileCard>
              </div>
            </van-pull-refresh>
          </div>
        </van-tab>

        <van-tab title="流程中心" name="workflow">
          <WorkflowTabs :embedded="true" :app-id="appId" />
        </van-tab>
      </van-tabs>
    </div>
  </MobilePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { App, FormDef } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import WorkflowTabs from "@/components/WorkflowTabs.vue";
import { appServiceMobile, formServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const appId = route.params.appId as string;

const activeTab = ref("forms");
const refreshing = ref(false);
const keyword = ref("");
const app = ref<App>();
const forms = ref<FormDef[]>([]);

const filteredForms = computed(() => {
  const search = keyword.value.trim().toLowerCase();
  if (!search) return forms.value;
  return forms.value.filter((item) => item.name.toLowerCase().includes(search));
});

const goBack = () => router.back();
const goToFormData = (form: FormDef) => router.push(`/app/${appId}/form/${form.id}`);

const loadApp = async () => {
  app.value = await appServiceMobile.get(appId);
};

const loadForms = async () => {
  forms.value = await formServiceMobile.query(appId);
  refreshing.value = false;
};

onMounted(() => {
  void Promise.all([loadApp(), loadForms()]);
});
</script>

<style scoped lang="scss">
.form-page {
  height: 100%;
}

.form-list-wrap {
  padding-bottom: 16px;
}

.form-list {
  padding: 12px;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.form-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--mobile-bg-page);
  color: #1677ff;
}

.form-name {
  color: var(--mobile-text-primary);
  font-size: 14px;
}

.app-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-title-icon {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
}
</style>
