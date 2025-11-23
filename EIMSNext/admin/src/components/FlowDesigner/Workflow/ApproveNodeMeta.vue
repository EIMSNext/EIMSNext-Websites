<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('节点负责人')" :required="true" tips="最多选择100人"></MetaItemHeader>
    <el-select v-model="activeData.metadata.approveMeta!.approveMode" class="sub-item"
      style="width: 100%; margin-bottom: 8px">
      <el-option label="或签" :value="1" />
      <el-option label="会签" :value="2" />
    </el-select>
    <selected-tags v-model="selectedCandidateTags" :editable="true" :empty-text="'选择成员或部门'" @editTag="editTag" />
    <el-checkbox v-model="activeData.metadata.approveMeta!.enableCopyto" label="启用抄送" class="sub-item" />
    <member-select-dialog v-model="showMemberDialog" :tags="selectedCandidateTags" destroy-on-close
      @ok="finishSelect" />
  </template>
</template>
<script lang="ts" setup>
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  ApproveMode,
  CandidateType,
  IApprovalCandidate,
  IFlowNodeMetaData,
  createFlowNode,
} from "../FlowData";
import { ISelectedTag, TagType } from "@eimsnext/components";
import { useLocale } from "element-plus";
import { convertCandidateToTag, convertTagToCandidate } from "./type";
import MetaItemHeader from "../components/MetaItemHeader/index.vue";
const { t } = useLocale();

defineOptions({
  name: "ApproveNodeMeta",
});

const ready = ref(false)
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));
const showMemberDialog = ref(false);
const selectedCandidateTags = ref<ISelectedTag[]>([]);

const editTag = () => {
  showMemberDialog.value = true;
};
const finishSelect = (tags: ISelectedTag[]) => {
  //   console.log("sel tags", tags);
  // selectedCandidateTags.value = tags;
  let candidate: IApprovalCandidate[] = [];
  tags.forEach((x) => candidate.push(convertTagToCandidate(x)));
  activeData.value.metadata.approveMeta!.approvalCandidates = candidate;

  showMemberDialog.value = false;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;

    selectedCandidateTags.value = [];
    if (activeData.value.metadata.approveMeta!.approvalCandidates) {
      let tags: ISelectedTag[] = [];
      activeData.value.metadata.approveMeta!.approvalCandidates.forEach((x: IApprovalCandidate) =>
        tags.push(convertCandidateToTag(x))
      );
      selectedCandidateTags.value = tags;
    }

    ready.value = true
  })
}

init()

// watch(
//   flowContextRef,
//   (newValue: IFlowContext) => {
//     // console.log("activeData", newValue.activeData.metadata);
//     activeData.value = newValue.activeData;

//     selectedCandidateTags.value = [];
//     if (activeData.value.metadata.approveMeta!.approvalCandidates) {
//       let tags: ISelectedTag[] = [];
//       activeData.value.metadata.approveMeta!.approvalCandidates.forEach((x: IApprovalCandidate) =>
//         tags.push(convertCandidateToTag(x))
//       );
//       selectedCandidateTags.value = tags;
//     }
//   },
//   { immediate: true }
// );
</script>
