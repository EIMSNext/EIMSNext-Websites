<template>
  <et-dialog
    :model-value="modelValue"
    class="member-select-dialog no-head-divider no-foot-divider"
    :title="t('comp.memberSelectDialog.deptMemberList')"
    destroy-on-close
    width="750px"
    @cancel="cancel"
    @ok="save"
  >
    <div class="dialog-body">
      <member-select v-model="tagsRef" :options="memberOptions" />
    </div>
    <template #footer-left>
      <el-button v-if="memberOptions?.showContract" class="contact-link-btn" link @click="openLink"
        >{{ t("comp.memberSelectDialog.contacts") }}</el-button
      >
    </template>
  </et-dialog>
</template>
<script lang="ts" setup>
import "./style/index.scss";
import { ref, reactive, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import { ISelectedTag } from "../selectedTags/type";
import { IMemberLimit, IMemberSelectOptions, MemberTabs } from "./type";
import { DataItemType } from "@/common";

const { t } = useI18n();

defineOptions({
  name: "MemberSelectDialog",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    tags: ISelectedTag[];
    memberOptions?: IMemberSelectOptions;
  }>(),
  {},
);

const tagsRef = ref<ISelectedTag[]>([]);
const normalizeTags = (tags: unknown): ISelectedTag[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((x) => x.type != DataItemType.Unknown) as ISelectedTag[];
};

onBeforeMount(() => {
  tagsRef.value = normalizeTags(props.tags);
});

const openLink = () => {
  window.open(`${location.origin}/#/system/department`, "_blank");
};

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  tagsRef.value = normalizeTags(props.tags);
  emit("update:modelValue", false);
  emit("cancel");
};
const save = () => {
  emit(
    "ok",
    tagsRef.value.filter((x) => x.type != DataItemType.Unknown),
  );
};
</script>

<style scoped></style>
