<template>
  <div class="viewer-container">
    <el-popover
      :visible="showSort"
      :virtual-ref="sortRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DashSort
        :model-value="setting.sort"
        :sort-fields="sortFields as any"
        @ok="setSort"
        @cancel="showSort = false"
      />
    </el-popover>

    <DetailTableRowPreview
      v-model="showRowPreview"
      :title="title"
      :form-def="formDef"
      :records="rows"
      :display-fields="setting.displayFields"
      :current-index="selectedRowIndex"
      @change-index="selectedRowIndex = $event"
      @open-raw="openRawData"
    />

    <et-dialog
      v-model="showRawDialog"
      class="formdatadialog"
      :title="formDef?.name || title"
      :show-footer="false"
      :destroy-on-close="true"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="rawDialogLoading" class="raw-dialog-body">
        <FormDataView
          v-if="showRawDialog && selectedDataId && formDef && (!setting.inheritDataActionPerms || !rawDialogLoading)"
          :formId="setting.datasource.id"
          :dataId="selectedDataId"
          :formDataPermissions="rawFormDataPermissions"
          :formFieldPermissions="rawFormFieldPermissions"
          @ok="handleRawDetailOk"
        />
      </div>
    </et-dialog>

    <div v-if="showHeader" class="view-header">
      <div class="header-actions">
        <div v-if="!designerMode" class="header-btn no-drag" @click.stop="reloadData">
          <et-icon icon="el-refresh" size="16px" />
        </div>
        <div ref="sortRef" class="header-btn no-drag" @click.stop="onSort">
          <et-icon icon="el-sort" size="16px" />
        </div>
      </div>
      <div class="header-title" :title="title">{{ title }}</div>
    </div>

    <div class="viewer-body" :class="{ 'with-header': showHeader }">
      <template v-if="detailTableSettingValidate(setting)">
        <template v-if="formDef && columns.length > 0">
          <el-table
            :data="flattedRows"
            height="100%"
            stripe
            class="viewer-table no-drag"
            @row-click="handleRowClick"
          >
            <el-table-column
              v-if="setting.showIndex"
              type="index"
              width="64"
              :index="resolveIndex"
              :fixed="effectiveFixedColumns > 0 ? 'left' : false"
            />
            <el-table-column
              v-for="(column, index) in columns"
              :key="column.field"
              :prop="column.field"
              :label="column.title"
              :width="column.width"
              :fixed="index < effectiveFixedColumns ? 'left' : false"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span>{{ formatCellValue(row, column) || "-" }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="viewer-footer no-drag">
            <el-pagination
              small
              background
              :current-page="pageNum"
              :page-size="pageSize"
              :page-sizes="[10, 20, 30, 50, 100]"
              layout="sizes, total, prev, pager, next"
              :total="displayTotal"
              :pager-count="5"
              @size-change="onPageSizeChange"
              @current-change="onPageChange"
            />
          </div>
        </template>
        <el-empty
          v-else
          :description="formDef ? t('admin.dashboardDetailTableDesigner.noDisplayFields') : t('admin.dashItem.invalidConfig')"
        />
      </template>
      <el-empty v-else :description="t('admin.dashItem.invalidConfig')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { buildFieldListItems, buildSortFieldListItems, findFieldDef, flattenDataItem, formatFormValue, IConditionList, IFieldSortList, toDynamicFilter } from "@eimsnext/components";
import {
  FormDataPermissions,
  DashboardItemDef,
  FieldType,
  FlowStatus,
  FormData,
  FormDef,
  FormFieldPermission,
  ITableColumn,
  SystemField,
} from "@eimsnext/models";
import { AggCalcRequest, AggPreviewRequest, aggregateService, formDataService, IFormDataPermissionScopeResponse } from "@eimsnext/services";
import { useFormStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";
import DashSort from "../components/DashSort.vue";
import FormDataView from "@/views/form/components/FormDataView.vue";
import DetailTableRowPreview from "./DetailTableRowPreview.vue";
import { buildDetailTableColumns, detailTableSettingValidate, IDetailTableSetting } from "./type";
import { usePublicHttp } from "@/views/public/shared";

const { t } = useI18n();

defineOptions({
  name: "DetailTableViewer",
});

const props = withDefaults(
  defineProps<{
    setting: IDetailTableSetting;
    title: string;
    showHeader?: boolean;
    designerMode?: boolean;
    externalFilter?: IConditionList;
    isPublic?: boolean;
    publicToken?: string;
    itemDef?: DashboardItemDef;
  }>(),
  {
    showHeader: true,
    designerMode: false,
  },
);

const formStore = useFormStore();
const publicHttp = usePublicHttp();

watch(
  () => props.publicToken,
  (token) => {
    publicHttp.token.value = token || null;
  },
  { immediate: true },
);

const formDef = ref<FormDef>();
const columns = ref<ITableColumn[]>([]);
const sortFields = ref<any[]>([]);
const rows = ref<FormData[]>([]);
const flattedRows = ref<Record<string, any>[]>([]);
const rawTotal = ref(0);
const displayTotal = ref(0);
const pageNum = ref(1);
const pageSize = ref(props.setting.pageSize || 20);
const showSort = ref(false);
const sortRef = ref();
const isMobile = ref(false);
const showRowPreview = ref(false);
const selectedRowIndex = ref(0);
const showRawDialog = ref(false);
const rawDialogLoading = ref(false);
const selectedDataId = ref("");
const permissionScope = ref<IFormDataPermissionScopeResponse>();
const noAccessFormFieldPermissions = ref<FormFieldPermission[]>([]);

const flowStatusMap: Record<number, string> = {
  [FlowStatus.Draft]: "draft",
  [FlowStatus.Approving]: "approving",
  [FlowStatus.Approved]: "approved",
  [FlowStatus.Rejected]: "rejected",
  [FlowStatus.Suspended]: "suspended",
  [FlowStatus.Discarded]: "discarded",
};

const effectiveFixedColumns = computed(() => {
  return isMobile.value ? props.setting.fixedMobileColumns || 0 : props.setting.fixedLeftColumns || 0;
});

const rawFormDataPermissions = computed(() => {
  return props.setting.inheritDataActionPerms ? permissionScope.value?.formDataPermissions ?? FormDataPermissions.None : FormDataPermissions.None;
});

const rawFormFieldPermissions = computed<FormFieldPermission[] | undefined>(() => {
  if (!props.setting.inheritDataActionPerms) {
    return undefined;
  }

  if (permissionScope.value?.formDataPermissions === FormDataPermissions.None && (permissionScope.value.formFieldPermissions?.length || 0) === 0) {
    return noAccessFormFieldPermissions.value;
  }

  return permissionScope.value?.formFieldPermissions || undefined;
});

const updateViewportState = () => {
  isMobile.value = window.innerWidth <= 768;
};

const buildNoAccessFormFieldPermissions = (form: FormDef): FormFieldPermission[] => {
  return buildFieldListItems(form.id, form.content?.items || [], !!form.usingWorkflow, undefined, { t } as any)
    .map((item) => item.data)
    .filter(Boolean)
    .map((field: any) => ({
      id: field.field,
      visible: false,
      editable: false,
      tableInsert: false,
      tableEdit: false,
      tableDelete: false,
    }));
};

const buildAggRequest = (skip: number, take: number): AggCalcRequest => {
  return {
    itemId: props.itemDef?.id || "",
    filter: props.externalFilter ? toDynamicFilter(props.externalFilter) : undefined,
    sort: props.setting.sort?.items
      ? props.setting.sort.items.map((s) => ({ id: s.field.field, type: FieldType.Input, dir: s.sort }))
      : undefined,
    skip,
    take,
  };
};

const loadFormContext = async () => {
  if (!props.setting.datasource?.id) {
    formDef.value = undefined;
    columns.value = [];
    sortFields.value = [];
    noAccessFormFieldPermissions.value = [];
    return;
  }

  const form = props.isPublic && props.publicToken
    ? await publicHttp.odata.get<FormDef>("FormDef", props.setting.datasource.id)
    : await formStore.get(props.setting.datasource.id);
  formDef.value = form;
  if (!form) {
    columns.value = [];
    sortFields.value = [];
    noAccessFormFieldPermissions.value = [];
    return;
  }

  if (props.isPublic) {
    columns.value = (props.setting.displayFields || []).map((f: any) => ({
      field: f.field,
      oriField: f.oriField,
      title: f.title,
      type: f.type,
      width: f.width,
    }));
    sortFields.value = props.setting.displayFields || [];
  } else {
    columns.value = buildDetailTableColumns(form, props.setting.displayFields || [], t);
    sortFields.value = buildSortFieldListItems(form.id, form.content?.items || [], !!form.usingWorkflow, undefined, { t } as any)
      .map((item) => item.data)
      .filter(Boolean);
  }
  noAccessFormFieldPermissions.value = buildNoAccessFormFieldPermissions(form);
};

const buildQueryOptions = null; // (legacy formDataService path removed — use buildAggRequest)

const getVisibleTotal = (total: number) => {
  if (!props.setting.showTop) {
    return total;
  }

  const take = props.setting.take || 0;
  return take > 0 ? Math.min(total, take) : total;
};

const normalizeFlatRow = (row: Record<string, any>) => {
  Object.keys(row).forEach((key) => {
    const value = row[key];
    if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
      row[key] = value.map((item: any) => Array.isArray(item) && item.length > 0 ? item[0] : item);
    }
  });
  return row;
};

const processRows = () => {
  const childParents = Array.from(new Set((props.setting.displayFields || [])
    .filter((field) => field.isSubField)
    .map((field) => field.field.split(">")[0])));

  if (rows.value.length === 0) {
    flattedRows.value = [];
    return;
  }

  flattedRows.value = [];
  rows.value.forEach((item) => {
    const baseRow = normalizeFlatRow(flattenDataItem(item));
    if (childParents.length === 0) {
      flattedRows.value.push({ ...baseRow });
      return;
    }

    let maxItemCount = 0;
    childParents.forEach((parentField) => {
      maxItemCount = Math.max(maxItemCount, (item.data?.[parentField] || []).length);
    });

    if (maxItemCount === 0) {
      flattedRows.value.push({ ...baseRow });
      return;
    }

    for (let index = 0; index < maxItemCount; index += 1) {
      const row = { ...baseRow };
      childParents.forEach((parentField) => {
        const child = item.data?.[parentField]?.[index];
        if (!child || typeof child !== "object") {
          return;
        }

        Object.keys(child).forEach((childField) => {
          row[`${parentField}>${childField}`] = child[childField];
        });
      });
      flattedRows.value.push(normalizeFlatRow(row));
    }
  });
};

const loadCount = async () => {
  if (!props.setting.datasource?.id) {
    rawTotal.value = 0;
    displayTotal.value = 0;
    return;
  }

  const req = buildAggRequest(0, 0);
  if (!req.itemId) {
    rawTotal.value = 0;
    displayTotal.value = 0;
    return;
  }
  const previewReq: AggPreviewRequest = { ...req, details: JSON.stringify(props.setting) };
  const count = props.designerMode
    ? await aggregateService.previewCount(previewReq)
    : props.isPublic && props.publicToken
    ? await publicHttp.api.post<number>("/aggregate/$count", req)
    : await aggregateService.count(req);
  rawTotal.value = count;
  displayTotal.value = getVisibleTotal(count);

  const maxPage = Math.max(1, Math.ceil(Math.max(displayTotal.value, 1) / pageSize.value));
  if (pageNum.value > maxPage) {
    pageNum.value = 1;
  }
};

const loadRows = async () => {
  if (!props.setting.datasource?.id) {
    rows.value = [];
    flattedRows.value = [];
    return;
  }

  const skip = (pageNum.value - 1) * pageSize.value;
  const visibleTotal = getVisibleTotal(rawTotal.value);
  const remaining = Math.max(visibleTotal - skip, 0);
  if (remaining <= 0) {
    rows.value = [];
    flattedRows.value = [];
    return;
  }

  const take = props.setting.showTop ? Math.min(pageSize.value, remaining) : pageSize.value;
  const req = buildAggRequest(skip, take);
  if (!req.itemId) {
    rows.value = [];
    flattedRows.value = [];
    return;
  }
  const previewReq: AggPreviewRequest = { ...req, details: JSON.stringify(props.setting) };
  const data = props.designerMode
    ? await aggregateService.preview(previewReq)
    : props.isPublic && props.publicToken
    ? await publicHttp.api.post<any[]>("/aggregate/calucate", req)
    : await aggregateService.calucate(req);
  rows.value = (data || []).map((d: any) => ({
    id: d.id,
    formId: d.formId,
    data: d.data || {},
  } as FormData));
  processRows();
};

const reloadData = async () => {
  if (!detailTableSettingValidate(props.setting)) {
    rows.value = [];
    flattedRows.value = [];
    rawTotal.value = 0;
    displayTotal.value = 0;
    return;
  }

  await loadCount();
  await loadRows();
};

const resolveIndex = (index: number) => {
  return (pageNum.value - 1) * pageSize.value + index + 1;
};

const getFieldDefByColumn = (column: ITableColumn) => {
  return formDef.value ? findFieldDef(formDef.value, column.oriField, t) : undefined;
};

const formatCellValue = (row: Record<string, any>, column: ITableColumn) => {
  const value = row[column.field];
  if (column.field === SystemField.FlowStatus) {
    const key = flowStatusMap[Number(value)];
    return key ? t(`common.flowStatus.${key}`) : String(value ?? "");
  }

  const fieldDef = getFieldDefByColumn(column);
  return formatFormValue(value, fieldDef || { type: column.type, format: column.format });
};

const handleRowClick = (row: Record<string, any>) => {
  if (props.designerMode) {
    return;
  }
  if (props.isPublic) {
    return;
  }

  const rowIndex = rows.value.findIndex((item) => item.id === row.id);
  if (rowIndex < 0) {
    return;
  }

  selectedRowIndex.value = rowIndex;
  showRowPreview.value = true;
};

const onSort = () => {
  if (sortFields.value.length === 0) {
    return;
  }
  showSort.value = true;
};

const setSort = async (sort: IFieldSortList) => {
  props.setting.sort = sort;
  pageNum.value = 1;
  showSort.value = false;
  await reloadData();
};

const onPageSizeChange = async (value: number) => {
  pageSize.value = value;
  pageNum.value = 1;
  await reloadData();
};

const onPageChange = async (value: number) => {
  pageNum.value = value;
  await loadRows();
};

const openRawData = async (record: FormData) => {
  selectedDataId.value = record.id;
  showRowPreview.value = false;
  rawDialogLoading.value = true;
  permissionScope.value = undefined;
  showRawDialog.value = true;

  try {
    if (props.setting.inheritDataActionPerms) {
      permissionScope.value = await formDataService.getPermissionScope(record.id, props.setting.datasource.id);
    }
  } catch {
    permissionScope.value = {
      formDataPermissions: FormDataPermissions.None,
      formFieldPermissions: [],
    };
  } finally {
    rawDialogLoading.value = false;
  }
};

const handleRawDetailOk = async () => {
  await reloadData();
  showRawDialog.value = false;
};

watch(
  () => props.setting.datasource?.id,
  async () => {
    pageNum.value = 1;
    pageSize.value = props.setting.pageSize || 20;
    await loadFormContext();
    await reloadData();
  },
  { immediate: true },
);

watch(
  () => props.setting,
  async () => {
    if (!formDef.value && props.setting.datasource?.id) {
      await loadFormContext();
    } else if (formDef.value && !props.isPublic) {
      columns.value = buildDetailTableColumns(formDef.value, props.setting.displayFields || [], t);
    } else if (props.isPublic) {
      columns.value = (props.setting.displayFields || []).map((f: any) => ({
        field: f.field,
        oriField: f.oriField,
        title: f.title,
        type: f.type,
        width: f.width,
      }));
    }

    pageSize.value = props.setting.pageSize || 20;
    pageNum.value = 1;
    await reloadData();
  },
  { deep: true },
);

watch(
  () => props.externalFilter,
  async () => {
    pageNum.value = 1;
    // count 已根据 conditions 变化触发，这里只重查 calucate
    await loadRows();
  },
  { deep: true },
);

const queryContext = computed(() => ({
  datasource: props.setting.datasource,
  filter: props.setting.filter,
  externalFilter: props.externalFilter,
  itemId: props.itemDef?.id,
}));

watch(
  queryContext,
  async () => {
    if (!props.setting.datasource?.id) return;
    await loadCount();
    pageNum.value = 1;
    await loadRows();
  },
  { deep: true, immediate: false },
);

onMounted(() => {
  updateViewportState();
  window.addEventListener("resize", updateViewportState);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateViewportState);
});
</script>

<style scoped lang="scss">
.viewer-container {
  width: 100%;
  height: 100%;
}

.view-header {
  height: var(--et-size-30);
  line-height: var(--et-line-height-30);
  padding: var(--et-space-20);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: var(--et-z-base);
  font-size: var(--et-font-size-14);
  color: var(--et-text-primary);

  .header-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-actions {
    background: transparent;
    color: var(--et-text-secondary);
    cursor: pointer;
    float: right;

    .header-btn {
      width: var(--et-size-30);
      height: var(--et-size-30);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.viewer-body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &.with-header {
    padding-top: var(--et-space-20);
  }
}

.viewer-table {
  flex: 1 1 auto;
}

.viewer-footer {
  flex: 0 0 auto;
  padding: var(--et-space-10) var(--et-space-12) var(--et-space-4);
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--et-bg-container);
}

.raw-dialog-body {
  min-height: 200px;
}

:deep(.viewer-table .el-table__header-wrapper th.el-table__cell),
:deep(.viewer-table .el-table__fixed-header-wrapper th.el-table__cell) {
  background: var(--el-fill-color-light);
}

:deep(.viewer-footer .el-pagination) {
  justify-content: flex-end;
}
</style>
