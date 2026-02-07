<template>
  <div class="selected-tags" :class="{ clickable: editable }" style="overflow: auto; gap: 4px" @click.stop="editTag">
    <template v-if="modelValue.length > 0">
      <el-tag v-for="tag in modelValue.filter((x) => x.type != TagType.None)" :key="tag.id" :closable="closable"
        :class="{ 'error-tag': tag.error }" @close="removeTag(tag)" @click.stop="tagClick(tag)">
        <div class="et-tag"> 
          <et-icon :icon="getTagIcon(tag)" icon-class="tag-icon"
            :color="getIconColor(tag)"></et-icon>
          <el-text class="tag-label" :class="{ 'has-error': tag.error, 'no-padding': closable }"
            :style="{ color: '#909399' }">{{ tag.label }}</el-text>
        </div>
      </el-tag>
    </template>
    <template v-else>
      <div v-if="editable" class="empty-wrapper" @click.stop="editTag">
        <slot>
          <et-icon icon="el-Plus"></et-icon>
          <span class="empty-text">{{ emptyText || t("comp.emptyMember") }}</span>
        </slot>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { reactive, ref, toRef } from "vue";
import { ISelectedTag, TagType } from "./type";
import { useLocale } from "element-plus";
const { t } = useLocale();

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

const tagsRef = toRef(props.modelValue ?? []);
const getTagIcon = (tag: ISelectedTag) => {
  let icon = tag.icon;
  if (!icon) {
    switch (tag.type) {
      case TagType.Department:
        icon = "icon-organization";
        break;
      case TagType.Role:
        icon = "icon-role";
        break;
      default:
        icon = "el-UserFilled";
        break
    }
  }
  // console.log("tag icon", tag, icon)
  return icon;
}
const getIconColor = (tag: ISelectedTag) => {
  switch (tag.type) {
    case TagType.Department:
      return "#46c26f";
    default:
      return "#46c26f";
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
<style lang="scss" scoped>
.et-tag {
  display: flex;
  align-items: center;
}
</style>
