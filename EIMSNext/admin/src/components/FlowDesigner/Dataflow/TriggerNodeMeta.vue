<template>
  <MetaItemHeader :label="t('触发表单')" :required="true"></MetaItemHeader>
  <el-input v-model="formName" readonly size="default" style="width: 100%" />
  <MetaItemHeader class="mt-[8px]" :label="t('触发动作')" :required="true"></MetaItemHeader>
  <div class="trigger-header ml-[8px]">
    <div style="color: #eb5050; font-size: 12px">
      {{ t("选择触发动作") }}
    </div>
    <el-popover
      popper-class="data-triggers"
      placement="bottom"
      :show-arrow="false"
      width="200"
      trigger="click"
    >
      <div class="trigger-header">
        <!-- <div class="trigger-desc">{{ t("表单事件") }}</div> -->
        <div
          class="add-trigger"
          :class="{ notAllow: triggerBySubmit }"
          @click="addTrigger(EventType.Submitted)"
        >
          {{ t("提交数据时") }}
        </div>
        <template v-if="!usingFlow">
          <div
            class="add-trigger"
            :class="{ notAllow: triggerByUpdate }"
            @click="addTrigger(EventType.Modified)"
          >
            {{ t("修改数据时") }}
          </div>
          <div
            class="add-trigger"
            :class="{ notAllow: triggerByDelete }"
            @click="addTrigger(EventType.Removed)"
          >
            {{ t("删除数据时") }}
          </div>
        </template>
        <template v-if="usingFlow">
          <!-- <div class="trigger-desc">{{ t("审批事件") }}</div> -->
          <div
            class="add-trigger"
            :class="{ notAllow: triggerByApproved }"
            @click="addTrigger(EventType.Approved)"
          >
            {{ t("审批通过时") }}
          </div>
          <div
            class="add-trigger"
            :class="{ notAllow: triggerByRejected }"
            @click="addTrigger(EventType.Rejected)"
          >
            {{ t("审批驳回时") }}
          </div>
          <div
            class="add-trigger"
            :class="{ notAllow: triggerByApproving }"
            @click="addTrigger(EventType.Approving)"
          >
            {{ t("节点流转时") }}
          </div>
        </template>
      </div>
      <template #reference>
        <el-button class="btn-add-trigger">
          {{ "+ " + t("添加动作") }}
        </el-button>
      </template>
    </el-popover>
    <div class="item-triggers">
      <template v-for="(item, index) in triggerList">
        <div class="show-triggers">
          <div class="color-838892">{{ index == 0 ? t("当") : t("或") }}</div>
          <template v-if="item.id == EventType.Approving">
            <div style="flex-grow: 1; margin-left: 8px; display: flex">
              <div>{{ t("节点流转时") }}</div>
              <div style="flex: 1; margin: 0 5px; display: flex">
                <el-select
                  v-model="wfNodeId"
                  placeholder="请选择节点"
                  size="default"
                  style="flex: 1"
                  @change="onNodeInput"
                >
                  <el-option
                    v-for="item in nodeList"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                  />
                </el-select>
              </div>
              <el-select
                v-model="nodeAction"
                size="default"
                style="width: 100px; margin-right: 5px"
                @change="onActionInput"
              >
                <el-option
                  v-for="item in actionList"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                />
              </el-select>
            </div>
          </template>
          <template v-else>
            <div style="flex-grow: 1; margin-left: 8px">
              {{ t(item.title) }}
            </div>
          </template>

          <div class="ml-[8px]" @click="delTrigger(item.id)">
            <et-icon icon="el-icon-delete" class="btn-delete-trigger"></et-icon>
          </div>
        </div>
      </template>
    </div>
  </div>
  <MetaItemHeader class="mt-[12px]" :label="t('触发条件')" :required="true"></MetaItemHeader>
  <ConditionList
    v-model="condList"
    :formId="flowContext!.formId"
    @change="onCondInput"
  ></ConditionList>
</template>
<script lang="ts" setup>
import {
  IFlowData,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
  EventType,
} from "../FlowData";
import { IListItem } from "@eimsnext/components";
import { FormDef, WfDefinition } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { IConditionList } from "../../ConditionList/type";
import ConditionList from "../../ConditionList/index.vue";
import { uniqueId } from "@eimsnext/utils";
import { wfDefinitionService } from "@eimsnext/services";
import { ODataQuery } from "@/utils/query";
import buildQuery from "odata-query";
import { useLocale } from "element-plus";
import { buildWfNodeListItems } from "./type";
import MetaItemHeader from "../components/MetaItemHeader/index.vue";
const { t } = useLocale();

defineOptions({
  name: "TriggerNodeMeta",
});

const formStore = useFormStore();
const formRef = ref<FormDef>();
const formName = ref(t("未知表单"));
const usingFlow = ref(false);
const selectedTriggers = ref(0);
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(flowContextRef.activeData);
const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const wfFlowData = ref<IFlowData>();
const wfNodeId = ref("");
const nodeAction = ref("submit");
const nodeList = ref<IListItem[]>([]);
const actionList = ref<IListItem[]>([
  { id: "submit", label: "提交" },
  // { id: "return", label: "退回" },
]);

const triggerBySubmit = computed(() => {
  return (selectedTriggers.value & EventType.Submitted) == EventType.Submitted;
});
const triggerByUpdate = computed(() => {
  return (selectedTriggers.value & EventType.Modified) == EventType.Modified;
});
const triggerByDelete = computed(() => {
  return (selectedTriggers.value & EventType.Removed) == EventType.Removed;
});
const triggerByApproving = computed(() => {
  return (selectedTriggers.value & EventType.Approving) == EventType.Approving;
});
const triggerByApproved = computed(() => {
  return (selectedTriggers.value & EventType.Approved) == EventType.Approved;
});
const triggerByRejected = computed(() => {
  // console.log("com trigger");
  return (selectedTriggers.value & EventType.Rejected) == EventType.Rejected;
});

const triggerList = computed(() => {
  // console.log("com triggerList");

  const tList: any[] = [];

  if (triggerBySubmit.value) tList.push({ id: EventType.Submitted, title: t("提交数据时") });
  if (triggerByUpdate.value) tList.push({ id: EventType.Modified, title: t("修改数据时") });
  if (triggerByDelete.value) tList.push({ id: EventType.Removed, title: t("删除数据时") });
  if (triggerByApproving.value) tList.push({ id: EventType.Approving, title: t("节点流转时") });
  if (triggerByApproved.value) tList.push({ id: EventType.Approved, title: t("审批通过时") });
  if (triggerByRejected.value) tList.push({ id: EventType.Rejected, title: t("审批驳回时") });

  // console.log("trigger list", tList);
  return tList;
});

const addTrigger = (t: EventType) => {
  selectedTriggers.value = selectedTriggers.value | t;
  // console.log("triggers", selectedTriggers.value);

  activeData.value.metadata.triggerMeta!.eventType = selectedTriggers.value;
};
const delTrigger = (t: EventType) => {
  selectedTriggers.value = selectedTriggers.value ^ t;
  activeData.value.metadata.triggerMeta!.eventType = selectedTriggers.value;
};

const onCondInput = (list: IConditionList) => {
  activeData.value.metadata.triggerMeta!.condition = list;
};

const onNodeInput = (val: string) => {
  activeData.value.metadata.triggerMeta!.wfNodeId = val;
};
const onActionInput = (val: string) => {
  activeData.value.metadata.triggerMeta!.nodeAction = val;
};

onBeforeMount(() => {
  console.log("onBeforeMount");
  selectedTriggers.value = activeData.value.metadata.triggerMeta!.eventType ?? 0;
  condList.value = activeData.value.metadata.triggerMeta!.condition;
  wfNodeId.value = activeData.value.metadata.triggerMeta!.wfNodeId;
  nodeAction.value = activeData.value.metadata.triggerMeta!.nodeAction;

  formStore.get(flowContextRef.formId).then((form) => {
    formRef.value = form;
    if (form) {
      formName.value = form.name;
      usingFlow.value = form.usingWorkflow;
    } else {
      formName.value = t("未知表单");
    }

    if (usingFlow.value) {
      let query = buildQuery({ filter: { ExternalId: flowContextRef.formId, iscurrent: true } });
      wfDefinitionService.query<WfDefinition>(query).then((res) => {
        if (res && res.length > 0) {
          wfFlowData.value = JSON.parse(res[0].content);
          if (wfFlowData.value) {
            nodeList.value = buildWfNodeListItems(wfFlowData.value);
          }
        }
      });
    }
  });
});

// watch(
//   flowContextRef,
//   (newValue: IFlowContext) => {
//     // console.log("activeData", newValue.activeData.metadata);
//     activeData.value = newValue.activeData;
//     selectedTriggers.value = activeData.value.metadata.triggerMeta!.eventType ?? 0;
//     condList.value = activeData.value.metadata.triggerMeta!.condition;
//     wfNodeId.value = activeData.value.metadata.triggerMeta!.wfNodeId;
//     nodeAction.value = activeData.value.metadata.triggerMeta!.nodeAction;

//     formStore.get(newValue.formId).then((form) => {
//       formRef.value = form;
//       if (form) {
//         formName.value = form.name;
//         usingFlow.value = form.usingWorkflow;
//       } else {
//         formName.value = t("未知表单");
//       }

//       if (usingFlow.value) {
//         let query = buildQuery({ filter: { ExternalId: newValue.formId, iscurrent: true } });
//         wfDefinitionService.query<WfDefinition>(query).then((res) => {
//           if (res && res.length > 0) {
//             wfFlowData.value = JSON.parse(res[0].content);
//             if (wfFlowData.value) {
//               nodeList.value = buildWfNodeListItems(wfFlowData.value);
//             }
//           }
//         });
//       }
//     });
//   },
//   { immediate: true }
// );
</script>
