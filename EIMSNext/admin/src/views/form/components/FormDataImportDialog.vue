<template>
  <el-dialog
    v-model="dialogVisible"
    class="form-data-import-dialog"
    :title="title"
    :width="maximized ? '100%' : '800px'"
    :fullscreen="maximized"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header">
        <span>{{ title }}</span>
        <button class="icon-button" type="button" :title="maximized ? t('admin.formDataImport.preview.restore') : t('admin.formDataImport.preview.maximize')" @click="maximized = !maximized">
          <et-icon :icon="maximized ? 'el-CopyDocument' : 'el-FullScreen'" />
        </button>
      </div>
    </template>

    <div class="import-shell" :class="{ maximized }">
      <el-steps class="import-steps" :active="activeStep" align-center finish-status="success">
        <el-step :title="t('admin.formDataImport.steps.selectFile')" />
        <el-step :title="t('admin.formDataImport.steps.preview')" />
        <el-step :title="t('admin.formDataImport.steps.config')" />
        <el-step :title="t('admin.formDataImport.steps.import')" />
      </el-steps>

      <section v-show="activeStep === 0" class="step-panel">
        <div class="option-row">
          <span class="option-label">{{ t("admin.formDataImport.options.importMode") }}</span>
          <el-select v-model="importMode" class="mode-select" size="default">
            <el-option v-for="item in importModeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>

        <div class="check-row">
          <el-checkbox v-model="triggerValidation">{{ t("admin.formDataImport.options.triggerValidation") }}</el-checkbox>
          <el-tooltip :content="t('admin.formDataImport.options.triggerValidationTooltip')">
            <et-icon class="hint-icon" icon="el-QuestionFilled" />
          </el-tooltip>
          <el-checkbox v-if="formDef.usingWorkflow" v-model="triggerWorkflow" class="workflow-check">
            {{ t("admin.formDataImport.options.triggerWorkflow") }}
          </el-checkbox>
        </div>

        <div class="tips-box">
          <ul>
            <li>
              {{ templateTipParts.before }}
              <a href="#" @click.prevent.stop="downloadTemplate">{{ t("admin.formDataImport.tips.templateLink") }}</a>
              {{ templateTipParts.after }}
            </li>
            <li>{{ t("admin.formDataImport.tips.line2") }}</li>
            <li v-if="formDef.usingWorkflow && triggerWorkflow">{{ t("admin.formDataImport.tips.line3") }}</li>
            <li>{{ t("admin.formDataImport.tips.line4", { link: t("admin.formDataImport.tips.helpLink") }) }}</li>
          </ul>
        </div>

        <div
          class="drop-zone"
          :class="{ loading: previewLoading }"
          @click="openFilePicker"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input ref="fileInputRef" class="file-input" type="file" accept=".xlsx,.xls" @change="handleFileChange" />
          <et-icon class="upload-icon" icon="el-UploadFilled" />
          <div class="drop-text">
            <span v-if="selectedFile">{{ selectedFile.name }}</span>
            <span v-else>
              {{ dropPromptParts.before }}
              <b>{{ t("admin.formDataImport.dropZone.promptAction") }}</b>
              {{ dropPromptParts.after }}
            </span>
          </div>
          <div v-if="previewLoading" class="drop-mask">{{ t("admin.formDataImport.dropZone.loading") }}</div>
        </div>
      </section>

      <section v-show="activeStep === 1" class="step-panel">
        <div class="preview-toolbar">
          <div class="option-row compact">
            <span class="option-label">{{ t("admin.formDataImport.preview.sheet") }}</span>
            <el-select v-model="sheetName" class="sheet-select">
              <el-option v-for="sheet in previewSheets" :key="sheet.name" :label="sheet.name" :value="sheet.name" />
            </el-select>
          </div>
          <div class="option-row compact">
            <span class="option-label">{{ t("admin.formDataImport.preview.headerRow") }}</span>
            <el-input-number v-model="headerRowIndex" :min="1" :max="maxHeaderRow" controls-position="right" />
          </div>
          <span class="muted-text">{{ t("admin.formDataImport.preview.headerRowNote") }}</span>
        </div>

        <div class="table-scroll preview-table">
          <table>
            <thead>
              <tr>
                <th v-for="column in previewColumns" :key="column.index">
                  {{ column.header || column.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex">
                <td v-for="column in previewColumns" :key="column.index">
                  {{ row[column.index] }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="previewRows.length === 0" class="empty-area">{{ t("admin.formDataImport.preview.empty") }}</div>
        </div>
      </section>

      <section v-show="activeStep === 2" class="step-panel">
        <div class="mapping-head">
          <div class="option-row compact">
            <span class="option-label">{{ t("admin.formDataImport.mapping.formName") }}</span>
            <el-input :model-value="formDef.name" class="readonly-input" disabled />
          </div>
          <div v-if="importMode !== FormDataImportMode.AddOnly" class="option-row compact">
            <span class="option-label">{{ t("admin.formDataImport.mapping.matchField") }}</span>
            <el-select v-model="matchField" class="sheet-select" :placeholder="t('admin.formDataImport.mapping.matchFieldPlaceholder')">
              <el-option v-for="field in matchableFields" :key="field.field" :label="field.title" :value="field.field" />
            </el-select>
          </div>
          <div class="mapping-count">{{ t("admin.formDataImport.mapping.count", { mapped: mappedItems.length, total: previewColumns.length }) }}</div>
        </div>

        <div class="table-scroll mapping-table">
          <table>
            <thead>
              <tr>
                <th class="row-index-cell"></th>
                <th v-for="column in previewColumns" :key="column.index">
                  {{ column.header || column.name }}
                </th>
              </tr>
              <tr>
                <th class="row-index-cell">{{ t("admin.formDataImport.mapping.fieldHeader") }}</th>
                <th v-for="column in previewColumns" :key="column.index">
                  <el-select
                    :model-value="mappingValues[column.index]"
                    clearable
                    filterable
                    :placeholder="t('admin.formDataImport.mapping.matchFieldPlaceholder')"
                    @change="(value) => setColumnMapping(column.index, value)"
                  >
                    <el-option
                      v-for="field in importFields"
                      :key="field.field"
                      :label="field.title"
                      :value="field.field"
                      :disabled="isFieldMappedElsewhere(field.field, column.index)"
                    />
                  </el-select>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in mappingPreviewRows" :key="rowIndex">
                <td class="row-index-cell">{{ rowIndex + 1 }}</td>
                <td v-for="column in previewColumns" :key="column.index">
                  {{ row[column.index] }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="previewColumns.length === 0" class="empty-area">{{ t("admin.formDataImport.mapping.empty") }}</div>
        </div>
      </section>

      <section v-show="activeStep === 3" class="step-panel result-panel">
        <template v-if="isImportRunning">
          <div class="progress-line">
            <el-progress :percentage="progressPercent" :show-text="false" />
            <span>{{ progressText }}</span>
          </div>
          <p class="muted-text">{{ t("admin.formDataImport.result.canCloseHint") }}</p>
        </template>

        <template v-else-if="isImportSuccess">
          <div class="result-icon success"><et-icon icon="el-Check" /></div>
          <p>{{ t("admin.formDataImport.result.success", { add: importStatus?.addCount || 0, update: importStatus?.updateCount || 0 }) }}</p>
        </template>

        <template v-else-if="isImportFailed">
          <div class="result-icon warning"><et-icon icon="el-WarningFilled" /></div>
          <p>{{ t("admin.formDataImport.result.partial", { add: importStatus?.addCount || 0, update: importStatus?.updateCount || 0, failed: importStatus?.failedCount || 0 }) }}</p>
          <div class="result-actions">
            <el-button v-if="importStatus?.errorReportDownloadUrl" @click="downloadErrorReport">{{ t("admin.formDataImport.result.downloadReport") }}</el-button>
            <el-button v-if="importStatus?.canEditErrors" type="primary" @click="openErrorEditor">{{ t("admin.formDataImport.result.editErrors") }}</el-button>
          </div>
          <p v-if="importStatus?.errorMessage" class="error-text">{{ importStatus.errorMessage }}</p>
        </template>
      </section>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <a class="help-link" href="#" @click.prevent>{{ t("admin.formDataImport.footer.helpLink") }}</a>
        <div class="footer-actions">
          <el-button v-if="activeStep > 0 && activeStep < 3" @click="activeStep -= 1">{{ t("common.prevStep") }}</el-button>
          <el-button v-if="activeStep === 0" type="primary" :disabled="!previewReady" @click="activeStep = 1">{{ t("common.nextStep") }}</el-button>
          <el-button v-else-if="activeStep === 1" type="primary" :disabled="previewColumns.length === 0" @click="goMappingStep">{{ t("common.nextStep") }}</el-button>
          <el-button v-else-if="activeStep === 2" type="primary" :loading="submitting" :disabled="!canStartImport" @click="startImport">{{ t("admin.formDataImport.footer.startImport") }}</el-button>
          <el-button v-else-if="activeStep === 3 && !isImportRunning" type="primary" @click="finishDialog">{{ t("admin.formDataImport.footer.finish") }}</el-button>
          <el-button v-else-if="activeStep === 3" type="primary" :loading="true" disabled>{{ t("admin.formDataImport.footer.importing") }}</el-button>
        </div>
      </div>
    </template>

    <el-dialog
      v-model="errorEditorVisible"
      class="import-error-dialog"
      :title="t('admin.formDataImport.errorDialog.title')"
      width="90%"
      top="7vh"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="error-editor">
        <aside class="error-list">
          <div v-for="row in editableRows" :key="row.recordIndex" class="error-card" :class="{ resolved: row.errors.length === 0 }">
            <div class="error-row-title">{{ t("admin.formDataImport.result.rowPrefix", { n: row.startRowNumber }) }}</div>
            <div v-if="row.errors.length === 0" class="resolved-text">{{ t("admin.formDataImport.errorDialog.resolved") }}</div>
            <div v-for="(error, index) in row.errors" v-else :key="index" class="error-message">
              {{ error.fieldTitle || error.field || t("admin.formDataImport.result.errorTextFallback") }}：{{ error.message }}
            </div>
          </div>
        </aside>
        <div class="error-grid-wrap">
          <table class="error-grid">
            <thead>
              <tr>
                <th v-for="field in editableFields" :key="field.field">{{ field.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in editableRows" :key="row.recordIndex">
                <td v-for="field in editableFields" :key="field.field" :class="{ invalid: hasFieldError(row, field.field) }">
                  <el-input
                    :model-value="getEditableValue(row, field.field)"
                    @input="(value) => setEditableValue(row, field.field, value)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <el-button @click="errorEditorVisible = false">{{ t("admin.formDataImport.errorDialog.cancel") }}</el-button>
        <el-button type="primary" :loading="retrying" :disabled="!allErrorsResolved" @click="submitCorrections">{{ t("admin.formDataImport.errorDialog.retry") }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import ExcelJS from "exceljs";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  FieldDef,
  FieldType,
  FormDataImportEditableErrorRow,
  FormDataImportMappingItem,
  FormDataImportMode,
  FormDataImportPreviewResponse,
  FormDataImportSheetPreview,
  FormDataImportStatus,
  FormDataImportStatusResponse,
  FormDef,
  IFieldPerm,
} from "@eimsnext/models";
import { formDataService } from "@eimsnext/services";

type ImportField = {
  field: string;
  title: string;
  type: FieldType;
  isSubField: boolean;
  parentField?: string;
  parentTitle?: string;
  rawTitle: string;
  matchNames: string[];
};

type PreviewColumn = {
  index: number;
  name: string;
  header: string;
};

const props = defineProps<{
  modelValue: boolean;
  formDef: FormDef;
  authGroupId?: string;
  fieldPerms?: IFieldPerm[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  imported: [];
}>();

const { t } = useI18n();
const title = t("admin.formDataImport.title");
const MAX_EDITABLE_ROWS = 30;
const activeStep = ref(0);
const maximized = ref(false);
const importMode = ref(FormDataImportMode.AddOnly);
const triggerValidation = ref(false);
const triggerWorkflow = ref(false);
const previewLoading = ref(false);
const submitting = ref(false);
const retrying = ref(false);
const selectedFile = ref<File>();
const fileInputRef = ref<HTMLInputElement>();
const preview = ref<FormDataImportPreviewResponse>();
const sheetName = ref("");
const headerRowIndex = ref(1);
const mappingValues = ref<Record<number, string>>({});
const matchField = ref("");
const taskId = ref("");
const importStatus = ref<FormDataImportStatusResponse>();
const finalNotified = ref(false);
const errorEditorVisible = ref(false);
const editableRows = ref<FormDataImportEditableErrorRow[]>([]);
let pollTimer: ReturnType<typeof setInterval> | undefined;

const importModeOptions = [
  { label: t("admin.formDataImport.importMode.addOnly"), value: FormDataImportMode.AddOnly },
  { label: t("admin.formDataImport.importMode.updateOnly"), value: FormDataImportMode.UpdateOnly },
  { label: t("admin.formDataImport.importMode.upsert"), value: FormDataImportMode.Upsert },
];

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const importFields = computed(() => buildImportFields(props.formDef.content?.items || [], props.fieldPerms));
const previewSheets = computed(() => preview.value?.sheets || []);
const currentSheet = computed(() => previewSheets.value.find((sheet) => sheet.name === sheetName.value) || previewSheets.value[0]);
const maxHeaderRow = computed(() => Math.max(1, Math.min(currentSheet.value?.rows.length || 1, 30)));
const previewReady = computed(() => !!selectedFile.value && !!currentSheet.value);
const dataRowCount = computed(() => Math.max(0, (currentSheet.value?.rowCount || 0) - headerRowIndex.value));
const hasMemberOrDepartmentField = computed(() =>
  mappedItems.value.some((item) =>
    [FieldType.Employee1, FieldType.Employee2, FieldType.Department1, FieldType.Department2].includes(item.fieldType as FieldType),
  ),
);
const previewColumns = computed<PreviewColumn[]>(() => {
  const sheet = currentSheet.value;
  if (!sheet) return [];

  const headerRow = sheet.rows[headerRowIndex.value - 1] || [];
  const groupRow = headerRowIndex.value > 1 ? sheet.rows[headerRowIndex.value - 2] || [] : [];
  const count = Math.min(sheet.columnCount || headerRow.length, 500);
  return Array.from({ length: count }, (_, index) => {
    const child = normalizeCell(headerRow[index]);
    const parent = normalizeCell(groupRow[index]);
    const header = parent && child && parent !== child ? `${parent}.${child}` : child || parent;
    return {
      index,
      name: getColumnName(index),
      header,
    };
  });
});
const previewRows = computed(() => {
  const sheet = currentSheet.value;
  if (!sheet) return [];
  return sheet.rows.slice(headerRowIndex.value, headerRowIndex.value + 8);
});
const mappingPreviewRows = computed(() => previewRows.value.slice(0, 5));
const mappedItems = computed<FormDataImportMappingItem[]>(() => {
  const result: FormDataImportMappingItem[] = [];
  for (const column of previewColumns.value) {
    const fieldKey = mappingValues.value[column.index];
    const field = importFields.value.find((item) => item.field === fieldKey);
    if (!field) continue;

    result.push({
      columnIndex: column.index,
      header: column.header || column.name,
      field: field.field,
      fieldTitle: field.title,
      fieldType: field.type,
    });
  }

  return result;
});
const matchableFields = computed(() => {
  const mapped = new Set(mappedItems.value.map((item) => item.field));
  return importFields.value.filter((field) => !field.isSubField && mapped.has(field.field));
});
const canStartImport = computed(() => {
  if (!selectedFile.value || mappedItems.value.length === 0) return false;
  if (importMode.value !== FormDataImportMode.AddOnly && !matchField.value) return false;
  if (props.formDef.usingWorkflow && triggerWorkflow.value && dataRowCount.value > 300) return false;
  if (hasMemberOrDepartmentField.value && dataRowCount.value > 10000) return false;
  return true;
});
const isImportRunning = computed(() =>
  !importStatus.value ||
  importStatus.value.status === FormDataImportStatus.Pending ||
  importStatus.value.status === FormDataImportStatus.Processing,
);
const isImportSuccess = computed(() => importStatus.value?.status === FormDataImportStatus.Succeeded);
const isImportFailed = computed(() =>
  importStatus.value?.status === FormDataImportStatus.CompletedWithErrors ||
  importStatus.value?.status === FormDataImportStatus.Failed,
);
const progressPercent = computed(() => {
  const status = importStatus.value;
  if (!status || status.totalCount <= 0) return 0;
  return Math.min(100, Math.round((status.processedCount / status.totalCount) * 100));
});
const progressText = computed(() => {
  const status = importStatus.value;
  if (!status) return "0/0";
  return `${status.processedCount}/${status.totalCount}`;
});
const templateTipParts = computed(() => splitPlaceholder(t("admin.formDataImport.tips.line1", { link: "__LINK__" }), "__LINK__"));
const dropPromptParts = computed(() => splitPlaceholder(t("admin.formDataImport.dropZone.prompt", { action: "__ACTION__" }), "__ACTION__"));
const editableFields = computed(() => {
  const mapped = mappedItems.value.length > 0
    ? mappedItems.value.map((item) => item.field)
    : importFields.value.map((item) => item.field);
  const keys = new Set(mapped);
  return importFields.value.filter((field) => keys.has(field.field));
});
const allErrorsResolved = computed(() => editableRows.value.length > 0 && editableRows.value.every((row) => row.errors.length === 0));

watch(() => props.modelValue, (value) => {
  if (value) {
    resetState();
  } else {
    stopPolling();
  }
});

watch(() => props.formDef.usingWorkflow, (usingWorkflow) => {
  if (!usingWorkflow) {
    triggerWorkflow.value = false;
  }
}, { immediate: true });

watch([sheetName, headerRowIndex], () => {
  autoMapColumns();
});

watch(matchableFields, (fields) => {
  if (importMode.value === FormDataImportMode.AddOnly) {
    matchField.value = "";
    return;
  }

  if (!fields.some((field) => field.field === matchField.value)) {
    matchField.value = fields[0]?.field || "";
  }
});

onBeforeUnmount(() => stopPolling());

function resetState() {
  activeStep.value = 0;
  maximized.value = false;
  importMode.value = FormDataImportMode.AddOnly;
  triggerValidation.value = false;
  triggerWorkflow.value = false;
  previewLoading.value = false;
  submitting.value = false;
  retrying.value = false;
  selectedFile.value = undefined;
  preview.value = undefined;
  sheetName.value = "";
  headerRowIndex.value = 1;
  mappingValues.value = {};
  matchField.value = "";
  taskId.value = "";
  importStatus.value = undefined;
  finalNotified.value = false;
  errorEditorVisible.value = false;
  editableRows.value = [];
  stopPolling();
}

function buildImportFields(items: FieldDef[], fieldPerms?: IFieldPerm[]) {
  const fields: ImportField[] = [];
  for (const field of items) {
    if (field.hidden || field.type === FieldType.Signature) continue;
    if (field.type === FieldType.TableForm) {
      for (const child of field.columns || []) {
        if (child.hidden || child.type === FieldType.Signature) continue;
        if (!canImportField(child, field, fieldPerms)) continue;
        const title = `${field.title}.${child.title}`;
        const key = `${field.field}>${child.field}`;
        fields.push({
          field: key,
          title,
          rawTitle: child.title,
          type: child.type,
          isSubField: true,
          parentField: field.field,
          parentTitle: field.title,
          matchNames: [title, child.title, key, `${field.field}.${child.field}`],
        });
      }
      continue;
    }

    if (!canImportField(field, undefined, fieldPerms)) continue;
    fields.push({
      field: field.field,
      title: field.title,
      rawTitle: field.title,
      type: field.type,
      isSubField: false,
      matchNames: [field.title, field.field],
    });
  }

  return fields;
}

function canImportField(field: FieldDef, parent?: FieldDef, fieldPerms?: IFieldPerm[]) {
  if (fieldPerms === undefined) return true;
  if (parent) {
    const parentPerm = fieldPerms.find((perm) => perm.id === parent.field);
    if (!parentPerm?.visible || !parentPerm.editable) return false;
  }

  const key = parent ? `${parent.field}>${field.field}` : field.field;
  const perm = fieldPerms.find((item) => item.id === key);
  return !!perm?.visible && !!perm.editable;
}

function openFilePicker() {
  if (!previewLoading.value) {
    fileInputRef.value?.click();
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    void useFile(file);
  }
  input.value = "";
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    void useFile(file);
  }
}

async function useFile(file: File) {
  if (!validateFile(file)) return;

  previewLoading.value = true;
  try {
    const result = await formDataService.previewImport(file, props.formDef.id);
    if (!result.sheets || result.sheets.length === 0) {
      ElMessage.warning(t("admin.formDataImport.sheetNotRead"));
      return;
    }

    selectedFile.value = file;
    preview.value = result;
    sheetName.value = result.sheets[0].name;
    headerRowIndex.value = detectHeaderRow(result.sheets[0]);
    autoMapColumns();
    activeStep.value = 1;
  } finally {
    previewLoading.value = false;
  }
}

function validateFile(file: File) {
  const name = file.name.toLowerCase();
  const isXlsx = name.endsWith(".xlsx");
  const isXls = name.endsWith(".xls");
  if (!isXlsx && !isXls) {
    ElMessage.warning(t("admin.formDataImport.messages.unsupportedExt"));
    return false;
  }

  const limit = isXlsx ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > limit) {
    ElMessage.warning(isXlsx ? t("admin.formDataImport.messages.xlsxSizeLimit") : t("admin.formDataImport.messages.xlsSizeLimit"));
    return false;
  }

  return true;
}

function detectHeaderRow(sheet: FormDataImportSheetPreview) {
  const limit = Math.min(sheet.rows.length, 5);
  let bestIndex = 0;
  let bestScore = -1;
  for (let index = 0; index < limit; index += 1) {
    const score = (sheet.rows[index] || []).filter((cell) => !!normalizeCell(cell)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestIndex + 1;
}

function autoMapColumns() {
  const used = new Set<string>();
  const next: Record<number, string> = {};
  for (const column of previewColumns.value) {
    const header = normalizeHeader(column.header);
    if (!header) continue;

    const field = importFields.value.find((item) => !used.has(item.field) && item.matchNames.some((name) => normalizeHeader(name) === header));
    if (!field) continue;

    next[column.index] = field.field;
    used.add(field.field);
  }

  mappingValues.value = next;
}

function setColumnMapping(columnIndex: number, field: string) {
  const next = { ...mappingValues.value };
  for (const key of Object.keys(next)) {
    if (Number(key) !== columnIndex && next[Number(key)] === field) {
      delete next[Number(key)];
    }
  }

  if (field) {
    next[columnIndex] = field;
  } else {
    delete next[columnIndex];
  }

  mappingValues.value = next;
}

function isFieldMappedElsewhere(field: string, columnIndex: number) {
  return Object.entries(mappingValues.value).some(([key, value]) => Number(key) !== columnIndex && value === field);
}

function goMappingStep() {
  autoMapColumns();
  activeStep.value = 2;
}

async function startImport() {
  if (!selectedFile.value || !canStartImport.value) {
    if (props.formDef.usingWorkflow && triggerWorkflow.value && dataRowCount.value > 300) {
      ElMessage.warning(t("admin.formDataImport.messages.workflowRowLimit"));
    } else if (hasMemberOrDepartmentField.value && dataRowCount.value > 10000) {
      ElMessage.warning(t("admin.formDataImport.messages.orgFieldRowLimit"));
    }
    return;
  }

  submitting.value = true;
  activeStep.value = 3;
  importStatus.value = {
    taskId: "",
    status: FormDataImportStatus.Pending,
    totalCount: dataRowCount.value,
    processedCount: 0,
    addCount: 0,
    updateCount: 0,
    failedCount: 0,
    canEditErrors: false,
    editableErrorRowCount: 0,
  };

  try {
    const response = await formDataService.startImport(selectedFile.value, {
      appId: props.formDef.appId,
      formId: props.formDef.id,
      authGroupId: props.authGroupId,
      mode: importMode.value,
      triggerValidation: triggerValidation.value,
      triggerWorkflow: props.formDef.usingWorkflow && triggerWorkflow.value,
      sheetName: sheetName.value,
      headerRowIndex: headerRowIndex.value,
      matchField: importMode.value === FormDataImportMode.AddOnly ? undefined : matchField.value,
      mappings: mappedItems.value,
    });
    taskId.value = response.taskId;
    startPolling();
  } catch {
    activeStep.value = 2;
    importStatus.value = undefined;
  } finally {
    submitting.value = false;
  }
}

function startPolling() {
  stopPolling();
  void refreshImportStatus();
  pollTimer = setInterval(() => void refreshImportStatus(), 2000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
}

async function refreshImportStatus() {
  if (!taskId.value) return;
  let status: FormDataImportStatusResponse;
  try {
    status = await formDataService.getImportStatus(taskId.value);
  } catch {
    stopPolling();
    ElMessage.error(t("admin.formDataImport.messages.statusRefreshFailed"));
    return;
  }

  importStatus.value = status;

  if (
    status.status === FormDataImportStatus.Succeeded ||
    status.status === FormDataImportStatus.CompletedWithErrors ||
    status.status === FormDataImportStatus.Failed
  ) {
    stopPolling();
    notifyFinalStatus(status);
  }
}

function notifyFinalStatus(status: FormDataImportStatusResponse) {
  if (finalNotified.value) return;
  finalNotified.value = true;
  if (status.status === FormDataImportStatus.Succeeded) {
    ElMessage.success(t("admin.formDataImport.messages.success"));
    emit("imported");
    return;
  }

  ElMessage.error(status.status === FormDataImportStatus.CompletedWithErrors ? t("admin.formDataImport.messages.partialFailure") : t("admin.formDataImport.messages.failure"));
  if (status.addCount > 0 || status.updateCount > 0) {
    emit("imported");
  }
}

function finishDialog() {
  dialogVisible.value = false;
}

function downloadErrorReport() {
  if (importStatus.value?.errorReportDownloadUrl) {
    window.open(importStatus.value.errorReportDownloadUrl, "_blank");
  }
}

async function openErrorEditor() {
  if (!taskId.value) return;
  const response = await formDataService.getImportErrors(taskId.value);
  editableRows.value = response.rows.map((row) => ({
    ...row,
    errors: [...(row.errors || [])],
    data: { ...(row.data || {}) },
  }));
  errorEditorVisible.value = true;
}

function hasFieldError(row: FormDataImportEditableErrorRow, field: string) {
  return row.errors.some((error) => error.field === field);
}

function clearFieldErrors(row: FormDataImportEditableErrorRow, field: string) {
  row.errors = row.errors.filter((error) => error.field && error.field !== field);
}

function getEditableValue(row: FormDataImportEditableErrorRow, field: string) {
  if (!field.includes(">")) {
    return formatEditableValue(row.data[field]);
  }

  const [parent, child] = field.split(">");
  const values = Array.isArray(row.data[parent])
    ? row.data[parent].map((item: Record<string, unknown>) => formatEditableValue(item?.[child]))
    : [];
  return values.join("\n");
}

function setEditableValue(row: FormDataImportEditableErrorRow, field: string, value: string) {
  if (!field.includes(">")) {
    row.data[field] = value;
    clearFieldErrors(row, field);
    return;
  }

  const [parent, child] = field.split(">");
  const lines = value.split(/\r?\n/);
  const tableRows = Array.isArray(row.data[parent])
    ? [...row.data[parent]]
    : [];
  if (lines.length > MAX_EDITABLE_ROWS) {
    ElMessage.warning(t("admin.formDataImport.messages.detailRowLimit", { n: MAX_EDITABLE_ROWS }));
    return;
  }
  lines.forEach((line, index) => {
    const target = typeof tableRows[index] === "object" && tableRows[index] != null
      ? { ...tableRows[index] }
      : {};
    target[child] = line;
    tableRows[index] = target;
  });
  row.data[parent] = tableRows;
  clearFieldErrors(row, field);
}

async function submitCorrections() {
  if (!taskId.value || !allErrorsResolved.value) return;
  if (editableRows.value.length === 0 || editableRows.value.length > MAX_EDITABLE_ROWS) {
    ElMessage.warning(t("admin.formDataImport.messages.retryRowLimit", { n: MAX_EDITABLE_ROWS }));
    return;
  }
  retrying.value = true;
  try {
    const response = await formDataService.submitImportCorrections(taskId.value, {
      rows: editableRows.value.map((row) => ({
        dataId: row.dataId,
        data: row.data,
      })),
    });
    editableRows.value = response.rows.map((row) => ({
      ...row,
      errors: [...(row.errors || [])],
      data: { ...(row.data || {}) },
    }));
    errorEditorVisible.value = response.failedCount > 0;
    finalNotified.value = false;
    importStatus.value = await formDataService.getImportStatus(taskId.value);
    notifyFinalStatus(importStatus.value);
  } finally {
    retrying.value = false;
  }
}

async function downloadTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(t("admin.formDataImport.template.sheetName"));
  const groupRow = worksheet.getRow(1);
  const headerRow = worksheet.getRow(2);
  const fields = importFields.value;

  fields.forEach((field, index) => {
    const column = index + 1;
    groupRow.getCell(column).value = field.parentTitle || "";
    headerRow.getCell(column).value = field.rawTitle;
    worksheet.getColumn(column).width = Math.max(14, field.title.length + 4);
  });

  let mergeStart = 0;
  while (mergeStart < fields.length) {
    const parentTitle = fields[mergeStart].parentTitle;
    if (!parentTitle) {
      mergeStart += 1;
      continue;
    }

    let mergeEnd = mergeStart;
    while (mergeEnd + 1 < fields.length && fields[mergeEnd + 1].parentTitle === parentTitle) {
      mergeEnd += 1;
    }

    if (mergeEnd > mergeStart) {
      worksheet.mergeCells(1, mergeStart + 1, 1, mergeEnd + 1);
    }
    mergeStart = mergeEnd + 1;
  }

  worksheet.views = [{ state: "frozen", ySplit: 2 }];
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = t("admin.formDataImport.template.fileNamePattern", { formName: props.formDef.name });
  link.click();
  URL.revokeObjectURL(url);
}

function formatEditableValue(value: unknown) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("，");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function splitPlaceholder(text: string, placeholder: string) {
  const index = text.indexOf(placeholder);
  if (index < 0) {
    return { before: text, after: "" };
  }

  return {
    before: text.slice(0, index),
    after: text.slice(index + placeholder.length),
  };
}

function normalizeCell(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeHeader(value: unknown) {
  return normalizeCell(value).replace(/[\s._\-｜|/\\]/g, "").toLowerCase();
}

function getColumnName(index: number) {
  let value = "";
  let current = index + 1;
  while (current > 0) {
    const mod = (current - 1) % 26;
    value = String.fromCharCode(65 + mod) + value;
    current = Math.floor((current - mod) / 26);
  }

  return value;
}
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-12);
  color: var(--et-text-primary);
  font-weight: 600;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--et-radius-4);
  background: transparent;
  color: var(--et-text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--et-bg-hover);
    color: var(--et-color-primary);
  }
}

.import-shell {
  display: flex;
  flex-direction: column;
  min-height: 460px;
  color: var(--et-text-primary);

  &.maximized {
    min-height: calc(100vh - 160px);
  }
}

.import-steps {
  margin: var(--et-space-8) var(--et-space-48) var(--et-space-22);
}

.step-panel {
  flex: 1;
  min-height: 320px;
}

.option-row,
.check-row,
.preview-toolbar,
.mapping-head {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
}

.option-row {
  margin-bottom: var(--et-space-12);

  &.compact {
    margin-bottom: 0;
  }
}

.option-label {
  flex: 0 0 auto;
  color: var(--et-text-primary);
}

.mode-select,
.sheet-select,
.readonly-input {
  width: 200px;
}

.check-row {
  margin: var(--et-space-8) 0 var(--et-space-14);
}

.workflow-check {
  margin-left: var(--et-space-14);
}

.hint-icon {
  color: var(--et-text-tertiary);
}

.tips-box {
  padding: var(--et-space-14) var(--et-space-18);
  margin-bottom: var(--et-space-20);
  border-radius: var(--et-radius-4);
  background: var(--et-bg-muted);
  color: var(--et-text-primary);
  line-height: 1.7;

  ul {
    margin: 0;
    padding-left: var(--et-space-18);
  }

  a {
    color: var(--et-color-primary);
    text-decoration: none;
  }
}

.drop-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190px;
  border: 1px dashed var(--et-border-color);
  background: var(--et-bg-container);
  cursor: pointer;

  &:hover {
    border-color: var(--et-color-primary);
  }
}

.file-input {
  display: none;
}

.upload-icon {
  margin-bottom: var(--et-space-14);
  color: var(--et-color-primary);
  font-size: 42px;
}

.drop-text {
  color: var(--et-text-primary);

  b {
    color: var(--et-color-primary);
    font-weight: 500;
  }
}

.drop-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--et-bg-container) 86%, transparent);
  color: var(--et-color-primary);
}

.preview-toolbar,
.mapping-head {
  justify-content: flex-start;
  margin-bottom: var(--et-space-16);
}

.mapping-head {
  justify-content: space-between;
}

.muted-text {
  color: var(--et-text-secondary);
}

.mapping-count {
  padding: var(--et-space-8) var(--et-space-12);
  border-radius: var(--et-radius-4);
  background: var(--et-bg-success-soft);
  color: var(--et-color-success);
}

.table-scroll {
  overflow: auto;
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);

  table {
    min-width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    min-width: 150px;
    height: 42px;
    padding: 0 var(--et-space-10);
    border-right: 1px solid var(--et-border-color-light);
    border-bottom: 1px solid var(--et-border-color-light);
    color: var(--et-text-primary);
    text-align: center;
    white-space: nowrap;
  }

  th {
    background: var(--et-bg-muted);
    font-weight: 600;
  }
}

.preview-table {
  min-height: 300px;
  max-height: 360px;
}

.mapping-table {
  min-height: 320px;
  max-height: 380px;
}

.row-index-cell {
  min-width: 90px !important;
  width: 90px;
  color: var(--et-text-secondary);
}

.empty-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--et-text-secondary);
}

.result-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--et-space-12);
  min-height: 360px;
}

.progress-line {
  display: grid;
  grid-template-columns: 320px auto;
  align-items: center;
  gap: var(--et-space-10);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--et-radius-round);
  font-size: 28px;

  &.success {
    background: var(--et-color-success);
    color: var(--et-text-on-success);
  }

  &.warning {
    background: var(--et-color-warning);
    color: var(--et-text-on-warning);
  }
}

.result-actions {
  display: flex;
  gap: var(--et-space-12);
}

.error-text {
  color: var(--et-color-danger);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.help-link {
  color: var(--et-color-primary);
  text-decoration: none;
}

.footer-actions {
  display: flex;
  gap: var(--et-space-10);
}

.error-editor {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-height: 470px;
  border: 1px solid var(--et-border-color-light);
}

.error-list {
  overflow: auto;
  border-right: 1px solid var(--et-border-color-light);
  background: var(--et-bg-muted);
}

.error-card {
  padding: var(--et-space-12);
  border-bottom: 1px solid var(--et-border-color-light);
  color: var(--et-color-danger);

  &.resolved {
    color: var(--et-color-success);
  }
}

.error-row-title {
  margin-bottom: var(--et-space-6);
  color: var(--et-text-primary);
  font-weight: 600;
}

.error-message,
.resolved-text {
  line-height: 1.5;
}

.error-grid-wrap {
  overflow: auto;
  background: var(--et-bg-container);
}

.error-grid {
  min-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    min-width: 150px;
    padding: var(--et-space-8);
    border-right: 1px solid var(--et-border-color-light);
    border-bottom: 1px solid var(--et-border-color-light);
  }

  th {
    background: var(--et-bg-muted);
    color: var(--et-text-primary);
  }

  td.invalid {
    outline: 1px solid var(--et-color-danger);
    outline-offset: -1px;
  }
}
</style>
