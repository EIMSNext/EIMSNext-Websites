<template>
  <MobilePage v-if="!embedded" title="流程中心" @back="goBack">
    <div class="workflow-page">
      <InnerWorkflowTabs
        :active-tab="activeTab"
        :app-id="appId"
        @change-tab="handleTabChange"
        @open-approval="goToApproval"
        @open-detail="goToDetail"
      />
    </div>
  </MobilePage>

  <div v-else class="workflow-page embedded-workflow">
    <InnerWorkflowTabs
      :active-tab="activeTab"
      :app-id="appId"
      @change-tab="handleTabChange"
      @open-approval="goToApproval"
      @open-detail="goToDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { WfTodo } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { todoServiceMobile, workflowServiceMobile } from "@/services/mobileService";

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
    appId?: string;
  }>(),
  {
    embedded: false,
    appId: "",
  }
);

const router = useRouter();
const route = useRoute();
const appId = computed(() => props.appId || (route.params.appId as string) || "");
const activeTab = ref<string>((route.query.tab as string) || "todo");

const goBack = () => router.back();
const goToApproval = (task: WfTodo) => router.push(`/wftodo/${task.id}`);
const goToDetail = (task: WfTodo) => router.push(`/app/${task.appId}/form/${task.formId}/${task.dataId}`);
const handleTabChange = (tab: string) => {
  activeTab.value = tab;
};

watch(
  () => route.query.tab,
  (value) => {
    if (typeof value === "string" && value) activeTab.value = value;
  }
);

const InnerWorkflowTabs = defineComponent({
  name: "InnerWorkflowTabs",
  components: { MobileCard },
  props: {
    activeTab: {
      type: String,
      required: true,
    },
    appId: {
      type: String,
      default: "",
    },
  },
  emits: ["change-tab", "open-approval", "open-detail"],
  setup(innerProps, { emit }) {
    const currentTab = ref(innerProps.activeTab);
    const refreshing = ref(false);
    const loading = ref(false);
    const list = ref<WfTodo[]>([]);

    watch(
      () => innerProps.activeTab,
      (value) => {
        currentTab.value = value;
        void load();
      },
      { immediate: true }
    );

    const load = async () => {
      loading.value = true;
      if (currentTab.value === "todo") {
        list.value = await todoServiceMobile.query(innerProps.appId || undefined, 0, 20);
      } else if (currentTab.value === "started") {
        list.value = await workflowServiceMobile.getMyStarted(innerProps.appId || undefined, 0, 20);
      } else if (currentTab.value === "approved") {
        list.value = await workflowServiceMobile.getApproved(innerProps.appId || undefined, 0, 20);
      } else {
        list.value = await workflowServiceMobile.getCced(innerProps.appId || undefined, 0, 20);
      }
      loading.value = false;
      refreshing.value = false;
    };

    onMounted(() => {
      void load();
    });

    return {
      currentTab,
      refreshing,
      loading,
      list,
      emit,
      load,
      openApproval: (task: WfTodo) => emit("open-approval", task),
      openDetail: (task: WfTodo) => emit("open-detail", task),
      switchTab: (name: string) => {
        currentTab.value = name;
        emit("change-tab", name);
      },
    };
  },
  template: `
    <van-tabs :active="currentTab" @update:active="switchTab">
      <van-tab title="我的待办" name="todo" />
      <van-tab title="我发起的" name="started" />
      <van-tab title="我处理的" name="approved" />
      <van-tab title="抄送我的" name="cced" />
    </van-tabs>
    <div class="workflow-list-wrap">
      <van-pull-refresh v-model="refreshing" @refresh="load">
        <div v-if="loading" class="workflow-empty">加载中...</div>
        <div v-else-if="list.length === 0" class="workflow-empty">暂无数据</div>
        <div v-else class="workflow-list">
          <MobileCard
            v-for="task in list"
            :key="task.id"
            class="workflow-card"
            @click="currentTab === 'todo' ? openApproval(task) : openDetail(task)"
          >
            <div class="workflow-card-header">
              <div class="workflow-form-name">{{ task.formName }}</div>
              <div class="workflow-time">{{ task.approveNodeStartTime || task.createTime || task.updateTime }}</div>
            </div>
            <div class="workflow-node">{{ task.approveNodeName || '流程记录' }}</div>
            <div class="workflow-starter">发起人：{{ task.starter?.label || '-' }}</div>
            <div class="workflow-brief">
              <div v-for="item in task.dataBrief?.slice(0, 2)" :key="item.field">{{ item.title }}：{{ item.value }}</div>
            </div>
          </MobileCard>
        </div>
      </van-pull-refresh>
    </div>
  `,
});
</script>

<style scoped lang="scss">
.workflow-page {
  height: 100%;
}

.embedded-workflow {
  padding-bottom: 16px;
}

.workflow-list-wrap {
  padding: 12px;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workflow-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.workflow-form-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--mobile-text-primary);
}

.workflow-time,
.workflow-node,
.workflow-starter,
.workflow-brief {
  font-size: 12px;
  color: var(--mobile-text-secondary);
}

.workflow-node {
  margin-bottom: 6px;
}

.workflow-starter {
  margin-bottom: 6px;
}

.workflow-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
}
</style>
