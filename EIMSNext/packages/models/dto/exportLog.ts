import { CorpModelBase } from "./modelBase";

export enum ExportType {
  AuditLogin = 0,
  AuditLog = 1,
  FormData = 2,
}

export enum ExportFormat {
  Csv = 0,
  Excel = 1,
}

export enum ExportLogStatus {
  Pending = 0,
  Processing = 1,
  Succeeded = 2,
  Failed = 3,
}

export enum ExportColumnType {
  String = 0,
  Number = 1,
  Date = 2,
}

export interface ExportColumn {
  key: string;
  header: string;
  type: ExportColumnType;
}

export interface AuditLoginExportRequest {
  format: ExportFormat;
  columns: ExportColumn[];
  userName?: string;
  startTime?: number;
  endTime?: number;
}

export interface AuditLogExportRequest {
  format: ExportFormat;
  columns: ExportColumn[];
  entityType?: string;
  action?: string;
  operatorName?: string;
  startTime?: number;
  endTime?: number;
}

export interface FormDataExportRequest {
  format: ExportFormat;
  columns: ExportColumn[];
  formId: string;
  filter?: any;
  authGroupId?: string;
}

export interface ExportResponse {
  taskId: string;
  isDuplicate: boolean;
  actualFormat: ExportFormat;
  message?: string;
}

export interface ExportLog extends CorpModelBase {
  exportType: ExportType;
  requestedFormat: ExportFormat;
  actualFormat: ExportFormat;
  status: ExportLogStatus;
  columnsJson?: string;
  filterJson?: string;
  dedupKey?: string;
  totalCount?: number;
  fileName?: string;
  downloadUrl?: string;
  errorMessage?: string;
  finishTime?: number;
}
