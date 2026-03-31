<template>
  <div class="mytasks-container">
    <et-dialog
      v-model="showDetailsDialog"
      class="formdatadialog"
      :title="selectedTask?.formName"
      :show-footer="false"
      width="800px"
      :destroy-on-close="true"
    >
      <div class="form-container">
        <WfApprovalLogView :approvalLog="selectedTask!"></WfApprovalLogView>
      </div>
    </et-dialog>
    <el-space direction="vertical" class="task-space">
      <template v-for="task in dataRef">
        <et-card class="task-card" @click="viewLog(task)">
          <template #header>
            <div class="flex-y-center">
              <div class="flow-header">
                <div class="app-name" :title="task.formName">
                  <span>{{ task.formName }}</span>
                </div>
                <div class="current-node" :title="task.nodeName">
                  <et-icon icon="tree" />
                  <span class="node-name">{{ task.nodeName }}</span>
                </div>
              </div>
            </div>
            <div class="">
              <div class="flow-time">
                <span>{{ task.approvalTime }}</span>
              </div>
            </div>
          </template>
          <div class="flow-content">
            <div class="creator-info">
              <et-icon icon="el-user" size="14px"></et-icon>
              <span class="creator-name" :title="task.approver?.label">
                {{ task.approver?.label }}
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
  name: "WfApprovalLogs",
});

import { useRoute } from "vue-router";
import { ref, reactive, onMounted, watch } from "vue";
import { useFormStore } from "@eimsnext/store";
import { ApproveAction, BriefField, WfApprovalLog } from "@eimsnext/models";
import { wfApprovalLogService } from "@eimsnext/services";
import { ODataQuery } from "@/utils/query";
import { EtDialog } from "@eimsnext/components";
import buildQuery from "odata-query";
import WfApprovalLogView from "./WfApprovalLogView.vue";

const props = withDefaults(
  defineProps<{
    filter: any;
  }>(),
  {}
);

const showDetailsDialog = ref(false);
const route = useRoute();
const formStore = useFormStore();
const totalRef = ref(0);
const dataRef = ref<WfApprovalLog[]>([]);
const selectedTask = ref<WfApprovalLog>();
const filterRef = ref(props.filter);

watch(
  () => props.filter,
  (newFilter) => {
    filterRef.value = { ...newFilter };
    updateFilterWithAppId();
    loadCount();
    loadData();
  },
  { deep: true }
);

const getAppId = () => {
  const appIdFromParams = route.params.appId;
  const appIdFromQuery = route.query.appId;
  return appIdFromParams?.toString() || appIdFromQuery?.toString();
};

const updateFilterWithAppId = () => {
  const appId = getAppId();
  if (appId) {
    filterRef.value.appId = appId;
  } else {
    delete filterRef.value.appId;
  }
};

updateFilterWithAppId();

const queryParams = reactive<ODataQuery<any>>({
  skip: 0,
  top: 10,
});

const loadCount = () => {
  let query = buildQuery({ filter: filterRef.value });

  wfApprovalLogService.count(query).then((cnt: number) => {
    totalRef.value = cnt;
  });
};

const loadData = () => {
  let query = buildQuery({ filter: filterRef.value });
  wfApprovalLogService
    .query<WfApprovalLog>(query)
    .then((res: WfApprovalLog[]) => {
      dataRef.value = res;
    })
    .catch((error: any) => {
      console.error("loadData error:", error);
    });
};

const viewLog = async (task: WfApprovalLog) => {
  selectedTask.value = task;
  showDetailsDialog.value = true;
};

watch(
  () => [route.params.appId, route.query.appId],
  () => {
    updateFilterWithAppId();
    loadCount();
    loadData();
  },
  { immediate: true }
);

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
