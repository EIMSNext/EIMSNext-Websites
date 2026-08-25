<template>
  <div class="dashboard-text-editor no-drag">
    <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="simple" />
    <Editor v-model="html" :default-config="editorConfig" mode="simple" @on-created="onCreated" @on-blur="emit('blur')" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string]; blur: [] }>();
const editorRef = ref();
const html = ref(props.modelValue);
const toolbarConfig = {
  toolbarKeys: ["bold", "italic", "underline", "justifyLeft", "justifyCenter", "justifyRight", "color", "fontSize", "insertLink", "unLink"],
};
const editorConfig = { placeholder: "" };

watch(() => props.modelValue, (value) => { if (value !== html.value) html.value = value; });
watch(html, (value) => emit("update:modelValue", value));
const onCreated = (editor: any) => { editorRef.value = editor; };
onBeforeUnmount(() => editorRef.value?.destroy());
</script>

<style scoped lang="scss">
.dashboard-text-editor { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--et-bg-container); }.dashboard-text-editor :deep(.w-e-toolbar) { flex: 0 0 auto; border-bottom: 1px solid var(--et-border-color); }.dashboard-text-editor :deep(.w-e-text-container) { flex: 1; overflow: auto; }.dashboard-text-editor :deep(.w-e-text-placeholder) { font-style: normal; }
</style>
