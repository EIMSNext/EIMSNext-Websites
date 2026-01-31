<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('workflow.ccMember')" :required="true" :tips="t('workflow.maxApproverTips')">
    </MetaItemHeader>
    <selected-tags v-model="selectedCandidateTags" :editable="true" :empty-text="t('comp.emptyMember')"
      @editTag="editTag" />
    <member-select-dialog v-model="showMemberDialog" :member-options="{
      showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee | MemberTabs.Dynamic,
      cascadedDept: true, showCascade: true
    }" @ok="finishSelect" />
  </template>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  CandidateType,
  IApprovalCandidate,
  IFlowNodeMetaData,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { convertCandidateToTag, convertTagToCandidate } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ISelectedTag } from "@/selectedTags/type";
import { MemberTabs } from "@/component";
const { t } = useLocale();

defineOptions({
  name: "CopyNodeMeta",
});

const ready = ref(false)
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
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
  activeData.value.metadata.copytoMeta!.approvalCandidates = candidate;

  selectedCandidateTags.value = tags;
  showMemberDialog.value = false;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;

    selectedCandidateTags.value = [];
    if (activeData.value.metadata.copytoMeta!.approvalCandidates) {
      let tags: ISelectedTag[] = [];
      activeData.value.metadata.copytoMeta!.approvalCandidates.forEach((x: IApprovalCandidate) =>
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
//     if (activeData.value.metadata.copytoMeta!.approvalCandidates) {
//       let tags: ISelectedTag[] = [];
//       activeData.value.metadata.copytoMeta!.approvalCandidates.forEach((x: IApprovalCandidate) =>
//         tags.push(convertCandidateToTag(x))
//       );
//       selectedCandidateTags.value = tags;
//     }
//   },
//   { immediate: true }
// );
</script>
