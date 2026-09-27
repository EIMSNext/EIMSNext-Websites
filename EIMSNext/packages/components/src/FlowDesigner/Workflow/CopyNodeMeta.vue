<template>
  <template v-if="ready">
    <MetaItemHeader
      :label="t('workflow.ccMember')"
      :required="true"
      :tips="t('workflow.maxApproverTips')"
    >
    </MetaItemHeader>
    <selected-tags
      v-model="selectedCandidateTags"
      :editable="true"
      :empty-text="t('comp.emptyMember')"
      @editTag="editTag"
    />
    <member-select-dialog
      v-model="showMemberDialog"
      :member-options="{
        showTabs:
          MemberTabs.Department |
          MemberTabs.EmployeeGroup |
          MemberTabs.Employee |
          MemberTabs.Dynamic,
        cascadedDept: true,
        showCascade: true,
        showContract: true,
      }"
      @ok="finishSelect"
    />
  </template>
</template>
<script lang="ts" setup>
import { inject, nextTick, ref } from "vue";
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
import { convertCandidateToTags, convertTagsToCandidates } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ISelectedTag } from "@/selectedTags/type";
import { MemberTabs } from "@/component";
const { t } = useLocale();

defineOptions({
  name: "CopyNodeMeta",
});

const ready = ref(false);
const flowContext = inject<IFlowContext>("flowContext")!;
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const showMemberDialog = ref(false);
const selectedCandidateTags = ref<ISelectedTag[]>([]);

const editTag = () => {
  showMemberDialog.value = true;
};
const finishSelect = (tags: ISelectedTag[]) => {
  activeData.value.metadata.copytoMeta!.approvalCandidates = convertTagsToCandidates(tags);

  selectedCandidateTags.value = tags;
  showMemberDialog.value = false;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContext.activeData;

    selectedCandidateTags.value = [];
    if (activeData.value.metadata.copytoMeta!.approvalCandidates) {
      let tags: ISelectedTag[] = [];
      activeData.value.metadata.copytoMeta!.approvalCandidates.forEach(
        (x: IApprovalCandidate) => tags.push(...convertCandidateToTags(x)),
      );
      selectedCandidateTags.value = tags;
    }

    ready.value = true;
  });
};

init();
</script>
