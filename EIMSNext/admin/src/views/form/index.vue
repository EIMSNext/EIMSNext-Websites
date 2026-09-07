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
        <AddFormData :formId="formId" :isView="false" :formFieldPermissions="formFieldPermissions" @save="onDataSaved"
          @submit="onDataSaved"></AddFormData>
      </div>
    </et-dialog>
    <FormDataImportDialog
      v-if="formDef"
      v-model="showImportDialog"
      :form-def="formDef"
      :permission-group-id="curPermissionGroup?.id"
      :field-perms="formFieldPermissions"
      @imported="handleQuery"
    />
    <EtConfirmDialog v-model="showDeleteConfirmDialog" :title="t('common.message.deleteConfirm_Title')"
      :icon="MessageIcon.Warning" :showNoSave="false" @ok="execDelete">
      <div>{{ t("common.message.deleteConfirm_Content", [checkedDatas.length]) }}</div>
    </EtConfirmDialog>
    <et-dialog v-model="showDetailsDialog" class="formdatadialog" :title="detailsDialogTitle" :show-footer="false"
      :destroy-on-close="true" width="800px" :close-on-click-modal="false">
      <div class="form-container">
        <FormDataView :key="selectedData?.id" :formId="formId" :dataId="selectedData!.id" :formDataPermissions="formDataPermissions" :formFieldPermissions="formFieldPermissions" :permissionGroupId="curPermissionGroup?.id"
          :start-in-edit="isDraftDetail" :hide-toolbar="isDraftDetail"
          @ok="handleViewOk"></FormDataView>
      </div>
    </et-dialog>
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" virtual-triggering :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" :formId="formId" :field-perms="formFieldPermissions" @ok="setFilter" @cancel="showFilter = false"></DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" virtual-triggering :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" :formId="formId" :field-perms="formFieldPermissions" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
    <el-popover :visible="showField" :virtual-ref="fieldBtnRef" virtual-triggering :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataField :model-value="fieldList" :formId="formId" :field-perms="formFieldPermissions" @ok="setField" @cancel="showField = false"></DataField>
    </el-popover>
    <div class="toolbar-head">
      <et-toolbar
        class="form-list-toolbar form-list-toolbar-leading"
        :left-group="leftBars"
        @command="toolbarHandler"
      />
      <FormDataSearchBar
        :keyword="searchState.keyword"
        :selected-fields="searchState.selectedFields"
        :fields="searchableFields"
        :disabled="searchableFields.length === 0"
        @update:keyword="searchState.keyword = $event"
        @update:selected-fields="searchState.selectedFields = $event"
        @search="handleSearch"
      />
      <et-toolbar
        class="form-list-toolbar form-list-toolbar-trailing"
        :right-group="rightBars"
        @command="toolbarHandler"
      />
    </div>
    <FormDraftDrawer
      v-if="formDef"
      v-model="showDraftDrawer"
      :title="t('admin.formList.draftBox')"
      :description="t('admin.formList.draftBoxDesc')"
      :empty-title="t('admin.formList.draftEmpty')"
      :empty-desc="t('admin.formList.draftEmptyDesc')"
      :rows="draftRows"
      :page="draftPageNum"
      :page-size="draftPageSize"
      :has-next="draftHasNext"
      :form-def="formDef"
      :field-perms="formFieldPermissions"
      :can-delete="canRemove"
      @refresh="refreshDrafts"
      @page-change="draftPageChanged"
      @select="openDraft"
      @delete="deleteDraft"
    />
    <div v-if="visibleCustomViews.length > 0" class="view-tabs">
      <button
        v-for="view in availableViews"
        :key="view.id"
        type="button"
        class="view-tab"
        :class="{ active: curListView?.id === view.id }"
        @click="switchView(view.id)"
      >
        <span class="view-tab-icon"></span>
        {{ getViewName(view) }}
      </button>
    </div>
    <div class="data-list data-list-full-height">
      <el-result v-if="listLoadError" icon="error" :title="$t('common.loadFailed')">
        <template #extra>
          <el-button type="primary" @click="handleQuery">{{ $t("common.retry") }}</el-button>
        </template>
      </el-result>
      <template v-else>
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
      </template>
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
  FormDataPermissionGroup,
  FormFieldPermission,
  FormDataPermissions,
  FormListView,
  FormListViewField,
  FormListViewSettings,
  FormListViewType,
} from "@eimsnext/models";
import { ITableColumn, buildColumns } from "./type";
import {
  IDynamicFindOptions,
  IDataScope,
  formDataPermissionGroupService,
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
import { getFormDataPermissionGroupFormDataPermissions, hasDataPerm } from "@/utils/common";
import Pagination from "../../components/Pagination/index.vue";
import { useI18n } from "vue-i18n";
import FormDraftDrawer from "./components/FormDraftDrawer.vue";
import FormListViewRenderer from "./components/FormListViewRenderer.vue";
import FormDataSearchBar from "./components/FormDataSearchBar.vue";
import FormDataImportDialog from "./components/FormDataImportDialog.vue";
import {
  createDefaultFormListView,
  buildAllViewFields,
  getViewDisplayFields,
  parseCondition,
  parseSort,
  parseViewSettings,
  flattenDataItem,
  formatDataTitle,
} from "./listViewUtils";
import {
  type FormDataSearchState,
  buildAllSearchableFields,
  filterSearchableFields,
  MAX_SEARCH_FIELD_COUNT,
  normalizeSelectedSearchFields,
  resolveSearchFields,
} from "./searchUtils";
import { createDraftFilter, createNonDraftFilter } from "./draftUtils";
import { useAdminPermissions } from "@/composables/useAdminPermissions";
const { t } = useI18n();

type FormDataQueryOptions = IDynamicFindOptions & {
  keyword?: string;
  searchFields?: string[];
  includeDeleted?: boolean;
};

const displayItemCount = 3; //最多显示3条明细
const showAddDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const showExportDialog = ref(false);
const showImportDialog = ref(false);
const showDraftDrawer = ref(false);
const exporting = ref(false);
const columns = ref<ITableColumn[]>([]);
const route = useRoute();
const formStore = useFormStore();
const formId = route.params.formId.toString();
const formDef = ref<FormDef>();
const filterBtnRef = ref();
const sortBtnRef = ref();
const fieldBtnRef = ref();
const permissionGroups = ref<FormDataPermissionGroup[]>([]);
const curPermissionGroup = ref<FormDataPermissionGroup>();
const formFieldPermissions = ref<FormFieldPermission[]>();
const canManageCurrentApp = ref(false);
const permissionsReady = ref(false);
const canViewField = (field: string) =>
  formFieldPermissions.value === undefined ||
  formFieldPermissions.value.some((permission) => permission.id === field && permission.visible);
const restrictConditionToVisibleFields = (condition: IConditionList): IConditionList | undefined => {
  if (condition.field?.field && !canViewField(condition.field.field)) return undefined;
  if (condition.value?.fieldValue?.field && !canViewField(condition.value.fieldValue.field)) return undefined;

  return {
    ...condition,
    items: condition.items
      ?.map(restrictConditionToVisibleFields)
      .filter((item): item is IConditionList => item !== undefined),
  };
};
const visibleCondition = (condition: IConditionList): IConditionList =>
  restrictConditionToVisibleFields(condition) ?? { id: condition.id, rel: condition.rel || "and", items: [] };
const visibleSort = (sort: IFieldSortList): IFieldSortList => ({
  items: sort.items.filter((item) => canViewField(item.field.field)),
});
const currentDataScope = (): IDataScope | undefined => {
  if (curPermissionGroup.value?.id) return { permissionGroupId: curPermissionGroup.value.id };
  if (usesAdminAllPermissions.value) return undefined;
  return { formId, inheritMemberPermissions: true };
};
const listViews = ref<FormListView[]>([]);
const curListView = ref<FormListView>();
const curListViewSettings = ref<FormListViewSettings>({});
const listViewDisplayFields = ref<FormListViewField[]>([]);
const searchState = reactive<FormDataSearchState>({
  keyword: "",
  selectedFields: [],
});
const searchFieldsInitialized = ref(false);
const userStore = useUserStore();
const { currentUser } = userStore;
const { loadAdminPermissions, canManageAppId } = useAdminPermissions();

const usesAdminAllPermissions = computed(
  () => permissionsReady.value && permissionGroups.value.length === 0 && canManageCurrentApp.value,
);
const formDataPermissions = computed(() =>
  curPermissionGroup.value
    ? getFormDataPermissionGroupFormDataPermissions(curPermissionGroup.value)
    : usesAdminAllPermissions.value
      ? FormDataPermissions.All
      : FormDataPermissions.None,
);
const canAdd = computed(() => hasDataPerm(FormDataPermissions.AddNew, formDataPermissions.value));
const canImport = computed(() => hasDataPerm(FormDataPermissions.Import, formDataPermissions.value));
const canExport = computed(() => hasDataPerm(FormDataPermissions.Export, formDataPermissions.value));
const canRemove = computed(() =>
  hasDataPerm(FormDataPermissions.Remove, formDataPermissions.value)
);
const visibleCustomViews = computed(() => {
  const permissionGroupId = curPermissionGroup.value?.id;
  return listViews.value.filter((view) => {
    if (view.id === "__default") return false;
    if (view.disabled) return false;
    if (!permissionGroupId || !view.permissionGroupIds || view.permissionGroupIds.length === 0) return true;
    return view.permissionGroupIds.includes(permissionGroupId);
  });
});

const availableViews = computed(() => {
  if (!formDef.value) return [];
  return [
    createDefaultFormListView(formDef.value, t),
    ...visibleCustomViews.value.filter((view) => view.id !== "__default"),
  ];
});

const leftBars = ref<ToolbarItem[]>([
  {
    type: "dropdown",
    config: {
      text: "admin.formList.selectPermGroup",
      class: "permission-group-filter",
      command: "authgrp",
      visible: false,
      showDynamicText: true,
      onCommand: (cmd) => {
        curPermissionGroup.value = permissionGroups.value.find((x) => x.id == cmd);
        formFieldPermissions.value = curPermissionGroup.value ? (curPermissionGroup.value.formFieldPermissions ?? []) : [];
        showFilter.value = showSort.value = showField.value = false;
        checkedDatas.value = [];
        const deleteItem = leftBars.value.find((x) => x.config.command === "delete");
        if (deleteItem) deleteItem.config.disabled = true;
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
        if (canAdd.value) showAddDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.delete",
      class: "delete-button",
      command: "delete",
      visible: canRemove,
      icon: "el-delete",
      disabled: true,
    },
  },
  {
    type: "button",
    config: {
      text: "common.import",
      command: "import",
      visible: canImport,
      icon: "el-upload",
      onCommand: () => {
        if (canImport.value) showImportDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.export",
      class: "data-filter",
      command: "download",
      visible: canExport,
      icon: "el-download",
      onCommand: () => {
        openExportDialog();
      },
    },
  },
  {
    type: "button",
    config: {
      text: "admin.formList.draftBox",
      class: "data-filter",
      command: "draft",
      visible: true,
      icon: "el-document",
      onCommand: () => {
        showDraftDrawer.value = true;
        void refreshDrafts();
      },
    },
  },
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
    case "draft":
      showDraftDrawer.value = true;
      void refreshDrafts();
      break;
  }
};

const openExportDialog = () => {
  if (!canExport.value) return;
  selectedExportColumnKeys.value = exportColumns.value.map((item) => item.key);
  exportFormat.value = ExportFormat.Csv;
  showExportDialog.value = true;
};

const submitExport = async () => {
  if (!canExport.value) return;
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
      permissionGroupId: curPermissionGroup.value?.id,
      keyword: queryParams.value.keyword,
      searchFields: queryParams.value.searchFields,
      includeDeleted: false,
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
  permissionsReady.value = false;
  const form = await formStore.get(formId);
  if (!form) return;

  formDef.value = form;
  await loadAdminPermissions();
  canManageCurrentApp.value = canManageAppId(form.appId);

  const assignedGroups = await formDataPermissionGroupService.getAssigned(form.id);
  permissionGroups.value = assignedGroups;
  curPermissionGroup.value = assignedGroups[0];
  formFieldPermissions.value = curPermissionGroup.value
    ? (curPermissionGroup.value.formFieldPermissions ?? [])
    : canManageCurrentApp.value
      ? undefined
      : [];
  permissionsReady.value = true;

  const groupItem = leftBars.value.find((x) => x.config.command === "authgrp");
  if (groupItem) {
    if (assignedGroups.length > 0) {
      const menuItems: IToolbarItemDropdownItem[] = assignedGroups.map((group, index) => ({
        text: group.name,
        command: group.id,
        visible: true,
        checked: index === 0,
      }));
      groupItem.config.menuItems = menuItems;
      groupItem.config.visible = true;
      groupItem.config.disabled = false;
    } else {
      groupItem.config.menuItems = [];
      groupItem.config.visible = false;
      groupItem.config.disabled = true;
    }
  }

  listViews.value = await formListViewService.query<FormListView>(`$filter=formid eq '${form.id}'&$orderby=sortIndex asc,createTime asc`);
  applyCurrentView();
};

void loadFormContext();

const queryParams = ref<FormDataQueryOptions>({
  skip: 0,
  take: 20,
});
const draftQueryParams = ref<FormDataQueryOptions>({
  skip: 0,
  take: 20,
});

const totalRef = ref(0);
const dataRef = ref<FormData[]>();
const listLoadError = ref(false);
const draftRows = ref<FormData[]>([]);
const draftTotalRef = ref(0);
const draftHasNext = computed(() => draftPageNum.value * draftPageSize.value < draftTotalRef.value);
const showFilter = ref(false);
const condList = ref<IConditionList>({ id: "", rel: "and", items: [] });
const showSort = ref(false);
const sortList = ref<IFieldSortList>({ items: [] });
const showField = ref(false);
const fieldList = ref<IFormFieldDef[]>([]);
const pageNum = ref(1);
const pageSize = ref(20);
const draftPageNum = ref(1);
const draftPageSize = ref(20);
const selectedData = ref<FormData>();
const isDraftDetail = ref(false);
const showDetailsDialog = ref(false);
const detailsDialogTitle = computed(() => {
  if (!formDef.value || !selectedData.value) return formDef.value?.name || "";
  return formatDataTitle(flattenDataItem(selectedData.value), formDef.value, t) || formDef.value.name;
});
const checkedDatas = ref<any[]>([]);
const exportFormat = ref<ExportFormat>(ExportFormat.Csv);
const selectedExportColumnKeys = ref<string[]>([]);
const searchableFields = computed(() =>
  formDef.value
    ? filterSearchableFields(buildAllSearchableFields(formDef.value, t))
        .filter((field) => canViewField(field.field))
    : []
);

const initializeSearchFields = () => {
  if (searchFieldsInitialized.value || searchableFields.value.length === 0) return;
  searchState.selectedFields = searchableFields.value
    .slice(0, MAX_SEARCH_FIELD_COUNT)
    .map((field) => field.field);
  searchFieldsInitialized.value = true;
};

const exportColumns = computed<ExportColumn[]>(() => buildExportColumns());

const applyCurrentView = (preferredViewId?: string) => {
  if (!formDef.value) return;

  initializeSearchFields();

  const nextView =
    availableViews.value.find((view) => view.id === preferredViewId) ||
    availableViews.value[0] ||
    createDefaultFormListView(formDef.value, t);

  curListView.value = nextView;
  curListViewSettings.value = parseViewSettings(nextView.settings);

  const requestedFields = getViewDisplayFields(formDef.value, nextView, curListViewSettings.value, t);
  const sourceFields = requestedFields.length === 0 && formFieldPermissions.value !== undefined
    ? buildAllViewFields(formDef.value, t)
    : requestedFields;
  const displayFields = sourceFields.filter((field) => canViewField(field.field));
  fieldList.value = displayFields;
  listViewDisplayFields.value = displayFields.map((field) => ({
    field: field.field,
    label: field.label,
    type: field.type,
    isSubField: field.isSubField,
  }));
  searchState.selectedFields = normalizeSelectedSearchFields(searchState.selectedFields, searchableFields.value);
  condList.value = visibleCondition(parseCondition(nextView.defaultFilter));
  sortList.value = visibleSort(parseSort(formId, nextView.defaultSort, t));
  pageNum.value = 1;

  initChildrenField(formDef.value.content?.items || [], fieldList.value, formFieldPermissions.value);
  columns.value = buildColumns(
    formDef.value.content?.items || [],
    formDef.value.usingWorkflow,
    fieldList.value,
    formFieldPermissions.value,
    t,
  );
  updateQueryParams();
  handleQuery();
};

const switchView = (viewId: string) => {
  applyCurrentView(viewId);
};

const getViewName = (view: { id: string; name?: string }) =>
  view.id === "__default" ? t("admin.formListView.defaultView") : view.name;

const selectionChanged = (rows: any[]) => {
  checkedDatas.value = rows;
  leftBars.value.find((x) => x.config.command == "delete")!.config.disabled =
    checkedDatas.value.length == 0;
};
const execDelete = async () => {
  if (!canRemove.value) return;
  try {
    await formDataService.delete("batch", { keys: checkedDatas.value.map((x) => x[SystemField.Id]) });
      showDeleteConfirmDialog.value = false;
      checkedDatas.value = [];
      await handleQuery();
  } catch {
    ElMessage.error(t("common.deleteFailed"));
  }
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
  searchState.selectedFields = normalizeSelectedSearchFields(searchState.selectedFields, searchableFields.value);
  updateQueryParams();
  handleQuery();
};

const updateQueryParams = () => {
  const queryFields = curListView.value?.pcType === FormListViewType.Table ? fieldList.value : [];
  const resolvedSearchFields = resolveSearchFields(searchState, searchableFields.value);
  queryParams.value = {
    ...toDynamicFindOptions(
    queryFields,
    visibleCondition(condList.value),
    visibleSort(sortList.value),
    (pageNum.value - 1) * pageSize.value,
    pageSize.value,
    createNonDraftFilter(formDef.value!.id),
    currentDataScope()
  ),
  };
  queryParams.value.keyword = searchState.keyword.trim();
  queryParams.value.searchFields = resolvedSearchFields;
  queryParams.value.includeDeleted = false;
};

const updateDraftQueryParams = () => {
  draftQueryParams.value = {
    skip: (draftPageNum.value - 1) * draftPageSize.value,
    take: draftPageSize.value,
    filter: createDraftFilter(formDef.value!.id, "self", currentUser.empId),
    includeDeleted: false,
    scope: currentDataScope(),
  };
};

const handleQuery = () => {
  listLoadError.value = false;
  loadCount();
  loadData();
  void refreshDraftCount();
};

const loadCount = () => {
  formDataService.dynamicCount(queryParams.value).then((cnt: number) => {
    totalRef.value = cnt;
  }).catch(() => {
    totalRef.value = 0;
    dataRef.value = [];
    listLoadError.value = true;
  });
};
const loadData = () => {
  formDataService.dynamicQuery<FormData>(queryParams.value).then((res: FormData[]) => {
    dataRef.value = res;
    processData();
  }).catch(() => {
    dataRef.value = [];
    listLoadError.value = true;
  });
};
const loadDraftCount = async () => {
  draftTotalRef.value = await formDataService.dynamicCount(draftQueryParams.value);
};
const loadDraftRows = async () => {
  draftRows.value = await formDataService.dynamicQuery<FormData>(draftQueryParams.value);
};
const refreshDraftCount = async () => {
  if (!formDef.value) return;
  updateDraftQueryParams();
  await loadDraftCount();
};
const refreshDrafts = async () => {
  if (!formDef.value) return;
  updateDraftQueryParams();
  await Promise.all([loadDraftCount(), loadDraftRows()]);
};
const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;
  updateQueryParams();
  loadData();
};
const draftPageChanged = async (curPage: number, pSize: number) => {
  draftPageNum.value = curPage;
  draftPageSize.value = pSize;
  await refreshDrafts();
};
const onDataSaved = () => {
  showAddDialog.value = false;
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
  void refreshDrafts();
};

const handleSearch = () => {
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
};

const selectable = (row: any, index: number) => {
  return canRemove.value &&
    (!formDef.value?.usingWorkflow || row[SystemField.FlowStatus] == FlowStatus.Draft);
};

const buildExportColumns = (): ExportColumn[] => {
  const selectedFields = (fieldList.value.length > 0 ? fieldList.value : getAllExportFields())
    .filter((field) => field.type !== FieldType.DataSelect && canViewField(field.field));

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
    if (item.type === FieldType.DataSelect) {
      return;
    }

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
  isDraftDetail.value = row.flowStatus === FlowStatus.Draft;
  showDetailsDialog.value = true;
};
const openDraft = (row: FormData) => {
  selectedData.value = row;
  isDraftDetail.value = row.flowStatus === FlowStatus.Draft;
  showDetailsDialog.value = true;
};
const deleteDraft = async (row: FormData) => {
  if (!canRemove.value) return;
  try {
    await formDataService.delete(row.id);
    await Promise.all([refreshDrafts(), Promise.resolve(handleQuery())]);
  } catch {
    ElMessage.error(t("common.deleteFailed"));
  }
};
const handleViewOk = () => {
  loadData();
  void refreshDrafts();
  showDetailsDialog.value = false;
};
//#region Flat Data
const childrenFields = ref<string[]>([]);
const flattedData = ref<any[]>([]);
const spanMap = ref<number[]>([]);

const initChildrenField = (
  fields: FieldDef[],
  displayFields: IFormFieldDef[],
  formFieldPermissions?: FormFieldPermission[]
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
  void refreshDrafts();
};
const handleDataDeleted = (payload: { formId: string }) => {
  if (payload.formId !== formId) return;
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
  void refreshDrafts();
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

.toolbar-head {
  display: flex;
  align-items: center;
  gap: var(--et-space-12);
  min-height: 42px;
  margin-bottom: var(--et-space-10);
  padding: var(--et-space-6) var(--et-space-10);
  border: 1px solid var(--el-border-color-lighter);
  border-bottom: 0;
  background: var(--el-bg-color);
}

.form-list-toolbar {
  min-width: 0;
}

.form-list-toolbar-leading {
  flex: 1;
}

.form-list-toolbar-trailing {
  flex: 0 0 auto;
  min-width: 0;
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

:deep(.form-list-toolbar.toolbar-container) {
  margin-bottom: 0;
  background: transparent;
}

:deep(.form-list-toolbar .left-group),
:deep(.form-list-toolbar .right-group) {
  align-items: center;
  gap: 2px;
}

:deep(.form-list-toolbar .right-group) {
  margin-left: 0;
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

:deep(.permission-group-filter) {
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

@media (max-width: 900px) {
  .toolbar-head {
    flex-wrap: wrap;
  }

  .form-list-toolbar-leading {
    flex-basis: 100%;
  }

  .form-list-toolbar-trailing {
    margin-left: auto;
  }
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

