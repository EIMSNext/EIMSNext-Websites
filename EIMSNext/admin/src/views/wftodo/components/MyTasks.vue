<template>
  <div class="mytasks-container">
    <et-dialog
      v-model="showProcessDialog"
      class="formdatadialog"
      :title="selectedTask?.formName"
      :show-footer="false"
      width="800px"
      :destroy-on-close="true"
    >
      <div class="form-container">
        <WfProcess :todo="selectedTask!"></WfProcess>
      </div>
    </et-dialog>
    <el-space direction="vertical" class="task-space">
      <template v-for="task in dataRef">
        <et-card class="task-card" @click="processTodo(task)">
          <template #header>
            <div class="flex-y-center">
              <div class="flow-header">
                <div class="app-name" :title="task.formName">
                  <span>{{ task.formName }}</span>
                </div>
                <div class="current-node" :title="task.approveNodeName">
                  <et-icon icon="tree" />
                  <span class="node-name">{{ task.approveNodeName }}</span>
                </div>
              </div>
            </div>
            <div class="">
              <div class="flow-time">
                <span>{{ task.approveNodeStartTime }}</span>
              </div>
            </div>
          </template>
          <div class="flow-content">
            <div class="creator-info">
              <et-icon icon="el-user" size="14px"></et-icon>
              <span class="creator-name" :title="task.starter?.label">
                {{ task.starter?.label }}
              </span>
            </div>
            <ul class="flow-brief">
              <template v-for="item in task.dataBrief.filter((x, i) => i < 3)">
                <li class="brief-item">
                  <div class="brief-label">{{ item.title }}</div>
                  <span class="sep">：</span>
                  <div class="brief-val">{{ item.value }}</div>
                </li>
              </template>
            </ul>
            <ul class="flow-brief">
              <template v-for="item in task.dataBrief.filter((x, i) => i > 2)">
                <li class="brief-item">
                  <div class="brief-label">{{ item.title }}</div>
                  <span class="sep">：</span>
                  <div class="brief-val">{{ item.value }}</div>
                </li>
              </template>
            </ul>
          </div>
        </et-card>
      </template>
    </el-space>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: "MyTasks",
});

import { useRoute } from "vue-router";
import { WfTodo } from "@eimsnext/models";
import { wfTodoService } from "@eimsnext/services";
import { ODataQuery } from "@/utils/query";
import { EtDialog } from "@eimsnext/components";
import buildQuery from "odata-query";
import WfProcess from "./WfProcess.vue";

const showProcessDialog = ref(false);
const route = useRoute();
const appId = route.params.appId.toString();
const totalRef = ref(0);
const dataRef = ref<WfTodo[]>();
const selectedTask = ref<WfTodo>();

const queryParams = reactive<ODataQuery<any>>({
  skip: 0,
  top: 10,
});

const loadCount = () => {
  let query = buildQuery({ filter: { appId: appId } });

  wfTodoService.count(query).then((cnt: number) => {
    totalRef.value = cnt;
  });
};
const loadData = () => {
  let query = buildQuery({ filter: { appId: appId } });
  wfTodoService.query<WfTodo>(query).then((res: WfTodo[]) => {
    dataRef.value = res;
  });
};

const processTodo = async (task: WfTodo) => {
  selectedTask.value = task;
  showProcessDialog.value = true;
};

onMounted(() => {
  loadCount();
  loadData();
});
</script>
<style lang="scss" scoped>
.mytasks-container {
  display: flex;

  .task-space {
    width: 100%;
    align-items: normal !important;
  }

  .task-card {
    cursor: pointer;
    width: 100%;

    .flow-header {
      display: flex;

      .app-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .current-node {
        color: var(--et-text-secondary);
        font-size: var(--et-font-size-12);
        margin-left: var(--et-space-12);
        width: fit-content;
        display: flex;
        align-items: center;

        .node-name {
          margin-left: var(--et-space-5);
        }
      }
    }

    .flow-content {
      display: flex;
      font-size: var(--et-font-size-13);
      padding: var(--et-space-10) var(--et-space-20);

      .creator-info {
        align-self: center;
        flex-shrink: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 20%;
        display: flex;
        align-items: center;

        .creator-name {
          margin-left: var(--et-space-5);
        }
      }

      .flow-brief {
        flex-shrink: 0;
        height: var(--et-size-72);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 34%;

        .brief-item {
          align-items: center;
          display: flex;
          font-size: var(--et-font-size-13);
          height: var(--et-size-24);
          line-height: var(--et-line-height-22);
          padding: 0 var(--et-space-12);

          .brief-label {
            color: var(--et-text-secondary);
            display: inline-block;
            flex: none;
            max-width: var(--et-size-100);
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: top;
            white-space: nowrap;
          }

          .sep {
            color: var(--et-text-secondary);
          }

          .brief-val {
            display: inline-block;
            flex: auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
