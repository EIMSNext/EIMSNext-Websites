<template>
  <et-dialog :model-value="modelValue" class="member-select-dialog" title="部门成员列表" destroy-on-close width="750px"
    @cancel="cancel" @ok="save">
    <div style="padding: 12px 20px">
      <member-select v-model="tagsRef" :options="memberOptions" />
    </div>
    <template #footer-left>
      <el-button v-if="memberOptions?.showContract" @click="openLink">通讯录</el-button>
    </template>
  </et-dialog>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { ref, reactive, onBeforeMount } from "vue";
import { ISelectedTag } from "../selectedTags/type";
import { IMemberLimit, IMemberSelectOptions, MemberTabs } from "./type";
import { DataItemType } from "@/common";

defineOptions({
  name: "MemberSelectDialog",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    tags: ISelectedTag[];
    memberOptions?: IMemberSelectOptions
  }>(),
  {
  }
);

const tagsRef = ref<ISelectedTag[]>([]);
onBeforeMount(() => {
  tagsRef.value = (props.tags || []).filter(x => x.type != DataItemType.Unknown)
});


const openLink = () => {
  window.open(`${location.origin}/#/system/department`, "_blank");
};

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  tagsRef.value = (props.tags || []).filter(x => x.type != DataItemType.Unknown)
  emit("update:modelValue", false);
  emit("cancel");
};
const save = () => {
  emit(
    "ok",
    tagsRef.value.filter((x) => x.type != DataItemType.Unknown)
  );
};
</script>
