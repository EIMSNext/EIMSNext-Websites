<template>
  <div class="action-dialog-body">
    <MetaItemHeader :label="t('workflow.buttonText')" :required="true" />
    <el-input v-model="action.text" />

    <template v-if="supportsCandidates(action.actionType)">
      <MetaItemHeader
        class="candidate-header"
        :label="candidateLabel"
        :required="true"
      />
      <selected-tags
        v-model="candidateTags"
        :editable="true"
        :empty-text="t('comp.emptyMember')"
        @editTag="showMemberDialog = true"
      />
    </template>

    <template v-if="action.actionType === NodeActionType.Return">
      <MetaItemHeader
        class="candidate-header"
        :label="t('workflow.returnableNodes')"
        :required="true"
      />
      <el-select v-model="returnTargetMode" class="full-width-select">
        <el-option
          :label="t('workflow.returnPrevious')"
          :value="ReturnTargetMode.Previous"
        />
        <el-option
          :label="t('workflow.returnStart')"
          :value="ReturnTargetMode.Start"
        />
        <el-option
          :label="t('workflow.returnSpecified')"
          :value="ReturnTargetMode.Specified"
        />
      </el-select>
      <el-select
        v-if="returnTargetMode === ReturnTargetMode.Specified"
        v-model="returnTargetNodeId"
        class="full-width-select"
        :placeholder="t('workflow.selectReturnTargetNode')"
      >
        <el-option
          v-for="node in returnNodeOptions"
          :key="node.nodeId"
          :label="node.nodeName"
          :value="node.nodeId"
        />
      </el-select>
    </template>
  </div>

  <member-select-dialog
    v-model="showMemberDialog"
    :tags="candidateTags"
    :member-options="memberOptions"
    destroy-on-close
    @ok="finishMemberSelect"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useLocale } from "element-plus";
import {
  INodeActionConfig,
  NodeActionType,
  ReturnTargetMode,
} from "../Common/FlowData";
import { ISelectedTag } from "@/selectedTags/type";
import { convertCandidateToTags, convertTagsToCandidates } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";

const { t } = useLocale();

const props = defineProps<{
  action: INodeActionConfig;
  memberOptions?: any;
  returnNodeOptions?: Array<{ nodeId: string; nodeName: string }>;
}>();

const returnNodeOptions = computed(() => props.returnNodeOptions || []);

const returnTargetMode = computed<ReturnTargetMode>({
  get: () => props.action.returnSetting?.targetMode ?? ReturnTargetMode.Previous,
  set: (value) => {
    props.action.returnSetting = {
      ...(props.action.returnSetting || {}),
      targetMode: value,
    };
    if (value !== ReturnTargetMode.Specified) {
      delete props.action.returnSetting.targetNodeId;
    }
  },
});

const returnTargetNodeId = computed<string | undefined>({
  get: () => props.action.returnSetting?.targetNodeId,
  set: (value) => {
    props.action.returnSetting = {
      ...(props.action.returnSetting || {}),
      targetMode: ReturnTargetMode.Specified,
      targetNodeId: value,
    };
  },
});

const candidateTags = ref<ISelectedTag[]>([]);
const showMemberDialog = ref(false);

const candidateLabel = computed(() => {
  return props.action.actionType === NodeActionType.Transfer
    ? t("workflow.transferCandidates")
    : t("workflow.addSignCandidates");
});

const supportsCandidates = (actionType: NodeActionType) => {
  return (
    actionType === NodeActionType.AddSign ||
    actionType === NodeActionType.Transfer
  );
};

watch(
  () => props.action,
  (action) => {
    candidateTags.value = (action.candidates || []).flatMap(
      convertCandidateToTags
    );
  },
  { immediate: true },
);

const finishMemberSelect = (tags: ISelectedTag[]) => {
  candidateTags.value = tags;
  props.action.candidates = convertTagsToCandidates(tags);
  showMemberDialog.value = false;
};
</script>

<style scoped>
.action-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
  padding: var(--et-space-20);
}

.candidate-header {
  margin-top: var(--et-space-8);
}
</style>
