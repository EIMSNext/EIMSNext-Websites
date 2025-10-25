<template>
  <div class="formdata-container">
    <et-dialog v-model="showAddDialog" :title="formDef?.name" :show-footer="false" :destroy-on-close="true"
      :close-on-click-modal="false">
      <div class="form-container">
        <AddFormData :formId="formId" :isView="false" @save="onDataSaved" @submit="onDataSaved">
        </AddFormData>
      </div>
    </et-dialog>
    <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
      :showNoSave="false" okText="确定" @ok="execDelete">
      <div>你当前选中了{{ checkedDatas.length }}条数据，数据删除后将不可恢复</div>
    </EtConfirmDialog>
    <et-dialog v-model="showDetailsDialog" :title="formDef?.name" :show-footer="false" :destroy-on-close="true">
      <div class="form-container">
        <FormDataView :formId="formId" :dataId="selectedData!.id" @ok="handleViewOk"></FormDataView>
      </div>
    </et-dialog>
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" :formId="formId" @ok="setFilter" @cancel="showFilter = false">
      </DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" :formId="formId" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
    <el-popover :visible="showField" :virtual-ref="fieldBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataField :model-value="fieldList" :formId="formId" @ok="setField" @cancel="showField = false"></DataField>
    </el-popover>
    <et-toolbar :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>
    <div class="data-list" style="height:100%">
      <el-table :data="flattedData" :span-method="idBasedSpanMethod" style="width: 100%;height: 100%;"
        show-overflow-tooltip :tooltip-formatter="tableToolFormatter" :row-class-name="rowClassName"
        @selection-change="selectionChanged" @row-click="showDetails">
        <el-table-column type="selection" width="30" :selectable="selectable" />
        <template v-for="col in columns">
          <template v-if="col.children">
            <el-table-column :label="col.title" :fieldSetting="col" show-overflow-tooltip>
              <template v-if="col.children" v-for="sub in col.children">
                <el-table-column :prop="sub.field" :formatter="formatter" :label="sub.title" :width="sub.width"
                  :fieldSetting="sub"></el-table-column>
              </template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column :prop="col.field" :formatter="formatter" :label="col.title" :width="col.width"
              :fieldSetting="col" show-overflow-tooltip></el-table-column>
          </template>
        </template>
      </el-table>
      <pagination :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useFormStore } from "@eimsnext/store";
import { FormDef, FormData, FieldDef, SystemField, FlowStatus, FieldType } from "@eimsnext/models";
import { ITableColumn, buildColumns } from "./type";
import { IDynamicFindOptions, SortDirection, formDataService } from "@eimsnext/services";
import AddFormData from "./components/AddFormData.vue";
import { MessageIcon, ToolbarItem } from "@eimsnext/components";
import { TableTooltipData } from "element-plus";
import DataFilter from "./components/DataFilter.vue";
import { IConditionList, toDynamicFindOptions } from "@/components/ConditionList/type";
import { IFieldSortList } from "@/components/FieldSortList/type";
import DataSort from "./components/DataSort.vue";
import FormDataView from "./components/FormDataView.vue";
import DataField from "./components/DataField.vue";
import { IFormFieldDef } from "@/components/FieldList/type";

const displayItemCount = 3; //最多显示3条明细
const showAddDialog = ref(false);
const showDeleteConfirmDialog = ref(false)
const columns = ref<ITableColumn[]>([]);
const route = useRoute();
const formStore = useFormStore();
const formId = route.params.formId.toString();
const formDef = ref<FormDef>();
const filterBtnRef = ref();
const sortBtnRef = ref();
const fieldBtnRef = ref();

const leftBars = ref<ToolbarItem[]>([
  { type: "button", config: { text: "新增", type: "success", command: "add", icon: "el-icon-plus", onCommand: () => { showAddDialog.value = true; } } },
  { type: "button", config: { text: "删除", type: "danger", command: "delete", icon: "el-icon-delete", disabled: true } },
  // { type: "button", config: { text: "导入", command: "upload", icon: "el-icon-upload" } },
  // { type: "button", config: { text: "导出", command: "download", icon: "el-icon-download" } }
])

const rightBars = ref<ToolbarItem[]>([
  { type: "button", config: { text: "筛选", class: "data-filter", command: "filter", icon: "el-icon-filter", onCommand: (cmd: string, e: MouseEvent) => { filterBtnRef.value = e.currentTarget, showSort.value = showField.value = false; showFilter.value = !showFilter.value; } } },
  { type: "button", config: { text: "排序", class: "data-filter", command: "sort", icon: "el-icon-sort", onCommand: (cmd: string, e: MouseEvent) => { sortBtnRef.value = e.currentTarget, showFilter.value = showField.value = false; showSort.value = !showSort.value; } } },
  { type: "button", config: { text: "字段", class: "data-filter", command: "list", icon: "el-icon-list", onCommand: (cmd: string, e: MouseEvent) => { fieldBtnRef.value = e.currentTarget, showFilter.value = showSort.value = false; showField.value = !showField.value; } } },
  { type: "button", config: { text: "刷新", class: "data-filter", command: "refresh", icon: "el-icon-refresh", onCommand: () => { handleQuery() } } }
])

const toolbarHandler = (cmd: string, e: MouseEvent) => {
  switch (cmd) {
    case "delete":
      {
        if (checkedDatas.value.length > 0) {
          showDeleteConfirmDialog.value = true
        }
      }
      break;
  }
}

formStore.get(formId).then((form: FormDef | undefined) => {
  if (form) {
    formDef.value = form;
    initChildrenField(form.content?.items!, []);
    columns.value = buildColumns(form.content?.items!, form.usingWorkflow, []);
    updateQueryParams()
    handleQuery();
  }
});

const queryParams = ref<IDynamicFindOptions>({
  skip: 0,
  take: 20,
});

const totalRef = ref(0);
const dataRef = ref<FormData[]>();
const showFilter = ref(false);
const condList = ref<IConditionList>({ id: "", rel: "and" });
const showSort = ref(false);
const sortList = ref<IFieldSortList>({ items: [{ field: { formId: formId, field: SystemField.CreateTime, label: "提交时间", type: FieldType.DatePicker }, sort: SortDirection.Desc }] });
const showField = ref(false)
const fieldList = ref<IFormFieldDef[]>([])
const pageNum = ref(1)
const pageSize = ref(20)
const selectedData = ref<FormData>()
const showDetailsDialog = ref(false)
const checkedDatas = ref<any[]>([])

const selectionChanged = (rows: any[]) => {
  checkedDatas.value = rows
  leftBars.value.find(x => x.config.command == "delete")!.config.disabled = checkedDatas.value.length == 0
}
const execDelete = () => {
  formDataService.delete("batch", { keys: checkedDatas.value.map(x => x[SystemField.Id]) })
    .then(() => {
      handleQuery()
    })
}

const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;
  // console.log("condList", filter);

  updateQueryParams()
  handleQuery();
};

const setSort = (sort: IFieldSortList) => {
  sortList.value = sort;
  showSort.value = false;
  // console.log("sortList", sort);

  updateQueryParams()
  handleQuery();
};

const setField = (fields: IFormFieldDef[]) => {
  fieldList.value = fields;
  showField.value = false;
  initChildrenField(formDef.value!.content?.items!, fieldList.value);
  columns.value = buildColumns(formDef.value!.content?.items!, formDef.value!.usingWorkflow, fieldList.value);

  // console.log("fieldList", fields);

  updateQueryParams()
  handleQuery();
};

const updateQueryParams = () => {
  queryParams.value = toDynamicFindOptions(fieldList.value, condList.value, sortList.value, (pageNum.value - 1) * pageSize.value, pageSize.value, { field: "formId", type: "none", op: "eq", value: formDef.value!.id })
}

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
  formDataService
    .query<FormData>(queryParams.value)
    .then((res: FormData[]) => {
      dataRef.value = res;
      processData();
    });
};
const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;
  updateQueryParams();
  loadData()
}
const onDataSaved = () => {
  showAddDialog.value = false
  pageNum.value = 1
  updateQueryParams()
  handleQuery()
};
const rowClassName = (row: any) => {
  return "pointer"
}

const selectable = (row: any, index: number) => {
  return row[SystemField.FlowStatus] == FlowStatus.Draft
}
const formatter = (row: any, column: any, cellValue: any, index: number) => {
  // console.log("formatter", row, column, column.$attrs);
  if (column.property == SystemField.FlowStatus) {
    return getFlowStatusName(cellValue)
  }
  // if (column.property.indexOf(">") > 1) {
  //   var all = column.property.split(">");
  //   var pPath = all[0].split(".");
  //   var path = [...pPath, index, all[1]];
  //   let value = path.reduce((obj: any, key: string) => (obj || {})[key], row);

  //   return value || "-";
  //   // console.log("pa", path);
  //   // var pObj = pPath.reduce((obj: any, key: string) => (obj || {})[key], row);
  //   // console.log("sub obj", row, pObj, typeof pObj, all[1].split("."));
  //   // return all[1].split(".").reduce((obj: any, key: string) => (obj || {})[key], pObj[index]);
  // } else {
  //   const path = column.property.split(".");
  //   let value = path.reduce((obj: any, key: string) => (obj || {})[key], row);

  //   return value || "-";
  // }
  return cellValue;
};
const getFlowStatusName = (status: FlowStatus) => {
  switch (status) {
    case FlowStatus.Draft:
      return "草稿";
    case FlowStatus.Approving:
      return "审批中";
    case FlowStatus.Approved:
      return "已审批";
    case FlowStatus.Rejected:
      return "已驳回";
    case FlowStatus.Discarded:
      return "已废弃";
    case FlowStatus.Suspended:
      return "已挂起";
    default:
      return "";
  }
}
const tableToolFormatter = (data: TableTooltipData<FormData>) => {
  return `${data.cellValue}`;
};

const showDetails = (row: FormData) => {
  selectedData.value = row
  showDetailsDialog.value = true
}
const handleViewOk = () => {
  loadData()
}
//#region Flat Data
const childrenFields = ref<string[]>([]);
const flattedData = ref<any[]>([]);
const spanMap = ref<number[]>([]);

const initChildrenField = (fields: FieldDef[], displayFields: IFormFieldDef[]) => {
  childrenFields.value = [];
  fields.forEach((x) => {
    if (x.columns && x.columns.length > 0) childrenFields.value.push(x.field);
  });
};

const processData = () => {
  if (dataRef.value) {
    // 展开嵌套数据
    flattedData.value = [];
    dataRef.value.forEach((item) => {
      var dataItem = { ...item, ...item.data };
      delete dataItem["data"];

      if (childrenFields.value.length > 0) {
        let maxItemCount = 0;
        childrenFields.value.forEach(
          (childField) => (maxItemCount = Math.max(maxItemCount, (dataItem[childField] || []).length))
        );
        maxItemCount = Math.min(maxItemCount, displayItemCount);
        // console.log("maxItemCount", maxItemCount)
        if (maxItemCount == 0) {
          //可能没有子表数据
          flattedData.value.push({ ...dataItem });
        }
        else {
          for (var i = 0; i < maxItemCount; i++) {
            var flat = {};

            childrenFields.value.forEach((childField) => {
              const children = dataItem[childField] || [];
              let child = children[i] || {};
              // 动态复制父级所有字段（排除子字段）
              const parentFields = { ...dataItem };
              delete parentFields[childField];
              flat = {
                ...parentFields,
                ...child,
              };
            });

            // console.log("flat", item, flat);
            flattedData.value.push(flat);
          }
        }
      }
      else {
        flattedData.value.push({ ...dataItem });
      }
    });

    // 计算合并规则
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
</script>
<style lang="scss" scoped>
.formdata-container {
  height: calc(100% - 90px)
}

:deep(.data-filter) {
  margin-left: 0px;
}
</style>
