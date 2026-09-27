<template>
  <div class="field-block-editor" :class="{ focused: isFocused, disabled }">
    <div class="editor-shell" :style="shellStyle">
      <div v-if="showPlaceholder" class="editor-placeholder">{{ placeholderText }}</div>
      <div ref="editorRef" class="editor-instance"></div>
      <div class="editor-actions">
        <FieldBlockPicker
          :formDef="formDef"
          :fields="fieldItems"
          :showSubFields="showSubFields"
          :showSystemFields="showSystemFields"
          :disabled="disabled || tokenCount >= maxBlocks"
          :limitReached="tokenCount >= maxBlocks"
          :maxBlocks="maxBlocks"
          @select="insertFieldBlock"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror/lib/codemirror";
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { FormDef } from "@eimsnext/models";
import { FieldBlockPicker } from "../FieldBlockPicker";
import {
  buildFieldBlockFields,
  FieldBlockField,
  findFieldBlockField,
  getFieldBlockTokens,
} from "../FieldBlock/shared";

const { t } = useI18n();

defineOptions({
  name: "FieldBlockCodeEditor",
});

const props = withDefaults(
  defineProps<{
    modelValue: string;
    formDef?: FormDef;
    fields?: FieldBlockField[];
    showSubFields?: boolean;
    showSystemFields?: boolean;
    placeholder?: string;
    maxBlocks?: number;
    maxRows?: number;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    fields: () => [],
    showSubFields: true,
    showSystemFields: true,
    placeholder: "",
    maxBlocks: 5,
    maxRows: 3,
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  limit: [];
}>();

const editorRef = ref<HTMLElement>();
const editor = ref<any>();
const inputField = ref<HTMLTextAreaElement | HTMLInputElement>();
const markers = ref<any[]>([]);
const isFocused = ref(false);
const isSyncing = ref(false);
const isComposing = ref(false);
const innerValue = ref(props.modelValue || "");
const selectedMarker = ref<any>();

const lineHeight = 30;

const shellStyle = computed(() => ({
  minHeight: `${lineHeight}px`,
  maxHeight: `${props.maxRows * lineHeight}px`,
}));

const placeholderText = computed(() => props.placeholder || t("comp.fieldBlockCodeEditor.placeholder"));

const fieldItems = computed(() =>
  props.fields.length > 0
    ? props.fields
    : buildFieldBlockFields(props.formDef, {
        showSubFields: props.showSubFields,
        showSystemFields: props.showSystemFields,
        t,
      }),
);

const tokenCount = computed(() => getFieldBlockTokens(innerValue.value).length);
const showPlaceholder = computed(() => !innerValue.value && !isFocused.value);

function clearMarkers() {
  markers.value.forEach((marker) => {
    if (!marker?.find?.()) return;
    marker.clear();
  });
  markers.value = [];
  selectedMarker.value = undefined;
}

function clearSelectedMarker() {
  const element = selectedMarker.value?.replacedWith as HTMLElement | undefined;
  element?.classList.remove("is-selected");
  selectedMarker.value = undefined;
}

function selectMarker(marker: any) {
  if (!marker) return;
  if (selectedMarker.value === marker) return;
  clearSelectedMarker();
  const element = marker.replacedWith as HTMLElement | undefined;
  element?.classList.add("is-selected");
  selectedMarker.value = marker;
}

function findMarkerAtCursor(direction: "backward" | "forward") {
  if (!editor.value || editor.value.somethingSelected()) {
    return undefined;
  }

  const cursor = editor.value.getCursor();
  return markers.value.find((marker) => {
    const range = marker.find();
    if (!range) return false;

    return direction === "backward"
      ? CodeMirror.cmpPos(range.to, cursor) === 0
      : CodeMirror.cmpPos(range.from, cursor) === 0;
  });
}

function moveAcrossBlock(direction: "left" | "right") {
  if (!editor.value || editor.value.somethingSelected()) {
    return false;
  }

  const cursor = editor.value.getCursor();
  const marker = markers.value.find((item) => {
    const range = item.find();
    if (!range) return false;

    return direction === "left"
      ? CodeMirror.cmpPos(range.to, cursor) === 0
      : CodeMirror.cmpPos(range.from, cursor) === 0;
  });

  if (!marker) {
    clearSelectedMarker();
    return false;
  }

  const range = marker.find();
  if (!range) return false;

  editor.value.setCursor(direction === "left" ? range.from : range.to);
  selectMarker(marker);
  return true;
}

function renderFieldBlocks() {
  if (!editor.value) return;

  clearMarkers();

  getFieldBlockTokens(editor.value.getValue()).forEach((tokenItem) => {
    const field = findFieldBlockField(fieldItems.value, tokenItem.field);
    const span = document.createElement("span");
    span.className = "cm-field-block-token";
    const label = document.createElement("span");
    label.className = "token-label";
    label.textContent = field?.label || tokenItem.field;
    span.append(label);
    span.title = field?.label || tokenItem.field;

    const from = editor.value!.posFromIndex(tokenItem.index);
    const to = editor.value!.posFromIndex(tokenItem.index + tokenItem.token.length);
    const marker = editor.value.markText(from, to, {
        replacedWith: span,
        atomic: true,
        clearOnEnter: false,
        handleMouseEvents: true,
      });
    span.addEventListener("click", () => {
      if (!editor.value) return;
      const range = marker.find();
      if (!range) return;
      editor.value.focus();
      editor.value.setCursor(range.to);
      selectMarker(marker);
    });
    (marker as any).replacedWith = span;
    markers.value.push(marker);
  });
}

function syncValue(renderBlocks = true) {
  if (!editor.value) return;

  innerValue.value = editor.value.getValue();
  emit("update:modelValue", innerValue.value);
  emit("change", innerValue.value);
  if (renderBlocks) {
    renderFieldBlocks();
  }
  syncEditorHeight();
}

function handleCompositionStart() {
  isComposing.value = true;
}

function handleCompositionEnd() {
  isComposing.value = false;
  if (isSyncing.value) return;
  syncValue();
}

function syncEditorHeight() {
  if (!editor.value) return;

  nextTick(() => {
    const wrapper = editor.value.getWrapperElement?.() as HTMLElement | undefined;
    const scroller = editor.value.getScrollerElement?.() as HTMLElement | undefined;
    if (!wrapper || !scroller) return;

    wrapper.style.height = "auto";
    scroller.style.height = "auto";
    scroller.style.maxHeight = `${props.maxRows * lineHeight}px`;

    const scrollHeight = Math.max(scroller.scrollHeight, lineHeight);
    const contentHeight = Math.min(scrollHeight, props.maxRows * lineHeight);

    wrapper.style.height = `${contentHeight}px`;
    scroller.style.height = `${contentHeight}px`;
    scroller.style.overflowY = scrollHeight > props.maxRows * lineHeight ? "auto" : "hidden";

    editor.value.refresh?.();
  });
}

function removeBlock(direction: "backward" | "forward") {
  if (!editor.value || editor.value.somethingSelected()) {
    return false;
  }

  const cursor = editor.value.getCursor();
  const marker = findMarkerAtCursor(direction);
  if (marker) {
    const range = marker.find();
    if (!range) return false;
    editor.value.operation(() => {
      clearSelectedMarker();
      marker.clear();
      editor.value!.replaceRange("", range.from, range.to, "delete");
      editor.value!.setCursor(range.from);
    });
    return true;
  }

  return false;
}

function insertFieldBlock(field: FieldBlockField) {
  if (!editor.value) return;

  if (tokenCount.value >= props.maxBlocks) {
    emit("limit");
    return;
  }

  editor.value.focus();
  editor.value.replaceSelection(field.token, "end", "field-block");
}

function createEditor() {
  if (!editorRef.value) return;

  editor.value = markRaw(
    CodeMirror(editorRef.value, {
      value: innerValue.value,
      lineNumbers: false,
      lineWrapping: true,
      mode: "text/plain",
      viewportMargin: Infinity,
      readOnly: props.disabled,
      extraKeys: {
        Backspace: (cm: any) => {
          if (!removeBlock("backward")) {
            cm.execCommand("delCharBefore");
          }
        },
        Delete: (cm: any) => {
          if (!removeBlock("forward")) {
            cm.execCommand("delCharAfter");
          }
        },
        Left: (cm: any) => {
          if (!moveAcrossBlock("left")) {
            clearSelectedMarker();
            cm.execCommand("goCharLeft");
          }
        },
        Right: (cm: any) => {
          if (!moveAcrossBlock("right")) {
            clearSelectedMarker();
            cm.execCommand("goCharRight");
          }
        },
      },
    }),
  );

  editor.value.on("focus", () => {
    isFocused.value = true;
  });
  editor.value.on("blur", () => {
    isFocused.value = false;
    clearSelectedMarker();
  });
  editor.value.on("changes", () => {
    if (isSyncing.value) return;
    syncValue(!isComposing.value);
  });
  editor.value.on("cursorActivity", () => {
    const backwardMarker = findMarkerAtCursor("backward");
    if (backwardMarker) {
      selectMarker(backwardMarker);
      return;
    }

    const forwardMarker = findMarkerAtCursor("forward");
    if (forwardMarker) {
      selectMarker(forwardMarker);
      return;
    }

    clearSelectedMarker();
  });

  inputField.value = editor.value.getInputField?.();
  inputField.value?.addEventListener("compositionstart", handleCompositionStart);
  inputField.value?.addEventListener("compositionend", handleCompositionEnd);

  renderFieldBlocks();
  syncEditorHeight();
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) {
      innerValue.value = value || "";
      return;
    }

    if (value === editor.value.getValue()) {
      innerValue.value = value || "";
      return;
    }

    isSyncing.value = true;
    editor.value.setValue(value || "");
    innerValue.value = value || "";
    renderFieldBlocks();
    isSyncing.value = false;
    syncEditorHeight();
  },
  { immediate: true },
);

watch(
  () => fieldItems.value,
  () => {
    renderFieldBlocks();
    syncEditorHeight();
  },
  { deep: true },
);

watch(
  () => props.maxRows,
  () => {
    syncEditorHeight();
  },
);

watch(
  () => props.disabled,
  (disabled) => {
    const cm = editor.value as { setOption?: (key: string, value: unknown) => void } | undefined;
    cm?.setOption?.("readOnly", disabled);
  },
);

onMounted(() => {
  createEditor();
});

onBeforeUnmount(() => {
  inputField.value?.removeEventListener("compositionstart", handleCompositionStart);
  inputField.value?.removeEventListener("compositionend", handleCompositionEnd);
  inputField.value = undefined;
  clearMarkers();
  editor.value = undefined;
});

defineExpose({
  focus: () => editor.value?.focus(),
});
</script>

<style scoped lang="scss">
.field-block-editor {
  display: flex;
  flex-direction: column;
}

.editor-shell {
  position: relative;
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-size-6);
  background: var(--et-bg-container);
  overflow: hidden;
}

.field-block-editor.focused .editor-shell {
  border-color: var(--et-color-primary);
}

.editor-instance {
  min-height: 30px;
}

.editor-placeholder {
  pointer-events: none;
  position: absolute;
  left: 10px;
  top: 6px;
  color: var(--et-text-placeholder);
  z-index: 1;
  font-size: var(--et-font-size-14);
  line-height: 18px;
}

.editor-actions {
  position: absolute;
  right: 16px;
  top: 5px;
  height: 20px;
  z-index: 2;
}

.field-block-editor :deep(.CodeMirror) {
  min-height: 30px;
  height: 100%;
  padding: 4px 34px 4px 10px;
  color: var(--et-text-primary);
  background: var(--et-bg-container);
  font-size: var(--et-font-size-14);
  line-height: 22px;
}

.field-block-editor :deep(.CodeMirror-scroll) {
  min-height: 30px;
}

.field-block-editor :deep(.CodeMirror-lines) {
  padding: 0;
}

.field-block-editor :deep(.CodeMirror pre) {
  padding: 0;
  line-height: 22px;
}

.field-block-editor :deep(.CodeMirror-sizer) {
  margin-left: 0 !important;
  min-width: 0 !important;
}

.field-block-editor :deep(.CodeMirror-cursor) {
  border-left-color: var(--et-text-primary);
}

.field-block-editor :deep(.CodeMirror-selected) {
  background: var(--et-fill-color-light);
}

.field-block-editor :deep(.cm-field-block-token) {
  display: inline-flex;
  align-items: center;
  height: var(--et-size-24);
  margin: 1px 4px 1px 0;
  padding: 0 var(--et-space-8);
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-size-4);
  background: var(--et-fill-color-light);
  color: var(--et-text-primary);
  line-height: var(--et-line-height-24);
}

.field-block-editor :deep(.cm-field-block-token.is-selected) {
  border-color: var(--et-color-primary);
  box-shadow: 0 0 0 1px var(--et-color-primary);
}

.field-block-editor :deep(.cm-field-block-token .token-label) {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
