<template>
  <div
    class="selected-tags"
    :class="{ clickable: editable }"
    style="overflow: auto; gap: 4px"
    @click.stop="editTag"
  >
    <template v-if="modelValue.length > 0">
      <el-tag
        v-for="tag in modelValue.filter((x) => x.type != TagType.None)"
        :key="tag.id"
        :closable="closable"
        :color="getTagBgColor(tag)"
        @close="removeTag(tag)"
        @click.stop="tagClick(tag)"
      >
        <et-icon
          icon="el-icon-UserFilled"
          icon-class="tag-icon"
          :color="getIconColor(tag)"
        ></et-icon>
        <el-text
          class="tag-label"
          :class="{ 'has-error': tag.error, 'no-padding': closable }"
          >{{ tag.label }}</el-text
        >
      </el-tag>
    </template>
    <template v-else>
      <div v-if="editable" class="empty-wrapper" @click.stop="editTag">
        <slot>
          <et-icon icon="el-icon-Plus"></et-icon>
          <span class="empty-text">{{ emptyText }}</span></slot
        >
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { reactive, ref, toRef } from "vue";
import { ISelectedTag, TagType } from "./type";

defineOptions({
  name: "SelectedTags",
});

const props = withDefaults(
  defineProps<{
    modelValue: ISelectedTag[];
    closable?: boolean;
    editable?: boolean;
    emptyText?: string;
  }>(),
  {
    closable: false,
    editable: false,
  }
);

const tagsRef = toRef(props.modelValue);

const getTagBgColor = (tag: ISelectedTag) => {
  if (tag.error) return "#fdeeee";
  return "rgba(5,30,80,.04)";
};
const getIconColor = (tag: ISelectedTag) => {
  switch (tag.type) {
    case TagType.Employee:
      return "#00b899";
    default:
      return "#00b899";
  }
};

const emit = defineEmits(["update:modelValue", "tagRemoved", "editTag", "tagClick"]);
const removeTag = (tag: ISelectedTag) => {
  let index = tagsRef.value.indexOf(tag);
  tagsRef.value.splice(index, 1);

  emit("update:modelValue", tagsRef.value);
  emit("tagRemoved", tag);
};
const editTag = () => {
  if (props.editable) emit("editTag");
};
const tagClick = (tag: ISelectedTag) => {
  emit("tagClick", tag);
};
</script>
