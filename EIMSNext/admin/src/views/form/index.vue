<template>
  <div class="formdata-container">
    <el-dialog v-model="showExportDialog" :title="$t('admin.formList.exportDialogTitle')" width="520px">
      <el-form label-width="90px">
        <el-form-item :label="$t('admin.exportFormat')">
          <el-radio-group v-model="exportFormat">
            <el-radio :value="ExportFormat.Csv">CSV</el-radio>
            <el-radio :value="ExportFormat.Excel">Excel</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('admin.exportColumns')">
          <el-checkbox-group v-model="selectedExportColumnKeys" class="export-column-group">
            <el-checkbox v-for="column in exportColumns" :key="column.key" :value="column.key">
              {{ column.header }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportDialog = false">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="exporting" @click="submitExport">{{ $t("common.ok") }}</el-button>
      </template>
    </el-dialog>
    <et-dialog v-model="showAddDialog" class="formdatadialog" :title="formDef?.name" :show-footer="false"
      :destroy-on-close="true" width="800px" :close-on-click-modal="false">
      <div class="form-container">
        <AddFormData :formId="formId" :isView="false" :fieldPerms="fieldPerms" @save="onDataSaved"
          @submit="onDataSaved"></AddFormData>
      </div>
    </et-dialog>
    <EtConfirmDialog v-model="showDeleteConfirmDialog" :title="t('common.message.deleteConfirm_Title')"
      :icon="MessageIcon.Warning" :showNoSave="false" @ok="execDelete">
      <div>{{ t("common.message.deleteConfirm_Content", [checkedDatas.length]) }}</div>
    </EtConfirmDialog>
    <et-dialog v-model="showDetailsDialog" class="formdatadialog" :title="formDef?.name" :show-footer="false"
      :destroy-on-close="true" width="800px" :close-on-click-modal="false">
      <div class="form-container">
        <FormDataView :formId="formId" :dataId="selectedData!.id" :dataPerms="dataPerms" :fieldPerms="fieldPerms" :authGroupId="curAuthGrp?.id"
          @ok="handleViewOk"></FormDataView>
      </div>
    </et-dialog>
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" virtual-triggering :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" :formId="formId" @ok="setFilter" @cancel="showFilter = false"></DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" virtual-triggering :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" :formId="formId" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
    <el-popover :visible="showField" :virtual-ref="fieldBtnRef" virtual-triggering :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataField :model-value="fieldList" :formId="formId" @ok="setField" @cancel="showField = false"></DataField>
    </el-popover>
    <et-toolbar class="form-list-toolbar" :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>
    <div v-if="availableViews.length > 0" class="view-tabs">
      <button
        v-for="view in availableViews"
        :key="view.id"
        type="button"
        class="view-tab"
        :class="{ active: curListView?.id === view.id }"
        @click="switchView(view.id)"
      >
        <span class="view-tab-icon"></span>
        {{ view.name }}
      </button>
    </div>
    <div class="data-list data-list-full-height">
      <FormListViewRenderer
        v-if="formDef && curListView"
        :form-def="formDef"
        :view="curListView"
        :settings="curListViewSettings"
        :rows="dataRef || []"
        :columns="columns"
        :flatted-data="flattedData"
        :span-method="idBasedSpanMethod"
        :selectable="selectable"
        :display-fields="listViewDisplayFields"
        @selection-change="selectionChanged"
        @row-click="showDetails"
      />
      <pagination :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { bus } from "@eimsnext/utils";
import { useRoute } from "vue-router";
import { useFormStore, useUserStore } from "@eimsnext/store";
import {
  FormDef,
  FormData,
  FieldDef,
  SystemField,
  FlowStatus,
  FieldType,
  ExportColumn,
  ExportColumnType,
  ExportFormat,
  getDataTitle,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
  getUpdateTime,
  AuthGroup,
  UserType,
  IFieldPerm,
  DataPerms,
  FormListView,
  FormListViewField,
  FormListViewSettings,
  FormListViewType,
} from "@eimsnext/models";
import { ITableColumn, buildColumns } from "./type";
import {
  IDynamicFindOptions,
  authGroupService,
  formDataService,
  formListViewService,
} from "@eimsnext/services";
import {
  MessageIcon,
  ToolbarItem,
  IConditionList,
  toDynamicFindOptions,
  IFieldSortList,
  IFormFieldDef,
  IToolbarItemDropdownItem,
} from "@eimsnext/components";
import { getAuthGroupDataPerms, hasDataPerm } from "@/utils/common";
import Pagination from "../../components/Pagination/index.vue";
import { useI18n } from "vue-i18n";
import FormListViewRenderer from "./components/FormListViewRenderer.vue";
import {
  createDefaultFormListView,
  getViewDisplayFields,
  parseCondition,
  parseSort,
  parseViewSettings,
} from "./listViewUtils";
const { t } = useI18n();

const displayItemCount = 3; //最多显示3条明细
const showAddDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const showExportDialog = ref(false);
const exporting = ref(false);
const columns = ref<ITableColumn[]>([]);
const route = useRoute();
const formStore = useFormStore();
const formId = route.params.formId.toString();
const formDef = ref<FormDef>();
const filterBtnRef = ref();
const sortBtnRef = ref();
const fieldBtnRef = ref();
const authGrps = ref<AuthGroup[]>([]);
const curAuthGrp = ref<AuthGroup>();
const fieldPerms = ref<IFieldPerm[]>();
const listViews = ref<FormListView[]>([]);
const curListView = ref<FormListView>();
const curListViewSettings = ref<FormListViewSettings>({});
const listViewDisplayFields = ref<FormListViewField[]>([]);
const userStore = useUserStore();
const { currentUser } = userStore;

const dataPerms = computed(() => getAuthGroupDataPerms(curAuthGrp.value));
const canAdd = computed(() => hasDataPerm(currentUser.userType, DataPerms.AddNew, dataPerms.value));
const canRemove = computed(() =>
  hasDataPerm(currentUser.userType, DataPerms.Remove, dataPerms.value)
);
const availableViews = computed(() => {
  if (!formDef.value) return [];
  const source = listViews.value.length > 0 ? listViews.value : [createDefaultFormListView(formDef.value, t)];
  const authGroupId = curAuthGrp.value?.id;
  return source.filter((view) => {
    if (view.disabled) return false;
    if (!authGroupId || !view.authGroupIds || view.authGroupIds.length === 0) return true;
    return view.authGroupIds.includes(authGroupId);
  });
});

const leftBars = ref<ToolbarItem[]>([
  {
    type: "dropdown",
    config: {
      text: "admin.formList.selectPermGroup",
      class: "auth-gropu-filter",
      command: "authgrp",
      visible: false,
      showDynamicText: true,
      onCommand: (cmd) => {
        curAuthGrp.value = authGrps.value.find((x) => x.id == cmd);
        fieldPerms.value = curAuthGrp.value?.fieldPerms;

        applyCurrentView(curListView.value?.id);
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.addNew",
      type: "primary",
      command: "add",
      visible: canAdd,
      icon: "el-plus",
      onCommand: () => {
        showAddDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.delete",
      command: "delete",
      visible: canRemove,
      icon: "el-delete",
      disabled: true,
    },
  },
  // { type: "button", config: { text: "导入", command: "upload", icon: "el-upload" } },
  // { type: "button", config: { text: "导出", command: "download", icon: "el-download" } }
]);

const rightBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: "common.filter",
      class: "data-filter",
      command: "filter",
      visible: true,
      icon: "el-filter",
      onCommand: (cmd: string, e: MouseEvent) => {
        ((filterBtnRef.value = e.currentTarget), (showSort.value = showField.value = false));
        showFilter.value = !showFilter.value;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.sort",
      class: "data-filter",
      command: "sort",
      visible: true,
      icon: "el-sort",
      onCommand: (cmd: string, e: MouseEvent) => {
        ((sortBtnRef.value = e.currentTarget), (showFilter.value = showField.value = false));
        showSort.value = !showSort.value;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.fields",
      class: "data-filter",
      command: "list",
      visible: true,
      icon: "el-list",
      onCommand: (cmd: string, e: MouseEvent) => {
        ((fieldBtnRef.value = e.currentTarget), (showFilter.value = showSort.value = false));
        showField.value = !showField.value;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.export",
      class: "data-filter",
      command: "download",
      visible: true,
      icon: "el-download",
      onCommand: () => {
        openExportDialog();
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.refresh",
      class: "data-filter",
      command: "refresh",
      visible: true,
      icon: "el-refresh",
      onCommand: () => {
        handleQuery();
      },
    },
  },
]);

const toolbarHandler = (cmd: string, e: MouseEvent) => {
  switch (cmd) {
    case "delete":
      {
        if (checkedDatas.value.length > 0) {
          showDeleteConfirmDialog.value = true;
        }
      }
      break;
  }
};

const openExportDialog = () => {
  selectedExportColumnKeys.value = exportColumns.value.map((item) => item.key);
  exportFormat.value = ExportFormat.Csv;
  showExportDialog.value = true;
};

const submitExport = async () => {
  const selectedColumns = exportColumns.value.filter((item) =>
    selectedExportColumnKeys.value.includes(item.key)
  );

  if (selectedColumns.length === 0) {
    ElMessage.warning(t("admin.selectColumn"));
    return;
  }

  exporting.value = true;
  try {
    const result = await formDataService.export({
      format: exportFormat.value,
      columns: selectedColumns,
      formId,
      filter: queryParams.value.filter,
      authGroupId: curAuthGrp.value?.id,
    });

    showExportDialog.value = false;
    ElMessage.success(
      result.message ||
        (result.isDuplicate
          ? t("admin.corpLog.messages.duplicateExport")
          : t("admin.corpLog.messages.exportCreated"))
    );
  } finally {
    exporting.value = false;
  }
};

const loadFormContext = async () => {
  const form = await formStore.get(formId);
  if (!form) return;

  formDef.value = form;
  if (userStore.currentUser.userType == UserType.Employee) {
    const res = await authGroupService.query<AuthGroup>(`$filter=appid eq '${form.appId}' AND formid eq '${form.id}'`);
    authGrps.value = res;
    if (res.length > 0) {
      curAuthGrp.value = res[0];
      fieldPerms.value = curAuthGrp.value.fieldPerms;

      const menuItems: IToolbarItemDropdownItem[] = res.map((x) => {
        return { text: x.name, command: x.id, visible: true };
      });
      menuItems[0].checked = true;

      const grpItem = leftBars.value.find((x) => x.config.command == "authgrp");
      if (grpItem) {
        grpItem.config.menuItems = menuItems;
        grpItem.config.visible = true;
      }
    }
  }

  listViews.value = await formListViewService.query<FormListView>(`$filter=formid eq '${form.id}'&$orderby=sortIndex asc,createTime asc`);
  applyCurrentView();
};

void loadFormContext();

const queryParams = ref<IDynamicFindOptions>({
  skip: 0,
  take: 20,
});

const totalRef = ref(0);
const dataRef = ref<FormData[]>();
const showFilter = ref(false);
const condList = ref<IConditionList>({ id: "", rel: "and", items: [] });
const showSort = ref(false);
const sortList = ref<IFieldSortList>({ items: [] });
const showField = ref(false);
const fieldList = ref<IFormFieldDef[]>([]);
const pageNum = ref(1);
const pageSize = ref(20);
const selectedData = ref<FormData>();
const showDetailsDialog = ref(false);
const checkedDatas = ref<any[]>([]);
const exportFormat = ref<ExportFormat>(ExportFormat.Csv);
const selectedExportColumnKeys = ref<string[]>([]);

const exportColumns = computed<ExportColumn[]>(() => buildExportColumns());

const applyCurrentView = (preferredViewId?: string) => {
  if (!formDef.value) return;

  const nextView =
    availableViews.value.find((view) => view.id === preferredViewId) ||
    availableViews.value[0] ||
    createDefaultFormListView(formDef.value, t);

  curListView.value = nextView;
  curListViewSettings.value = parseViewSettings(nextView.settings);

  const displayFields = getViewDisplayFields(formDef.value, nextView, curListViewSettings.value, t);
  fieldList.value = displayFields;
  listViewDisplayFields.value = displayFields.map((field) => ({
    field: field.field,
    label: field.label,
    type: field.type,
    isSubField: field.isSubField,
  }));
  condList.value = parseCondition(nextView.defaultFilter);
  sortList.value = parseSort(formId, nextView.defaultSort, t);
  pageNum.value = 1;

  initChildrenField(formDef.value.content?.items || [], fieldList.value, fieldPerms.value);
  columns.value = buildColumns(
    formDef.value.content?.items || [],
    formDef.value.usingWorkflow,
    fieldList.value,
    fieldPerms.value,
    t,
  );
  updateQueryParams();
  handleQuery();
};

const switchView = (viewId: string) => {
  applyCurrentView(viewId);
};

const selectionChanged = (rows: any[]) => {
  checkedDatas.value = rows;
  leftBars.value.find((x) => x.config.command == "delete")!.config.disabled =
    checkedDatas.value.length == 0;
};
const execDelete = () => {
  formDataService
    .delete("batch", { keys: checkedDatas.value.map((x) => x[SystemField.Id]) })
    .then(() => {
      showDeleteConfirmDialog.value = false;
      checkedDatas.value = [];
      handleQuery();
    });
};

const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;

  updateQueryParams();
  handleQuery();
};

const setSort = (sort: IFieldSortList) => {
  sortList.value = sort;
  showSort.value = false;

  updateQueryParams();
  handleQuery();
};

const setField = (fields: IFormFieldDef[]) => {
  fieldList.value = fields;
  listViewDisplayFields.value = fields.map((field) => ({
    field: field.field,
    label: field.label,
    type: field.type,
    isSubField: field.isSubField,
  }));
  showField.value = false;
  initChildrenField(formDef.value!.content?.items!, fieldList.value);
  columns.value = buildColumns(
    formDef.value!.content?.items!,
    formDef.value!.usingWorkflow,
    fieldList.value,
    undefined,
    t
  );
  updateQueryParams();
  handleQuery();
};

const updateQueryParams = () => {
  const queryFields = curListView.value?.pcType === FormListViewType.Table ? fieldList.value : [];
  queryParams.value = toDynamicFindOptions(
    queryFields,
    condList.value,
    sortList.value,
    (pageNum.value - 1) * pageSize.value,
    pageSize.value,
    { field: "formId", type: "none", op: "eq", value: formDef.value!.id },
    { authGroupId: curAuthGrp.value?.id }
  );
};

const handleQuery = () => {
  loadCount();
  loadData();
};

const loadCount = () => {
  formDataService.count(queryParams.value.filter).then((cnt: number) => {
    totalRef.value = cnt;
  });
};
const loadData = () => {
  formDataService.query<FormData>(queryParams.value).then((res: FormData[]) => {
    dataRef.value = res;
    processData();
  });
};
const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;
  updateQueryParams();
  loadData();
};
const onDataSaved = () => {
  showAddDialog.value = false;
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
};

const selectable = (row: any, index: number) => {
  return !formDef.value?.usingWorkflow || row[SystemField.FlowStatus] == FlowStatus.Draft;
};

const buildExportColumns = (): ExportColumn[] => {
  const selectedFields = fieldList.value.length > 0 ? fieldList.value : getAllExportFields();

  return selectedFields.map((field) => ({
    key: field.field,
    header: field.label,
    type: toExportColumnType(field.type),
  }));
};

const getAllExportFields = (): IFormFieldDef[] => {
  const result: IFormFieldDef[] = [];
  const items = formDef.value?.content?.items || [];

  const dataTitleField = getDataTitle(t("comp.fieldBlock.systemFields.dataTitle"));
  result.push({
    formId,
    field: dataTitleField.field,
    label: dataTitleField.title,
    type: dataTitleField.type,
  });

  if (formDef.value?.usingWorkflow) {
    const flowStatusField = getFlowStatus(t("comp.fieldBlock.systemFields.flowStatus"));
    result.push({
      formId,
      field: flowStatusField.field,
      label: flowStatusField.title,
      type: flowStatusField.type,
    });
  }

  items.forEach((item) => {
    if (item.type === FieldType.TableForm && item.columns?.length) {
      item.columns.forEach((sub) => {
        result.push({
          formId,
          field: `${item.field}>${sub.field}`,
          label: `${item.title}.${sub.title}`,
          type: sub.type,
          isSubField: true,
        });
      });
      return;
    }

    result.push({
      formId,
      field: item.field,
      label: item.title,
      type: item.type,
      isSubField: false,
    });
  });

  const createByField = getCreateBy(t("comp.fieldBlock.systemFields.createBy"));
  result.push({
    formId,
    field: createByField.field,
    label: createByField.title,
    type: createByField.type,
  });
  const createTimeField = getCreateTime(t("comp.fieldBlock.systemFields.createTime"));
  result.push({
    formId,
    field: createTimeField.field,
    label: createTimeField.title,
    type: createTimeField.type,
  });
  const updateTimeField = getUpdateTime(t("comp.fieldBlock.systemFields.updateTime"));
  result.push({
    formId,
    field: updateTimeField.field,
    label: updateTimeField.title,
    type: updateTimeField.type,
  });

  return result;
};

const toExportColumnType = (type: FieldType) => {
  if (type === FieldType.Number) {
    return ExportColumnType.Number;
  }
  if (type === FieldType.TimeStamp) {
    return ExportColumnType.Date;
  }

  return ExportColumnType.String;
};
const showDetails = (row: FormData) => {
  selectedData.value = row;
  showDetailsDialog.value = true;
};
const handleViewOk = () => {
  loadData();
  showDetailsDialog.value = false;
};
//#region Flat Data
const childrenFields = ref<string[]>([]);
const flattedData = ref<any[]>([]);
const spanMap = ref<number[]>([]);

const initChildrenField = (
  fields: FieldDef[],
  displayFields: IFormFieldDef[],
  fieldPerms?: IFieldPerm[]
) => {
  childrenFields.value = [];
  fields.forEach((x) => {
    if (x.columns && x.columns.length > 0) childrenFields.value.push(x.field);
  });
};

const processData = () => {
  if (dataRef.value) {
    flattedData.value = [];
    dataRef.value.forEach((item) => {
      var dataItem = { ...item, ...item.data };
      delete dataItem["data"];

      for (const key in dataItem) {
        if (dataItem.hasOwnProperty(key)) {
          const value = dataItem[key];
          if (value && typeof value === "object" && "label" in value) {
            dataItem[key] = value.label;
          }
          // 处理嵌套数组格式 [[val1], [val2], ...] -> [val1, val2, ...]
          if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
            dataItem[key] = value.map(item => {
              if (Array.isArray(item) && item.length > 0) {
                return item[0];
              }
              return item;
            });
          }
        }
      }

      if (childrenFields.value.length > 0) {
        let maxItemCount = 0;
        childrenFields.value.forEach(
          (childField) =>
            (maxItemCount = Math.max(maxItemCount, (dataItem[childField] || []).length))
        );
        maxItemCount = Math.min(maxItemCount, displayItemCount);
        if (maxItemCount == 0) {
          flattedData.value.push({ ...dataItem });
        } else {
          for (var i = 0; i < maxItemCount; i++) {
            var flat = {};

            childrenFields.value.forEach((childField) => {
              const children = dataItem[childField] || [];
              let child = children[i] || {};
              const parentFields = { ...dataItem };
              delete parentFields[childField];
              flat = {
                ...parentFields,
                ...child,
              };
            });

            flattedData.value.push(flat);
          }
        }
      } else {
        flattedData.value.push({ ...dataItem });
      }
    });

    const mergeField = "id";
    let pos = 0;
    spanMap.value = [];

    flattedData.value.forEach((item, index) => {
      if (index === 0 || item[mergeField] !== flattedData.value[index - 1][mergeField]) {
        pos = index;
        spanMap.value[pos] = 1;
      } else {
        spanMap.value[pos]++;
        spanMap.value[index] = 0;
      }
    });
  }
};

const idBasedSpanMethod = (data: {
  row: any;
  column: any;
  rowIndex: number;
  columnIndex: number;
}) => {
  if (!data.column.isSubColumn) {
    const span = spanMap.value[data.rowIndex];
    return span > 0 ? [span, 1] : [0, 0];
  }
};
//#endregion

const handleDataSaved = (payload: { formId: string }) => {
  if (payload.formId !== formId) return;
  showAddDialog.value = false;
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
};
const handleDataDeleted = (payload: { formId: string }) => {
  if (payload.formId !== formId) return;
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
};

onMounted(() => {
  bus.on("data:saved", handleDataSaved);
  bus.on("data:deleted", handleDataDeleted);
});
onUnmounted(() => {
  bus.off("data:saved", handleDataSaved);
  bus.off("data:deleted", handleDataDeleted);
});
</script>
<style lang="scss" scoped>
.formdata-container {
  height: calc(100% - 90px);
  width: 100%;
}

.data-list {
  width: 100%;
}

.data-list-full-height {
  height: calc(100% - 46px);
}

.data-table-full {
  width: 100%;
  height: 100%;
}

.view-tabs {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  min-height: 46px;
  padding: 0 var(--et-space-12);
  border: 1px solid var(--et-border-color-light);
  border-bottom: 0;
  background: var(--et-bg-container);
}

.view-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--et-space-6);
  height: 32px;
  padding: 0 var(--et-space-12);
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--et-text-secondary);
  cursor: pointer;
  font-weight: 600;

  &:hover,
  &.active {
    color: var(--et-color-primary);
  }

  &.active {
    border-bottom-color: var(--et-color-primary);
  }
}

.view-tab-icon {
  width: 10px;
  height: 14px;
  border-left: 4px solid currentColor;
  border-right: 2px solid currentColor;
  opacity: 0.9;
}

:deep(.data-filter) {
  margin-left: var(--et-space-0);
}

:deep(.form-list-toolbar .toolbar-container) {
  min-height: 42px;
  margin-bottom: var(--et-space-10);
  padding: var(--et-space-6) var(--et-space-10);
  border: 1px solid var(--el-border-color-lighter);
  border-bottom: 0;
  background: var(--el-bg-color);
}

:deep(.form-list-toolbar .left-group),
:deep(.form-list-toolbar .right-group) {
  align-items: center;
  gap: 2px;
}

:deep(.form-list-toolbar .toolbar-item.el-button),
:deep(.form-list-toolbar .toolbar-dropdown) {
  height: 32px;
  padding: 0 var(--et-space-8);
  border: 0;
  box-shadow: none;
}

:deep(.form-list-toolbar .toolbar-item.el-button:not(.el-button--primary)),
:deep(.form-list-toolbar .toolbar-dropdown) {
  background: transparent;
}

:deep(.form-list-toolbar .toolbar-item.el-button:not(.el-button--primary):not(.is-disabled):hover),
:deep(.form-list-toolbar .toolbar-dropdown:not(.is-disabled):hover) {
  background: var(--el-fill-color-light);
}

:deep(.data-table-full .el-table__header-wrapper th.el-table__cell),
:deep(.data-table-full .el-table__fixed-header-wrapper th.el-table__cell) {
  background: var(--el-fill-color-light);
}

:deep(.auth-gropu-filter) {
  line-height: var(--et-line-height-32);
  padding: 0 var(--et-space-8);
  margin-right: var(--et-space-10);
}

.export-column-group {
  display: grid;
  gap: var(--et-space-8);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-height: 280px;
  overflow: auto;
}

:deep(.table-image-thumb) {
  width: var(--et-size-40);
  height: var(--et-size-40);
  border-radius: var(--et-radius-4);
  object-fit: cover;
  cursor: pointer;
}

:deep(.table-image-thumb-spaced) {
  margin-right: var(--et-space-4);
}
</style>
