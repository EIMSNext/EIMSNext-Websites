<template>
  <div class="field-block-editor" :class="{ focused: isFocused, disabled }">
    <div class="editor-shell">
      <div v-if="showPlaceholder" class="editor-placeholder">{{ placeholder }}</div>
      <div ref="editorRef" class="editor-instance"></div>
      <div class="editor-actions">
        <FieldBlockPicker
          :formDef="formDef"
          :fields="fieldItems"
          :showSubFields="showSubFields"
          :showSystemFields="showSystemFields"
          :disabled="disabled || tokenCount >= maxBlocks"
          @select="insertFieldBlock"
        />
      </div>
    </div>
    <div class="editor-footer">
      <span>已添加 {{ tokenCount }} / {{ maxBlocks }} 个字段</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror/lib/codemirror";
import { computed, markRaw, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { FormDef } from "@eimsnext/models";
import { FieldBlockPicker } from "../FieldBlockPicker";
import {
  buildFieldBlockFields,
  FieldBlockField,
  findFieldBlockField,
  getFieldBlockTokens,
} from "../FieldBlock/shared";

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
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    fields: () => [],
    showSubFields: true,
    showSystemFields: true,
    placeholder: "输入文字或添加字段，至少需要添加一个字段",
    maxBlocks: 5,
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
const markers = ref<any[]>([]);
const isFocused = ref(false);
const isSyncing = ref(false);
const innerValue = ref(props.modelValue || "");
const selectedMarker = ref<any>();

const fieldItems = computed(() =>
  props.fields.length > 0
    ? props.fields
    : buildFieldBlockFields(props.formDef, {
        showSubFields: props.showSubFields,
        showSystemFields: props.showSystemFields,
      }),
);

const tokenCount = computed(() => getFieldBlockTokens(innerValue.value).length);
const showPlaceholder = computed(() => !innerValue.value && !isFocused.value);

function clearMarkers() {
  markers.value.forEach((marker) => marker.clear());
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
    const typeTag = document.createElement("span");
    typeTag.className = "token-type";
    typeTag.textContent = field?.typeLabel || "字段";
    span.append(label, typeTag);
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

function syncValue() {
  if (!editor.value) return;

  innerValue.value = editor.value.getValue();
  emit("update:modelValue", innerValue.value);
  emit("change", innerValue.value);
  renderFieldBlocks();
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
    syncValue();
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

  renderFieldBlocks();
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
  },
  { immediate: true },
);

watch(
  () => fieldItems.value,
  () => {
    renderFieldBlocks();
  },
  { deep: true },
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
  gap: var(--et-space-8);
}

.editor-shell {
  position: relative;
  min-height: 160px;
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-size-8);
  background: var(--et-bg-container);
  overflow: hidden;
}

.field-block-editor.focused .editor-shell {
  border-color: var(--et-color-primary);
}

.editor-instance {
  min-height: 160px;
}

.editor-placeholder {
  pointer-events: none;
  position: absolute;
  left: var(--et-space-12);
  top: var(--et-space-12);
  color: var(--et-text-placeholder);
  z-index: 1;
}

.editor-actions {
  position: absolute;
  right: var(--et-space-8);
  top: var(--et-space-8);
  z-index: 2;
}

.editor-footer {
  color: var(--et-text-tertiary);
  font-size: var(--et-font-size-12);
}

.field-block-editor :deep(.CodeMirror) {
  min-height: 160px;
  height: 100%;
  padding: var(--et-space-10) var(--et-space-40) var(--et-space-10) var(--et-space-10);
  color: var(--et-text-primary);
  background: var(--et-bg-container);
}

.field-block-editor :deep(.CodeMirror-scroll) {
  min-height: 160px;
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
  gap: var(--et-space-6);
  height: var(--et-size-24);
  padding: 0 var(--et-space-8);
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-size-4);
  background: var(--et-bg-page);
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

.field-block-editor :deep(.cm-field-block-token .token-type) {
  flex-shrink: 0;
  padding: 0 var(--et-space-8);
  border-radius: var(--et-size-12);
  background: var(--et-bg-primary-soft);
  color: var(--et-color-primary);
  font-size: var(--et-font-size-12);
  line-height: var(--et-line-height-20);
}
</style>
