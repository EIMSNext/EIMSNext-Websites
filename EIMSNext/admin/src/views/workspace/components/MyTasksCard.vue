<template>
  <et-card :showHeader="false">
    <div class="flow-center-wrapper">
      <div class="my-todo">
        <div class="todo-wrapper" @click="goToMyTasks">
          <div class="image-wrapper">
            <et-icon icon="icon-mytodo" size="64px" color="#1296db" />
          </div>
          <div class="todo-count">
            <div class="todo-count-text">{{ t("common.wfProcess.mytasks") }}</div>
            <div class="todo-count-number">33</div>
          </div>
        </div>
      </div>
      <el-divider direction="vertical" style="height: 100px;" />
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
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const { t } = useI18n()
const router = useRouter();

defineOptions({
  name: "MyTasksCard",
});

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
</script>
<style lang="scss" scoped>
.flow-center-wrapper {
  align-items: center;
  border-radius: 6px;
  display: flex;
  min-height: 160px;
  position: relative;
  width: 100%;

  .my-todo {
    border-radius: 6px;
    height: 100%;
    padding: 20px;
    width: 32%;

    .todo-wrapper {
      align-items: center;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      height: 100%;
      justify-content: center;

      &:hover {
        background-color: var(--et-bg-color-primary);
      }

      .image-wrapper {
        margin-right: 40px;
        width: 64px;
      }

      .todo-count {
        .todo-count-text {
          font-size: 18px;
          font-weight: 500;
          height: 24px;
          line-height: 24px;
          margin-bottom: 5px;
        }

        .todo-count-number {
          font-size: 36px;
          font-weight: 700;
          height: 36px;
          line-height: 36px;
        }
      }
    }
  }

  .flow-steps {
    border-radius: 6px;
    display: flex;
    height: 96px;
    justify-content: space-between;
    width: 68%;

    .step-wrapper {
      align-items: center;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 0;
      width: 23%;

      &:hover {
        background-color: var(--et-bg-color-primary);
      }

      .step-image {
        height: 40px;
        color: #1296db;
      }
    }
  }
}
</style>
