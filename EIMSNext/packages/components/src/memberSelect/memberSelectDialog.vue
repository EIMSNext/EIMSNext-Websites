<template>
  <et-dialog :model-value="modelValue" class="member-select-dialog" title="部门成员列表" destroy-on-close width="750px"
    @cancel="cancel" @ok="save">
    <div style="padding: 12px 20px">
      <member-select v-model="tagsRef" :showTabs="showTabs" :showCascade="showCascade" :multiple="multiple"
        :limit="limit" :dynamicMembers="dynamicMembers" />
    </div>
    <template #footer-left>
      <el-button @click="openLink">通讯录</el-button>
    </template>
  </et-dialog>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { ref, reactive, onBeforeMount } from "vue";
import { ISelectedTag, TagType } from "../selectedTags/type";
import { IMemberLimit, MemberTabs } from "./type";

defineOptions({
  name: "MemberSelectDialog",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    tags: ISelectedTag[];
    showTabs?: MemberTabs | number,
    showCascade?: boolean;
    multiple?: boolean;
    limit?: IMemberLimit;
    dynamicMembers?: ISelectedTag[];
  }>(),
  {
    showTabs: 7,
    showCascade: false,
    multiple: true
  }
);

const tagsRef = ref<ISelectedTag[]>([
  { id: "none", label: "", type: TagType.None },
]);

onBeforeMount(() => {
  if (props.tags && props.tags.length > 0) {
    props.tags.forEach((x) => {
      if (x.type != TagType.None) tagsRef.value.push(x);
    });
  }
});

const openLink = () => {
  window.open(`${location.origin}/#/system/department`, "_blank");
};

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const save = () => {
  emit(
    "ok",
    tagsRef.value.filter((x) => x.type != TagType.None)
  );
};
</script>
