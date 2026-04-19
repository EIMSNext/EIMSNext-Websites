<template>
  <EtDialog
    v-model="dialogVisible"
    class="formula-editor-dialog"
    :title="t('dataflow.formulaEditor')"
    width="1100px"
    :destroy-on-close="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    @ok="submit"
  >
    <div class="formula-editor">
      <div class="formula-script">
        <div ref="editorRef"></div>
      </div>
      <div class="formula-bottom">
        <div class="formula-tree-panel">
          <el-input v-model="fieldKeyword" placeholder="请输入关键字" />
          <el-tree
            class="formula-tree"
            :data="filteredFieldTree"
            node-key="id"
            :expand-on-click-node="false"
            @node-click="onFieldClick"
          />
        </div>
        <div class="formula-tree-panel">
          <el-input v-model="formulaKeyword" placeholder="请输入关键字" />
          <el-tree
            class="formula-tree"
            :data="filteredFormulaTree"
            node-key="id"
            :expand-on-click-node="false"
            @node-click="onFormulaClick"
          />
        </div>
        <div class="formula-info-panel">
          <div v-if="currentFormulaInfo">{{ t("dataflow.formulaInfo") }}: {{ currentFormulaInfo }}</div>
          <div v-if="currentFormulaExample">
            {{ t("dataflow.formulaExample") }}: {{ currentFormulaExample }}
          </div>
        </div>
      </div>
    </div>
  </EtDialog>
</template>

<script setup lang="ts">
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";
import { computed, markRaw, nextTick, ref, watch } from "vue";
import { useLocale } from "element-plus";
import { formulaInfo, formulaTree, type IFormulaGroupMeta } from "@eimsnext/utils";
import { INodeForm } from "@/NodeFieldList/type";
import { IFormulaRef, IFormulaValue } from "@/FormFieldList/type";
import { EtDialog } from "@/dialog";
import {
  buildDataflowFieldTree,
  getFormulaFieldDisplayLabel,
  IDataflowFormulaTreeItem,
} from "./formula";

const { t } = useLocale();

defineOptions({
  name: "FormulaEditorDialog",
});

const props = defineProps<{
  modelValue?: IFormulaValue;
  visible: boolean;
  nodes: INodeForm[];
}>();

const emit = defineEmits(["update:modelValue", "update:visible"]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit("update:visible", val),
});

const editorRef = ref<HTMLElement>();
const editor = ref<any>();
const refs = ref<IFormulaRef[]>([]);
const fieldKeyword = ref("");
const formulaKeyword = ref("");
const formulaInfoText = ref("");
const formulaExampleText = ref("");

const fieldTree = computed(() => buildDataflowFieldTree(props.nodes));
const formulaTreeInfo = computed<IDataflowFormulaTreeItem[]>(() =>
  formulaTree.map((group: IFormulaGroupMeta) => ({
    id: group.key,
    label: t(`formula.${group.key}`),
    children: group.children.map((name: string) => ({
      id: name,
      label: name,
      formula: true,
      info: t(`formula.${name}`),
      example: formulaInfo[name] || "",
    })),
  })),
);

const filteredFieldTree = computed(() =>
  filterTree(fieldTree.value, fieldKeyword.value),
);
const filteredFormulaTree = computed(() =>
  filterTree(formulaTreeInfo.value, formulaKeyword.value),
);
const currentFormulaInfo = computed(() => formulaInfoText.value);
const currentFormulaExample = computed(() => formulaExampleText.value);

function filterTree(
  tree: IDataflowFormulaTreeItem[],
  keyword: string,
): IDataflowFormulaTreeItem[] {
  if (!keyword) return tree;
  const lowerKeyword = keyword.toLowerCase();
  return tree
    .map((item): IDataflowFormulaTreeItem | undefined => {
      const children: IDataflowFormulaTreeItem[] | undefined = item.children
        ? filterTree(item.children, keyword)
        : undefined;
      if (
        item.label.toLowerCase().includes(lowerKeyword) ||
        (children && children.length > 0)
      ) {
        return { ...item, children };
      }
      return undefined;
    })
    .filter((item): item is IDataflowFormulaTreeItem => !!item);
}

function ensureRef(field: IFormulaRef["field"]) {
  const existing = refs.value.find(
    (item) =>
      item.field.nodeId == field.nodeId && item.field.field == field.field,
  );
  if (existing) return existing;

  const refItem: IFormulaRef = {
    key: `$F${refs.value.length + 1}`,
    field,
  };
  refs.value.push(refItem);
  return refItem;
}

function markReadableLabels() {
  if (!editor.value) return;
  const rawValue: string = editor.value.getValue();
  refs.value.forEach((item) => {
    let startIndex = rawValue.indexOf(item.key);
    while (startIndex > -1) {
      const from = editor.value.posFromIndex(startIndex);
      const to = editor.value.posFromIndex(startIndex + item.key.length);
      const span = document.createElement("span");
      span.classList.add("cm-fc-field");
      span.innerText = getFormulaFieldDisplayLabel(item.field, props.nodes);
      editor.value.markText(from, to, { replacedWith: span });
      startIndex = rawValue.indexOf(item.key, startIndex + item.key.length);
    }
  });
}

function onFieldClick(data: IDataflowFormulaTreeItem) {
  if (!data.field || !editor.value) return;
  const refItem = ensureRef(data.field);
  editor.value.replaceRange(refItem.key, editor.value.getCursor());
  formulaInfoText.value = "";
  formulaExampleText.value = "";
  nextTick(() => markReadableLabels());
}

function onFormulaClick(data: IDataflowFormulaTreeItem) {
  if (!data.formula || data.field || !editor.value) return;
  editor.value.replaceRange(`${data.label}()`, editor.value.getCursor());
  editor.value.moveH(-1, "char");
  formulaInfoText.value = data.info || "";
  formulaExampleText.value = data.example || "";
}

function loadEditor() {
  if (!editorRef.value) return;

  if (!(CodeMirror as any).modes.fcComputedMode) {
    CodeMirror.defineSimpleMode("fcComputedMode", {
      start: [
        { regex: /\$F\d+/, token: "atom" },
        { regex: /[A-Z_][A-Z0-9_]*/, token: "keyword" },
        { regex: /[-+]?(\d*\.)?\d+/, token: "number" },
        { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
        { regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: "string" },
        { regex: /[\(\),]/, token: "bracket" },
      ],
    });
  }

  editor.value = markRaw(
    CodeMirror(editorRef.value, {
      lineNumbers: true,
      lineWrapping: true,
      mode: "fcComputedMode",
      value: props.modelValue?.expression || "",
    }),
  );
  refs.value = [...(props.modelValue?.refs || [])];
  markReadableLabels();
}

function submit() {
  emit("update:modelValue", {
    expression: editor.value?.getValue()?.trim?.() || "",
    refs: refs.value.filter((item) =>
      (editor.value?.getValue?.() || "").includes(item.key),
    ),
  });
  dialogVisible.value = false;
}

watch(
  () => dialogVisible.value,
  async (visible) => {
    if (!visible) return;
    await nextTick();
    loadEditor();
  },
);
</script>

<style scoped lang="scss">
.formula-editor {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
  min-height: 620px;
  height: 620px;
  overflow: hidden;
}

.formula-script {
  flex: 0 0 200px;
  border: 1px solid var(--et-border-color-light);
  overflow: hidden;
}

.formula-bottom {
  display: flex;
  gap: var(--et-space-10);
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.formula-tree-panel {
  width: 32%;
  display: flex;
  flex-direction: column;
  gap: var(--et-space-5);
  min-width: 0;
  min-height: 0;
}

.formula-info-panel {
  flex: 1;
  border: 1px solid var(--et-border-color-light);
  padding: var(--et-space-10);
  overflow: auto;
  min-width: 0;
}

.formula-tree {
  border: 1px solid var(--et-border-color-light);
  padding: var(--et-space-5);
  overflow: auto;
  flex: 1;
}

.formula-editor-dialog :deep(.el-dialog__body) {
  padding: var(--et-space-10);
}

.formula-script :deep(.CodeMirror) {
  height: 100%;
  width: 100%;
}

.formula-script :deep(.CodeMirror-scroll) {
  overflow: auto !important;
}

.formula-script :deep(.CodeMirror-wrap pre.CodeMirror-line) {
  padding-left: 20px;
}
</style>
