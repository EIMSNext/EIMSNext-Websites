<template>
  <div class="dashboard-text-editor no-drag" @keydown.esc.stop="emit('done')">
    <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="simple" />
    <Editor v-model="html" :default-config="editorConfig" mode="simple" @on-created="onCreated" @on-blur="handleBlur" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string]; blur: []; done: [] }>();
const editorRef = ref();
const html = ref(props.modelValue);
const toolbarConfig = {
  toolbarKeys: ["bold", "italic", "underline", "justifyLeft", "justifyCenter", "justifyRight", "color", "fontSize", "insertLink", "unLink"],
};
const editorConfig = { placeholder: "" };

watch(() => props.modelValue, (value) => { if (value !== html.value) html.value = value; });
watch(html, (value) => emit("update:modelValue", value));
const onCreated = (editor: any) => { editorRef.value = editor; };
const handleBlur = () => {
  void nextTick(() => {
    const root = editorRef.value?.getEditableContainer?.()?.closest?.(".dashboard-text-editor") as HTMLElement | null;
    if (!root || !root.contains(document.activeElement)) emit("blur");
  });
};
onBeforeUnmount(() => editorRef.value?.destroy());
</script>

<style scoped lang="scss">
.dashboard-text-editor { position: relative; display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--et-bg-container); }.dashboard-text-editor :deep(.w-e-toolbar) { position: absolute; left: 0; right: 0; bottom: 100%; z-index: 20; border: 1px solid var(--et-border-color); box-shadow: var(--et-shadow-overlay); }.dashboard-text-editor :deep(.w-e-text-container) { flex: 1; min-height: 0; overflow: auto; }.dashboard-text-editor :deep(.w-e-text-placeholder) { font-style: normal; }
</style>
<style src="@wangeditor/editor/dist/css/style.css"></style>
