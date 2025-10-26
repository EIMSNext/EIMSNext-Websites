<template>
    <div class="mytasks-container">
        <et-dialog v-model="showDetailsDialog" :title="selectedTask?.formName" :show-footer="false"
            :destroy-on-close="true">
            <div class="form-container">
                <WfApprovalLogView :approvalLog="selectedTask!"> </WfApprovalLogView>
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
                            <et-icon icon="el-icon-user" size="14px"></et-icon>
                            <span class="creator-name" :title="task.approver?.empName">
                                {{ task.approver?.empName }}
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
import { useFormStore } from "@eimsnext/store";
import { ApproveAction, BriefField, WfApprovalLog } from "@eimsnext/models";
import { wfApprovalLogService } from "@eimsnext/services";
import { ODataQuery } from "@/utils/query";
import { EtDialog } from "@eimsnext/components";
import buildQuery from "odata-query";

const props = withDefaults(
    defineProps<{
        filter: any;
    }>(),
    {
    }
);

const showDetailsDialog = ref(false);
const route = useRoute();
const formStore = useFormStore();
const appId = route.params.appId.toString();
const totalRef = ref(0);
const dataRef = ref<WfApprovalLog[]>();
const selectedTask = ref<WfApprovalLog>()
const filterRef = ref(props.filter)
filterRef.value.appId = appId;

const queryParams = reactive<ODataQuery<any>>({
    skip: 0,
    top: 10,
});

const loadCount = () => {
    let query = buildQuery({ filter: filterRef.value });

    wfApprovalLogService.count(query).then((cnt: number) => {
        // console.log("cnt", cnt);
        totalRef.value = cnt;
    });
};
const loadData = () => {
    let query = buildQuery({ filter: filterRef.value });
    wfApprovalLogService.query<WfApprovalLog>(query).then((res: WfApprovalLog[]) => {
        dataRef.value = res;
    });
};
const viewLog = async (task: WfApprovalLog) => {
    selectedTask.value = task
    showDetailsDialog.value = true;
};
onMounted(() => {
    loadCount();
    loadData();
});
</script>
<style lang="scss" scoped>
.mytasks-container {
    padding: 20px;
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
                font-size: 15px;
                font-weight: 600;
                max-width: 50%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .current-node {
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-left: 12px;
                width: fit-content;
                display: flex;
                align-items: center;

                .node-name {
                    margin-left: 5px;
                }
            }
        }

        .flow-content {
            display: flex;
            font-size: 13px;
            padding: 10px 20px;

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
                    margin-left: 5px;
                }
            }

            .flow-brief {
                flex-shrink: 0;
                height: 72px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 34%;

                .brief-item {
                    align-items: center;
                    display: flex;
                    font-size: 13px;
                    height: 24px;
                    line-height: 22px;
                    padding: 0 12px;

                    .brief-label {
                        color: var(--color-text-secondary);
                        display: inline-block;
                        flex: none;
                        max-width: 100px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        vertical-align: top;
                        white-space: nowrap;
                    }

                    .sep {
                        color: var(--color-text-secondary);
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