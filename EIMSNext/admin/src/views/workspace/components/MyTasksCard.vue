<template>
  <et-card :showHeader="false">
    <div class="flow-center-wrapper">
      <div class="my-todo">
        <div class="todo-wrapper" @click="goToMyTasks">
          <el-badge :is-dot="todoCount > 0" :offset="[-6, 14]">
            <div class="image-wrapper">
              <et-icon icon="icon-mytodo" size="64px" color="var(--et-color-info)" />
            </div>
          </el-badge>
          <div class="todo-count">
            <div class="todo-count-text">{{ t("common.wfProcess.mytasks") }}</div>
            <div class="todo-count-number">{{ todoCount }}</div>
          </div>
        </div>
      </div>
      <el-divider direction="vertical" class="tasks-divider" />
      <div class="flow-steps">
        <div class="step-wrapper" @click="goToMyStarted">
          <et-icon icon="icon-mystarted" size="40px" class="step-image" />
          <div class="step-text">{{ t("common.wfProcess.mystarted") }}</div>
        </div>
        <div class="step-wrapper" @click="goToMyApproved">
          <et-icon icon="icon-myapproved" size="40px" class="step-image" />
          <div class="step-text">{{ t("common.wfProcess.myapproved") }}</div>
        </div>
        <div class="step-wrapper" @click="goToMyCced">
          <et-icon icon="icon-mycced" size="40px" class="step-image" />
          <div class="step-text">{{ t("common.wfProcess.cctome") }}</div>
        </div>
        <div class="step-wrapper">
          <!-- <div class="step-text">待办委托</div> -->
        </div>
      </div>
    </div>
  </et-card>
</template>

<script setup lang="ts">
import { BADGE_REFRESH_INTERVAL, queryCorpTodoCount } from "@/utils/badge";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const { t } = useI18n();
const router = useRouter();
const todoCount = ref(0);
let todoTimer: ReturnType<typeof setInterval> | null = null;

defineOptions({
  name: "MyTasksCard",
});

const loadTodoCount = async () => {
  todoCount.value = await queryCorpTodoCount();
};

const goToMyTasks = () => {
  router.push("/mytasks");
};

// 跳转到我发起的页面
const goToMyStarted = () => {
  router.push("/mystarted");
};

const goToMyApproved = () => {
  router.push("/myapproved");
};

const goToMyCced = () => {
  router.push("/cctome");
};

onMounted(() => {
  loadTodoCount();

  todoTimer = setInterval(() => {
    loadTodoCount();
  }, BADGE_REFRESH_INTERVAL);
});

onBeforeUnmount(() => {
  if (todoTimer) {
    clearInterval(todoTimer);
    todoTimer = null;
  }
});
</script>
<style lang="scss" scoped>
.flow-center-wrapper {
  align-items: center;
  border-radius: var(--et-radius-6);
  display: flex;
  min-height: var(--et-size-160);
  position: relative;
  width: 100%;

  .my-todo {
    border-radius: var(--et-radius-6);
    height: 100%;
    padding: var(--et-space-20);
    width: 32%;

    .todo-wrapper {
      align-items: center;
      border-radius: var(--et-radius-6);
      cursor: pointer;
      display: flex;
      height: 100%;
      justify-content: center;

      &:hover {
        background-color: var(--et-bg-page);
      }

      .image-wrapper {
        margin-right: var(--et-space-40);
        width: var(--et-size-64);
      }

      .todo-count {
        .todo-count-text {
          font-size: var(--et-font-size-18);
          font-weight: 500;
          height: var(--et-size-24);
          line-height: var(--et-line-height-24);
          margin-bottom: var(--et-space-5);
        }

        .todo-count-number {
          font-size: var(--et-font-size-36);
          font-weight: 700;
          height: var(--et-size-36);
          line-height: var(--et-line-height-36);
        }
      }
    }
  }

  .flow-steps {
    border-radius: var(--et-radius-6);
    display: flex;
    height: var(--et-size-96);
    justify-content: space-between;
    width: 68%;

    .step-wrapper {
      align-items: center;
      border-radius: var(--et-radius-12);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 0;
      width: 23%;

      &:hover {
        background-color: var(--et-bg-page);
      }

      .step-image {
        height: var(--et-size-40);
        color: var(--et-color-info);
      }

      .step-text {
        margin-top: var(--et-space-20);
      }
    }
  }
}

.tasks-divider {
  height: var(--et-size-100);
}
</style>
