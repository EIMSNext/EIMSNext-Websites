<template>
  <div
    class="et-upload-dragger"
    :class="{ ['et-upload-draggerenter']: isEnter }"
    ref="fileArea"
    @click="emits('fileUpload')"
  >
    <div class="et-upload-content">
      <et-icon
        icon-class="et-upload-icon"
        :icon="isEnter ? 'el-icon-FolderOpened' : 'el-icon-Folder'"
      />
      <div class="et-upload-dragger-text">
        将文件拖到此处或<em>点击上传</em>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./style/drag.less";
import { ref, onMounted } from "vue";
import EtIcon from "../icon/etIcon.vue";
const emits = defineEmits(["getFilesList", "fileUpload"]);
const fileArea = ref();
const isEnter = ref(false);
const timer = ref<null | number>(null);
const filesList = ref<File[]>([]);

onMounted(() => {
  fileArea.value.addEventListener(
    "drop",
    (e: any) => {
      e.preventDefault();
      filesList.value.push(...Array.from(e.dataTransfer.files as FileList));
      emits("getFilesList", filesList.value);
    },
    false
  );
  fileArea.value.addEventListener("dragover", onDragover, false);
});

const onDragover = (e: Event) => {
  isEnter.value = true;
  // dragover+防抖代替dragenter和dragleave，因为dragleave进入子元素也会触发
  if (timer.value !== null) {
    clearTimeout(timer.value);
  }
  timer.value = window.setTimeout(() => {
    isEnter.value = false;
    timer.value = null;
  }, 100);

  e.stopPropagation();
  e.preventDefault();
};

defineOptions({
  name: "Dragger",
});
</script>
