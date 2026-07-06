export enum FormDataImportMode {
  AddOnly = 0,
  UpdateOnly = 1,
  Upsert = 2,
}

export enum FormDataImportStatus {
  Pending = 0,
  Processing = 1,
  Succeeded = 2,
  CompletedWithErrors = 3,
  Failed = 4,
}

export enum FormDataImportRowAction {
  Add = 0,
  Update = 1,
}

export interface FormDataImportPreviewResponse {
  sheets: FormDataImportSheetPreview[];
}

export interface FormDataImportSheetPreview {
  name: string;
  rowCount: number;
  columnCount: number;
  rows: string[][];
}

export interface FormDataImportMappingItem {
  columnIndex: number;
  header: string;
  field: string;
  fieldTitle: string;
  fieldType: string;
}

export interface FormDataImportStartRequest {
  appId: string;
  formId: string;
  authGroupId?: string;
  mode: FormDataImportMode;
  triggerValidation: boolean;
  triggerWorkflow: boolean;
  sheetName: string;
  headerRowIndex: number;
  matchField?: string;
  mappings: FormDataImportMappingItem[];
}

export interface FormDataImportStartResponse {
  taskId: string;
  message: string;
}

export interface FormDataImportStatusResponse {
  taskId: string;
  status: FormDataImportStatus;
  totalCount: number;
  processedCount: number;
  addCount: number;
  updateCount: number;
  failedCount: number;
  errorMessage?: string;
  errorReportDownloadUrl?: string;
  canEditErrors: boolean;
  editableErrorRowCount: number;
}

export interface FormDataImportCellError {
  field?: string;
  fieldTitle?: string;
  message: string;
}

export interface FormDataImportEditableErrorRow {
  recordIndex: number;
  startRowNumber: number;
  endRowNumber?: number;
  rowAction: FormDataImportRowAction;
  matchedDataId?: string;
  matchValue?: string;
  data: Record<string, any>;
  errors: FormDataImportCellError[];
}

export interface FormDataImportEditableErrorsResponse {
  rows: FormDataImportEditableErrorRow[];
}

export interface FormDataImportRetryRequest {
  rows: FormDataImportEditableErrorRow[];
}

export interface FormDataImportRetryResponse {
  taskId: string;
}
