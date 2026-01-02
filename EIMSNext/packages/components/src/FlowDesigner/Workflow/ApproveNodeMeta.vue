<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('workflow.approver')" :required="true" :tips="t('workflow.maxApproverTips')">
    </MetaItemHeader>
    <el-select v-model="activeData.metadata.approveMeta!.approveMode" class="sub-item"
      style="width: 100%; margin-bottom: 8px">
      <el-option :label="t('workflow.orSign')" :value="1" />
      <el-option :label="t('workflow.counterSign')" :value="2" />
    </el-select>
    <selected-tags v-model="selectedCandidateTags" :editable="true" :empty-text="t('workflow.emptyMember')"
      @editTag="editTag" />
    <!-- <el-checkbox v-model="activeData.metadata.approveMeta!.enableCopyto" label="启用抄送" class="sub-item" /> -->
    <member-select-dialog v-model="showMemberDialog" :tags="selectedCandidateTags"
      :showTabs="MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee | MemberTabs.Dynamic"
      :dynamicMembers="dynamicMembers" destroy-on-close @ok="finishSelect" />
  </template>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  ApproveMode,
  CandidateType,
  IApprovalCandidate,
  IFlowNodeMetaData,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { convertCandidateToTag, convertTagToCandidate } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ISelectedTag, TagType } from "@/selectedTags/type";
import { MemberTabs } from "@/component";
const { t } = useLocale();

defineOptions({
  name: "ApproveNodeMeta",
});

const ready = ref(false)
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const showMemberDialog = ref(false);
const selectedCandidateTags = ref<ISelectedTag[]>([]);
const dynamicMembers = ref<ISelectedTag[]>([{ id: "starter", label: t('workflow.starter'), type: TagType.Dynamic, data: { id: "starter", label: t('workflow.starter') } }])

const editTag = () => {
  showMemberDialog.value = true;
};
const finishSelect = (tags: ISelectedTag[]) => {
  //   console.log("sel tags", tags);
  // selectedCandidateTags.value = tags;
  let candidate: IApprovalCandidate[] = [];
  tags.forEach((x) => candidate.push(convertTagToCandidate(x)));
  activeData.value.metadata.approveMeta!.approvalCandidates = candidate;

  selectedCandidateTags.value = tags;
  showMemberDialog.value = false;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;

    //TODO:添加更多动态审批人，比如表单中员工字段

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
