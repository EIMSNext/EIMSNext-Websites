<template>
  <div class="et-upload">
    <input
      type="file"
      :multiple="props.multiple"
      :accept="props.accept"
      ref="kIpt"
      @change="getFiles"
      v-show="false"
    />
    <div @click="fileUpload" v-if="!props.drag">
      <slot />
    </div>
    <Dragger v-else @getFilesList="getFilesList" @fileUpload="fileUpload" />
    <div class="et-upload-list">
      <div
        class="et-upload-list_item"
        v-for="(item, index) in filesList"
        :key="index"
      >
        <div class="et-upload-list_item-name">
          {{ item.name }}
        </div>
        <div class="et-upload-list_item-status-label">
          <et-icon icon="el-icon-Delete" @click="delFile(index)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./style/index.less";
import { ref } from "vue";
import EtIcon from "../icon/etIcon.vue";
import Dragger from "./dragger.vue";

export type Emits = {
  (e: "getFilesList", value: File[]): void;
};
defineOptions({
  name: "EtUpload",
});
type UploadType = {
  multiple?: boolean;
  accept?: string;
  drag?: boolean;
};
const props = defineProps<UploadType>();
const kIpt = ref();

const emits = defineEmits<Emits>();
const filesList = ref<File[]>([]);
const fileUpload = () => {
  kIpt.value.click();
};

const getFiles = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;

  filesList.value.push(...Array.from(files));
  emits("getFilesList", filesList.value);
};

const delFile = (index: number) => {
  filesList.value.splice(index, 1);
  emits("getFilesList", filesList.value);
};

const getFilesList = (file: File[]) => {
  filesList.value = file;
  emits("getFilesList", file);
};
</script>
