<template>
  <MetaItemHeader :label="t('dataflow.triggeringForm')" :required="true"></MetaItemHeader>
  <el-input v-model="formName" readonly size="default" style="width: 100%" />
  <MetaItemHeader class="mt-[8px]" :label="t('dataflow.trigger')" :required="true"></MetaItemHeader>
  <div class="trigger-header ml-[8px]">
    <el-popover popper-class="data-triggers" placement="bottom" :show-arrow="false" width="200" trigger="click">
      <div class="trigger-header">
        <!-- <div class="trigger-desc">{{ t("表单事件") }}</div> -->
        <div class="add-trigger" :class="{ notAllow: triggerBySubmit }" @click="addTrigger(EventType.Submitted)">
          {{ t("dataflow.addedRecord") }}
        </div>
        <template v-if="!usingFlow">
          <div class="add-trigger" :class="{ notAllow: triggerByUpdate }" @click="addTrigger(EventType.Modified)">
            {{ t("dataflow.updatedRecord") }}
          </div>
          <div class="add-trigger" :class="{ notAllow: triggerByDelete }" @click="addTrigger(EventType.Removed)">
            {{ t("dataflow.deletedRecord") }}
          </div>
        </template>
        <template v-if="usingFlow">
          <!-- <div class="trigger-desc">{{ t("审批事件") }}</div> -->
          <div class="add-trigger" :class="{ notAllow: triggerByApproved }" @click="addTrigger(EventType.Approved)">
            {{ t("dataflow.wfApproved") }}
          </div>
          <div class="add-trigger" :class="{ notAllow: triggerByRejected }" @click="addTrigger(EventType.Rejected)">
            {{ t("dataflow.wfRejected") }}
          </div>
          <div class="add-trigger" :class="{ notAllow: triggerByApproving }" @click="addTrigger(EventType.Approving)">
            {{ t("dataflow.wfNextNode") }}
          </div>
        </template>
      </div>
      <template #reference>
        <el-button class="btn-add-trigger">
          {{ "+ " + t("dataflow.addTrigger") }}
        </el-button>
      </template>
    </el-popover>
    <div class="item-triggers">
      <template v-for="(item, index) in triggerList">
        <div class="show-triggers">
          <div class="color-838892">{{ index == 0 ? t("dataflow.when") : t("dataflow.or") }}</div>
          <template v-if="item.id == EventType.Approving">
            <div style="flex-grow: 1; margin-left: 8px; display: flex">
              <div>{{ t("dataflow.wfNextNode") }}</div>
              <div style="flex: 1; margin: 0 5px; display: flex">
                <el-select v-model="wfNodeId" :placeholder="t('dataflow.selectNode')" size="default" style="flex: 1"
                  @change="onNodeInput">
                  <el-option v-for="item in nodeList" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
              </div>
              <el-select v-model="nodeAction" size="default" style="width: 100px; margin-right: 5px"
                @change="onActionInput">
                <el-option v-for="item in actionList" :key="item.id" :label="item.label" :value="item.id" />
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
  <MetaItemHeader class="mt-[12px]" :label="t('dataflow.triggerCondition')" :required="true"></MetaItemHeader>
  <ConditionList v-model="condList" :formId="flowContext!.formId" @change="onCondInput"></ConditionList>
</template>
<script lang="ts" setup>
import {
  computed,
  inject,
  nextTick,
  onBeforeMount,
  reactive,
  ref,
  watch,
} from "vue";
import {
  IFlowData,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
  EventType,
} from "../Common/FlowData";
import { FormDef, WfDefinition } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { FlagEnum, uniqueId } from "@eimsnext/utils";
import { wfDefinitionService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { useLocale } from "element-plus";
import { buildWfNodeListItems } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { IConditionList } from "@/ConditionList/type";
import { IListItem } from "@/list/type";
const { t } = useLocale();

defineOptions({
  name: "TriggerNodeMeta",
});

const formStore = useFormStore();
const formRef = ref<FormDef>();
const formName = ref(t(""));
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
  { id: "submit", label: t("dataflow.wfAction_Submit") },
  // { id: "return", label: t("dataflow.wfAction_Return") },
]);

const triggerBySubmit = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Submitted);
});
const triggerByUpdate = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Modified)
});
const triggerByDelete = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Removed)
});
const triggerByApproving = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Approving)
});
const triggerByApproved = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Approved)
});
const triggerByRejected = computed(() => {
  // console.log("com trigger");
  return FlagEnum.has(selectedTriggers.value, EventType.Rejected)
});

const triggerList = computed(() => {
  // console.log("com triggerList");

  const tList: any[] = [];

  if (triggerBySubmit.value)
    tList.push({ id: EventType.Submitted, title: t("dataflow.addedRecord") });
  if (triggerByUpdate.value)
    tList.push({ id: EventType.Modified, title: t("dataflow.updatedRecord") });
  if (triggerByDelete.value)
    tList.push({ id: EventType.Removed, title: t("dataflow.deletedRecord") });
  if (triggerByApproving.value)
    tList.push({ id: EventType.Approving, title: t("dataflow.wfNextNode") });
  if (triggerByApproved.value)
    tList.push({ id: EventType.Approved, title: t("dataflow.wfApproved") });
  if (triggerByRejected.value)
    tList.push({ id: EventType.Rejected, title: t("dataflow.wfRejected") });

  // console.log("trigger list", tList);
  return tList;
});

const addTrigger = (t: EventType) => {
  selectedTriggers.value = FlagEnum.add(selectedTriggers.value, t);
  // console.log("triggers", selectedTriggers.value);

  activeData.value.metadata.triggerMeta!.eventType = selectedTriggers.value;
};
const delTrigger = (t: EventType) => {
  selectedTriggers.value = FlagEnum.remove(selectedTriggers.value, t);
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
  selectedTriggers.value =
    activeData.value.metadata.triggerMeta!.eventType ?? 0;
  condList.value = activeData.value.metadata.triggerMeta!.condition;
  wfNodeId.value = activeData.value.metadata.triggerMeta!.wfNodeId;
  nodeAction.value = activeData.value.metadata.triggerMeta!.nodeAction;

  formStore.get(flowContextRef.formId).then((form) => {
    formRef.value = form;
    if (form) {
      formName.value = form.name;
      usingFlow.value = form.usingWorkflow;
    } else {
      formName.value = t("dataflow.unknownForm");
    }

    if (usingFlow.value) {
      let query = buildQuery({
        filter: { ExternalId: flowContextRef.formId, iscurrent: true },
      });
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
