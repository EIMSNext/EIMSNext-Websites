import http from "../http/httpClient";

export interface DynamicSelectSourceField {
  formId?: string;
  field?: string;
}

export interface DynamicSelectSource {
  formId?: string;
  label?: DynamicSelectSourceField;
  value?: DynamicSelectSourceField;
}

export interface DynamicSelectOption {
  label: string;
  value: string | number | boolean;
}

export interface DynamicSelectHttpClient {
  api: {
    query?<T>(url: string, data?: unknown): Promise<T[]>;
    post<T>(url: string, data: unknown): Promise<T>;
  };
}

export const dynamicSelectOptionLimit = 100;

export function isDynamicSelectSource(source?: DynamicSelectSource): boolean {
  return !!resolveDynamicSelectSource(source);
}

export function buildDynamicSelectQuery(source: DynamicSelectSource, keyword?: string) {
  const resolved = resolveDynamicSelectSource(source);
  if (!resolved) return undefined;

  return {
    skip: 0,
    take: dynamicSelectOptionLimit,
    keyword: keyword?.trim() || undefined,
    searchFields: keyword?.trim() ? [resolved.labelField] : undefined,
    select: [
      { field: "id", visible: true },
      { field: "appId", visible: true },
      { field: "formId", visible: true },
      { field: `data.${resolved.labelField}`, visible: true },
      ...(resolved.valueField === resolved.labelField ? [] : [{ field: `data.${resolved.valueField}`, visible: true }]),
    ],
    sort: [{ field: "createTime", dir: -1 }],
    filter: {
      rel: "and",
      items: [{ field: "formId", type: "none", op: "eq", value: resolved.formId }],
    },
  };
}

export function mapDynamicSelectOptions(rows: unknown[], source: DynamicSelectSource): DynamicSelectOption[] {
  const resolved = resolveDynamicSelectSource(source);
  if (!resolved) return [];

  const values = new Set<string>();
  const options: DynamicSelectOption[] = [];
  rows.forEach((row: any) => {
    const data = row?.data || {};
    const label = unwrapLabelValue(data[resolved.labelField]);
    const value = unwrapValue(data[resolved.valueField]);
    if (label === undefined || label === null || value === undefined || value === null) return;

    const key = String(value);
    if (values.has(key)) return;
    values.add(key);
    options.push({ label: String(label), value: value as string | number | boolean });
  });
  return options;
}

export async function loadDynamicSelectOptions(
  source: DynamicSelectSource,
  keyword?: string,
  client: DynamicSelectHttpClient = http,
): Promise<DynamicSelectOption[]> {
  const query = buildDynamicSelectQuery(source, keyword);
  if (!query) return [];
  const response = client.api.query
    ? await client.api.query<unknown>("/FormData/$query", query)
    : await client.api.post<{ value?: unknown[] }>("/FormData/$query", query);
  const rows = Array.isArray(response) ? response : response.value || [];
  return mapDynamicSelectOptions(rows, source);
}

function resolveDynamicSelectSource(source?: DynamicSelectSource) {
  const formId = source?.formId || source?.label?.formId || source?.value?.formId;
  const labelField = source?.label?.field;
  const valueField = source?.value?.field;
  return formId && labelField && valueField ? { formId, labelField, valueField } : undefined;
}

function unwrapLabelValue(value: unknown): unknown {
  if (value && typeof value === "object") {
    const option = value as { label?: unknown; value?: unknown };
    return option.label ?? option.value;
  }
  return value;
}

function unwrapValue(value: unknown): unknown {
  if (value && typeof value === "object") {
    const option = value as { label?: unknown; value?: unknown };
    return option.value ?? option.label;
  }
  return value;
}
