<template>
  <div class="data-manage-page">
    <et-dialog
      v-model="showAddDialog"
      class="formdatadialog"
      :title="formDef.name"
      :show-footer="false"
      :destroy-on-close="true"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="form-container">
        <AddFormData :formId="formDef.id" :isView="false" @save="onDataSaved" @submit="onDataSaved" />
      </div>
    </et-dialog>

    <FormDataImportDialog
      v-model="showImportDialog"
      :form-def="formDef"
      @imported="handleQuery"
    />

    <EtConfirmDialog
      v-model="showDeleteConfirmDialog"
      :title="t('common.message.deleteConfirm_Title')"
      :icon="MessageIcon.Warning"
      :showNoSave="false"
      @ok="execDelete"
    >
      <div>{{ t("common.message.deleteConfirm_Content", [checkedDatas.length]) }}</div>
    </EtConfirmDialog>

    <EtConfirmDialog
      v-model="showRestoreConfirmDialog"
      :title="t('admin.formEdit.dataManageRestoreTitle')"
      :showNoSave="false"
      @ok="execRestore"
    >
      <div>{{ t("admin.formEdit.dataManageRestoreContent", [trashCheckedDatas.length]) }}</div>
    </EtConfirmDialog>

    <EtConfirmDialog
      v-model="showPurgeConfirmDialog"
      :title="t('admin.formEdit.dataManagePurgeTitle')"
      :icon="MessageIcon.Warning"
      :showNoSave="false"
      @ok="execPurge"
    >
      <div>{{ t("admin.formEdit.dataManagePurgeContent", [trashCheckedDatas.length]) }}</div>
    </EtConfirmDialog>

    <et-dialog
      v-model="showDetailsDialog"
      class="formdatadialog"
      :title="formDef.name"
      :show-footer="false"
      :destroy-on-close="true"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="form-container">
        <FormDataView
          v-if="selectedData"
          :key="selectedData.id"
          :formId="formDef.id"
          :dataId="selectedData.id"
          :formDataPermissions="FormDataPermissions.All"
          :start-in-edit="isDraftDetail"
          :hide-toolbar="isDraftDetail"
          @ok="handleViewOk"
        />
      </div>
    </et-dialog>

    <el-popover
      :visible="showFilter"
      :virtual-ref="filterBtnRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DataFilter :model-value="condList" :formId="formDef.id" @ok="setFilter" @cancel="showFilter = false" />
    </el-popover>

    <el-popover
      :visible="showSort"
      :virtual-ref="sortBtnRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DataSort :model-value="sortList" :formId="formDef.id" @ok="setSort" @cancel="showSort = false" />
    </el-popover>

    <el-popover
      :visible="showField"
      :virtual-ref="fieldBtnRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DataField :model-value="fieldList" :formId="formDef.id" @ok="setField" @cancel="showField = false" />
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

    <div class="data-shell">
      <FormListViewRenderer
        :form-def="formDef"
        :view="listView"
        :settings="listViewSettings"
        :rows="dataRef"
        :columns="columns"
        :flatted-data="flattedData"
        :span-method="idBasedSpanMethod"
        :selectable="selectable"
        :display-fields="displayFields"
        @selection-change="selectionChanged"
        @row-click="showDetails"
      />
      <pagination :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
    </div>

    <FormDraftDrawer
      v-model="showDraftDrawer"
      :title="t('admin.formEdit.dataManageDraftTitle')"
      :description="t('admin.formEdit.dataManageDraftDesc')"
      :empty-title="t('admin.formEdit.dataManageDraftEmpty')"
      :empty-desc="t('admin.formEdit.dataManageDraftEmptyDesc')"
      :rows="draftRows"
      :page="draftPageNum"
      :page-size="draftPageSize"
      :has-next="draftHasNext"
      :form-def="formDef"
      @refresh="refreshDrafts"
      @page-change="draftPageChanged"
      @select="openDraft"
      @delete="deleteDraft"
    />

    <el-drawer
      v-model="showTrashDrawer"
      class="trash-drawer"
      direction="btt"
      size="92%"
      destroy-on-close
      :append-to-body="true"
    >
      <template #header>
        <div class="trash-header">
          <div>
            <div class="trash-title">{{ t("admin.formEdit.dataManageTrashTitle") }}</div>
            <div class="trash-desc">{{ t("admin.formEdit.dataManageTrashDesc") }}</div>
          </div>
          <div class="trash-header-actions">
            <el-button @click="refreshTrash">{{ t("common.refresh") }}</el-button>
            <el-button type="primary" :disabled="trashCheckedDatas.length === 0" @click="showRestoreConfirmDialog = true">
              {{ t("admin.formEdit.dataManageRestore") }}
            </el-button>
            <el-button
              type="danger"
              plain
              :disabled="trashCheckedDatas.length === 0"
              @click="showPurgeConfirmDialog = true"
            >
              {{ t("admin.formEdit.dataManagePurge") }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="trash-search-row">
        <FormDataSearchBar
          :keyword="trashSearchState.keyword"
          :selected-fields="trashSearchState.selectedFields"
          :fields="searchableFields"
          :disabled="searchableFields.length === 0"
          @update:keyword="trashSearchState.keyword = $event"
          @update:selected-fields="trashSearchState.selectedFields = $event"
          @search="handleTrashSearch"
        />
      </div>

      <div class="trash-table-shell">
        <el-table
          :data="trashRows"
          class="trash-table"
          show-overflow-tooltip
          @selection-change="trashSelectionChanged"
        >
          <el-table-column type="selection" width="44" />
          <el-table-column prop="dataTitle" :label="t('comp.fieldBlock.systemFields.dataTitle')" min-width="220" />
          <el-table-column :label="t('common.operation')" width="200" fixed="right">
            <template #default="{ row }">
              <div class="trash-row-actions">
                <el-button link type="primary" @click="restoreOne(row)">{{ t("admin.formEdit.dataManageRestore") }}</el-button>
                <el-button link type="danger" @click="purgeOne(row)">{{ t("admin.formEdit.dataManagePurge") }}</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="trashRows.length === 0" class="trash-empty">
          <div class="trash-empty-title">{{ t("admin.formEdit.dataManageTrashEmpty") }}</div>
          <div class="trash-empty-desc">{{ t("admin.formEdit.dataManageTrashEmptyDesc") }}</div>
        </div>
      </div>

      <div class="trash-pagination">
        <pagination :total="trashTotalRef" :pageSize="trashPageSize" @change="trashPageChanged" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  FormDataPermissions,
  ExportColumn,
  ExportColumnType,
  ExportFormat,
  FieldType,
  FlowStatus,
  FormData,
  FormDef,
  FormListViewField,
  FormListViewSettings,
  SystemField,
} from "@eimsnext/models";
import {
  IConditionList,
  IFieldSortList,
  IFormFieldDef,
  MessageIcon,
  ToolbarItem,
  toDynamicFindOptions,
} from "@eimsnext/components";
import { type IDynamicFindOptions, formDataService } from "@eimsnext/services";
import AddFormData from "@/views/form/components/AddFormData.vue";
import DataField from "@/views/form/components/DataField.vue";
import DataFilter from "@/views/form/components/DataFilter.vue";
import DataSort from "@/views/form/components/DataSort.vue";
import FormDataView from "@/views/form/components/FormDataView.vue";
import FormDataImportDialog from "@/views/form/components/FormDataImportDialog.vue";
import FormDraftDrawer from "@/views/form/components/FormDraftDrawer.vue";
import Pagination from "@/components/Pagination/index.vue";
import FormListViewRenderer from "@/views/form/components/FormListViewRenderer.vue";
import FormDataSearchBar from "@/views/form/components/FormDataSearchBar.vue";
import { buildColumns, type ITableColumn } from "@/views/form/type";
import {
  buildAllViewFields,
  createDefaultFormListView,
  createDefaultSort,
  createEmptyCondition,
  flattenDataItem,
  parseViewSettings,
} from "@/views/form/listViewUtils";
import {
  buildAllSearchableFields,
  type FormDataSearchState,
  filterSearchableFields,
  normalizeSelectedSearchFields,
  resolveSearchFields,
} from "@/views/form/searchUtils";
import { createDraftFilter, createNonDraftFilter } from "@/views/form/draftUtils";

type FormDataQueryOptions = IDynamicFindOptions & {
  keyword?: string;
  searchFields?: string[];
  includeDeleted?: boolean;
};

type QueryBuilderOptions = {
  page: number;
  pageSize: number;
  keyword: string;
  selectedFields: string[];
  includeDeleted: boolean;
};

const props = defineProps<{
  formDef: FormDef;
}>();

const { t } = useI18n();

const showAddDialog = ref(false);
const showImportDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const showRestoreConfirmDialog = ref(false);
const showPurgeConfirmDialog = ref(false);
const showDetailsDialog = ref(false);
const showTrashDrawer = ref(false);
const showDraftDrawer = ref(false);
const showFilter = ref(false);
const showSort = ref(false);
const showField = ref(false);

const filterBtnRef = ref();
const sortBtnRef = ref();
const fieldBtnRef = ref();

const selectedData = ref<FormData>();
const isDraftDetail = ref(false);
const checkedDatas = ref<FormData[]>([]);
const trashCheckedDatas = ref<FormData[]>([]);

const dataRef = ref<FormData[]>([]);
const draftRows = ref<FormData[]>([]);
const trashRows = ref<FormData[]>([]);

const totalRef = ref(0);
const draftTotalRef = ref(0);
const trashTotalRef = ref(0);
const draftHasNext = computed(() => draftPageNum.value * draftPageSize.value < draftTotalRef.value);
const pageNum = ref(1);
const pageSize = ref(20);
const draftPageNum = ref(1);
const draftPageSize = ref(20);
const trashPageNum = ref(1);
const trashPageSize = ref(20);

const condList = ref<IConditionList>(createEmptyCondition());
const sortList = ref<IFieldSortList>(createDefaultSort(props.formDef.id, t));

const listView = computed(() => createDefaultFormListView(props.formDef, t));
const listViewSettings = computed<FormListViewSettings>(() => parseViewSettings(listView.value.settings));
function buildAllManageFields(): IFormFieldDef[] {
  return buildAllViewFields(props.formDef, t);
}

const fieldList = ref<IFormFieldDef[]>(buildAllManageFields());

const displayFields = computed<FormListViewField[]>(() =>
  fieldList.value.map((field) => ({
    field: field.field,
    label: field.label,
    type: field.type,
    isSubField: field.isSubField,
  })),
);

const searchableFields = computed(() => filterSearchableFields(buildAllSearchableFields(props.formDef, t)));

const searchState = reactive<FormDataSearchState>({
  keyword: "",
  selectedFields: [],
});

const trashSearchState = reactive<FormDataSearchState>({
  keyword: "",
  selectedFields: [],
});

const queryParams = ref<FormDataQueryOptions>({
  skip: 0,
  take: 20,
});
const draftQueryParams = ref<FormDataQueryOptions>({
  skip: 0,
  take: 20,
});

const trashQueryParams = ref<FormDataQueryOptions>({
  skip: 0,
  take: 20,
});

watch(searchableFields, (fields) => {
  searchState.selectedFields = normalizeSelectedSearchFields(searchState.selectedFields, fields);
  trashSearchState.selectedFields = normalizeSelectedSearchFields(trashSearchState.selectedFields, fields);
}, { immediate: true });

watch(showTrashDrawer, (value) => {
  if (value) {
    trashPageNum.value = 1;
    updateTrashQueryParams();
    void loadTrash();
  }
});

watch(showDraftDrawer, (value) => {
  if (value) {
    draftPageNum.value = 1;
    void refreshDrafts();
  }
});

const leftBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: "common.addNew",
      type: "primary",
      command: "add",
      icon: "el-plus",
      visible: true,
      onCommand: () => {
        showAddDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.delete",
      class: "delete-button",
      command: "delete",
      icon: "el-delete",
      visible: true,
      disabled: true,
    },
  },
  {
    type: "button",
    config: {
      text: "common.import",
      command: "import",
      icon: "el-upload",
      visible: true,
      onCommand: () => {
        showImportDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.export",
      class: "data-filter",
      command: "export",
      visible: true,
      icon: "el-download",
      onCommand: () => {
        void exportCurrentData();
      },
    },
  },
  {
    type: "button",
    config: {
      text: "admin.formEdit.dataManageDraft",
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
  {
    type: "button",
    config: {
      text: "admin.formEdit.dataManageTrash",
      class: "data-filter",
      command: "trash",
      visible: true,
      icon: "el-delete",
      onCommand: () => {
        showTrashDrawer.value = true;
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
      onCommand: (_cmd: string, e: MouseEvent) => {
        filterBtnRef.value = e.currentTarget;
        showSort.value = false;
        showField.value = false;
        showFilter.value = !showFilter.value;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "common.fields",
      class: "data-filter",
      command: "fields",
      visible: true,
      icon: "el-list",
      onCommand: (_cmd: string, e: MouseEvent) => {
        fieldBtnRef.value = e.currentTarget;
        showFilter.value = false;
        showSort.value = false;
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
      onCommand: (_cmd: string, e: MouseEvent) => {
        sortBtnRef.value = e.currentTarget;
        showFilter.value = false;
        showField.value = false;
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
        void handleQuery();
      },
    },
  },
]);

const toolbarHandler = (cmd: string) => {
  if (cmd === "delete" && checkedDatas.value.length > 0) {
    showDeleteConfirmDialog.value = true;
    return;
  }

};

const columns = computed<ITableColumn[]>(() =>
  buildColumns(
    props.formDef.content?.items || [],
    props.formDef.usingWorkflow,
    fieldList.value,
    undefined,
    t,
  ),
);

const selectable = (row: any) =>
  !props.formDef.usingWorkflow || row[SystemField.FlowStatus] === FlowStatus.Draft;

const flattedData = computed(() => dataRef.value.map(flattenDataItem));

const buildFormDataQuery = (options: QueryBuilderOptions): FormDataQueryOptions => {
  const isTrash = options.includeDeleted;

  return {
    ...toDynamicFindOptions(
      isTrash ? [] : fieldList.value,
      isTrash ? createEmptyCondition() : condList.value,
      isTrash ? createDefaultSort(props.formDef.id, t) : sortList.value,
      (options.page - 1) * options.pageSize,
      options.pageSize,
      isTrash
        ? {
            rel: "and",
            items: [
              { field: "formId", type: "none", op: "eq", value: props.formDef.id },
              { field: "deleteFlag", type: "none", op: "eq", value: true },
            ],
          }
        : createNonDraftFilter(props.formDef.id),
      { formId: props.formDef.id, inheritMemberPermissions: true },
    ),
    keyword: options.keyword.trim(),
    searchFields: resolveSearchFields(
      {
        keyword: options.keyword,
        selectedFields: options.selectedFields,
      },
      searchableFields.value,
    ),
    includeDeleted: isTrash,
  };
};

const updateQueryParams = () => {
  queryParams.value = buildFormDataQuery({
    page: pageNum.value,
    pageSize: pageSize.value,
    keyword: searchState.keyword,
    selectedFields: searchState.selectedFields,
    includeDeleted: false,
  });
};

const updateTrashQueryParams = () => {
  trashQueryParams.value = buildFormDataQuery({
    page: trashPageNum.value,
    pageSize: trashPageSize.value,
    keyword: trashSearchState.keyword,
    selectedFields: trashSearchState.selectedFields,
    includeDeleted: true,
  });
};

const updateDraftQueryParams = () => {
  draftQueryParams.value = {
    skip: (draftPageNum.value - 1) * draftPageSize.value,
    take: draftPageSize.value,
    filter: createDraftFilter(props.formDef.id, "anonymous"),
    includeDeleted: false,
    scope: { formId: props.formDef.id, inheritMemberPermissions: true },
  };
};

const loadCount = async () => {
  totalRef.value = await formDataService.dynamicCount(queryParams.value);
};

const loadData = async () => {
  dataRef.value = await formDataService.dynamicQuery<FormData>(queryParams.value);
};

const loadTrashCount = async () => {
  trashTotalRef.value = await formDataService.dynamicCount(trashQueryParams.value);
};

const loadDraftCount = async () => {
  draftTotalRef.value = await formDataService.dynamicCount(draftQueryParams.value);
};

const loadDraftRows = async () => {
  draftRows.value = await formDataService.dynamicQuery<FormData>(draftQueryParams.value);
};

const loadTrashRows = async () => {
  trashRows.value = await formDataService.dynamicQuery<FormData>(trashQueryParams.value);
};

const handleQuery = async () => {
  await Promise.all([loadCount(), loadData(), refreshTrashCount(), refreshDraftCount()]);
};

const loadTrash = async () => {
  await Promise.all([loadTrashCount(), loadTrashRows()]);
};

const refreshDraftCount = async () => {
  updateDraftQueryParams();
  await loadDraftCount();
};

const refreshDrafts = async () => {
  updateDraftQueryParams();
  await Promise.all([loadDraftCount(), loadDraftRows()]);
};

const refreshTrashCount = async () => {
  const countQuery = buildFormDataQuery({
    page: 1,
    pageSize: 1,
    keyword: trashSearchState.keyword,
    selectedFields: trashSearchState.selectedFields,
    includeDeleted: true,
  });
  trashTotalRef.value = await formDataService.dynamicCount(countQuery);
};

const selectionChanged = (rows: FormData[]) => {
  checkedDatas.value = rows;
  const item = leftBars.value.find((bar) => bar.config.command === "delete");
  if (item) item.config.disabled = rows.length === 0;
};

const trashSelectionChanged = (rows: FormData[]) => {
  trashCheckedDatas.value = rows;
};

const execDelete = async () => {
  await formDataService.delete("batch", { keys: checkedDatas.value.map((item) => item[SystemField.Id]) });
  showDeleteConfirmDialog.value = false;
  checkedDatas.value = [];
  await Promise.all([handleSearch(), showTrashDrawer.value ? loadTrash() : Promise.resolve()]);
};

const execRestore = async () => {
  await formDataService.restore({ keys: trashCheckedDatas.value.map((item) => item.id) });
  showRestoreConfirmDialog.value = false;
  trashCheckedDatas.value = [];
  await Promise.all([handleQuery(), loadTrash()]);
};

const execPurge = async () => {
  await formDataService.purge({ keys: trashCheckedDatas.value.map((item) => item.id) });
  showPurgeConfirmDialog.value = false;
  trashCheckedDatas.value = [];
  await Promise.all([handleQuery(), loadTrash()]);
};

const restoreOne = async (row: FormData) => {
  await formDataService.restore({ keys: [row.id] });
  await Promise.all([handleQuery(), loadTrash(), showDraftDrawer.value ? refreshDrafts() : Promise.resolve()]);
};

const purgeOne = async (row: FormData) => {
  await formDataService.purge({ keys: [row.id] });
  await Promise.all([handleQuery(), loadTrash()]);
};

const openDraft = (row: FormData) => {
  selectedData.value = row;
  isDraftDetail.value = row.flowStatus === FlowStatus.Draft;
  showDetailsDialog.value = true;
};

const deleteDraft = async (row: FormData) => {
  await formDataService.delete(row.id);
  await Promise.all([handleQuery(), refreshDrafts(), showTrashDrawer.value ? loadTrash() : Promise.resolve()]);
};

const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;
  void handleSearch();
};

const setSort = (sort: IFieldSortList) => {
  sortList.value = sort;
  showSort.value = false;
  void handleSearch();
};

const setField = (fields: IFormFieldDef[]) => {
  fieldList.value = fields.length > 0 ? fields : buildAllManageFields();
  showField.value = false;
  void handleSearch();
};

const showDetails = (row: FormData) => {
  selectedData.value = row;
  isDraftDetail.value = row.flowStatus === FlowStatus.Draft;
  showDetailsDialog.value = true;
};

const handleViewOk = async () => {
  showDetailsDialog.value = false;
  await Promise.all([handleQuery(), showTrashDrawer.value ? loadTrash() : Promise.resolve(), showDraftDrawer.value ? refreshDrafts() : Promise.resolve()]);
};

const onDataSaved = async () => {
  showAddDialog.value = false;
  await handleSearch();
};

const pageChanged = async (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;
  updateQueryParams();
  await loadData();
};

const trashPageChanged = async (curPage: number, pSize: number) => {
  trashPageNum.value = curPage;
  trashPageSize.value = pSize;
  updateTrashQueryParams();
  await loadTrashRows();
};

const handleSearch = async () => {
  pageNum.value = 1;
  updateQueryParams();
  await handleQuery();
};

const handleTrashSearch = async () => {
  trashPageNum.value = 1;
  updateTrashQueryParams();
  await loadTrash();
};

const refreshTrash = async () => {
  updateTrashQueryParams();
  await loadTrash();
};

const draftPageChanged = async (curPage: number, pSize: number) => {
  draftPageNum.value = curPage;
  draftPageSize.value = pSize;
  await refreshDrafts();
};

const exportCurrentData = async () => {
  const columnsToExport = buildExportColumns();
  if (columnsToExport.length === 0) {
    ElMessage.warning(t("admin.selectColumn"));
    return;
  }

  const result = await formDataService.export({
    format: ExportFormat.Csv,
    columns: columnsToExport,
    formId: props.formDef.id,
    filter: queryParams.value.filter,
    keyword: queryParams.value.keyword,
    searchFields: queryParams.value.searchFields,
    includeDeleted: false,
  });

  ElMessage.success(
    result.message ||
      (result.isDuplicate
        ? t("admin.corpLog.messages.duplicateExport")
        : t("admin.corpLog.messages.exportCreated")),
  );
};

const buildExportColumns = (): ExportColumn[] => {
  const selectedFields = fieldList.value.length > 0 ? fieldList.value : buildAllManageFields();
  return selectedFields.map((field) => ({
    key: field.field,
    header: field.label,
    type: field.type === FieldType.Number ? ExportColumnType.Number : field.type === FieldType.TimeStamp ? ExportColumnType.Date : ExportColumnType.String,
  }));
};

const idBasedSpanMethod = () => undefined;

updateQueryParams();
updateDraftQueryParams();
updateTrashQueryParams();
void handleQuery();
</script>

<style scoped lang="scss">
.data-manage-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--et-space-16);
  background:
    linear-gradient(180deg, rgb(34 197 94 / 4%) 0%, transparent 24%),
    var(--et-bg-page);
}

.toolbar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-12);
  min-height: 42px;
  margin-bottom: var(--et-space-10);
  padding: var(--et-space-6) var(--et-space-10);
  border: 1px solid var(--el-border-color-lighter);
  border-bottom: 0;
  background: var(--el-bg-color);
}

.form-list-toolbar-leading {
  flex: 1;
  min-width: 0;
}

.form-list-toolbar-trailing {
  flex: 0 0 auto;
  min-width: 0;
}

.data-shell {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.trash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-16);
  width: 100%;
}

.trash-title {
  color: var(--et-text-primary);
  font-size: 20px;
  font-weight: 700;
}

.trash-desc {
  margin-top: var(--et-space-4);
  color: var(--et-text-secondary);
  font-size: 13px;
}

.trash-header-actions {
  display: flex;
  gap: var(--et-space-8);
}

.trash-search-row {
  margin-bottom: var(--et-space-14);
}

.trash-table-shell {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--et-border-color-light);
  border-radius: var(--et-radius-10);
  background: var(--et-bg-container);
  overflow: hidden;
}

.trash-table {
  flex: 1;
}

.trash-row-actions {
  display: inline-flex;
  gap: var(--et-space-10);
}

.trash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--et-space-8);
  min-height: 180px;
  color: var(--et-text-secondary);
}

.trash-empty-title {
  color: var(--et-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.trash-empty-desc {
  font-size: 13px;
}

.trash-pagination {
  margin-top: var(--et-space-12);
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

:deep(.trash-drawer > .el-drawer) {
  background:
    linear-gradient(180deg, rgb(15 23 42 / 2%) 0%, transparent 18%),
    var(--et-bg-page);
}

:deep(.trash-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: var(--et-space-20) var(--et-space-24) var(--et-space-12);
}

:deep(.trash-drawer .el-drawer__body) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 var(--et-space-24) var(--et-space-20);
}

@media (max-width: 1280px) {
  .toolbar-head,
  .trash-header {
    flex-wrap: wrap;
  }

  .form-list-toolbar-leading {
    flex-basis: 100%;
  }

  .form-list-toolbar-trailing {
    margin-left: auto;
  }

  .trash-header-actions {
    flex-wrap: wrap;
  }
}

:global(html.dark) .data-manage-page {
  background:
    linear-gradient(180deg, rgb(16 185 129 / 8%) 0%, transparent 24%),
    var(--et-bg-page);
}
</style>
