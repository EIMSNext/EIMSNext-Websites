<template>
  <div class="formdata-container">
    <et-dialog v-model="showAddEditDialog" :title="formDef?.name" :show-footer="false" :destroy-on-close="true"
      :close-on-click-modal="false">
      <div class="form-container">
        <AddEditFormData :formId="formId" :isView="false" @save="onDataSaved" @submit="onDataSaved">
        </AddEditFormData>
      </div>
    </et-dialog>
    <et-dialog v-model="showDetailsDialog" :title="formDef?.name" :show-footer="false" :destroy-on-close="true">
      <div class="form-container">
        <FormDataView :formId="formId" :dataId="selectedData!.id"></FormDataView>
      </div>
    </et-dialog>
    <div class="top-bar">
      <div class="flex-x-between mb-10px">
        <div>
          <el-button type="success" icon="plus">新增</el-button>
          <el-button type="danger" icon="delete">删除</el-button>
          <el-button icon="upload">导入</el-button>
          <el-button icon="download">导出</el-button>
        </div>
        <div>
          <el-popover :visible="showFilter" :show-arrow="false" :offset="0" placement="bottom-end" width="500"
            :teleported="false" trigger="click" :destroy-on-close="true">
            <DataFilter :model-value="condList" :formId="formId" @ok="setFilter" @cancel="showFilter = false">
            </DataFilter>
            <template #reference>
              <el-button icon="filter" class="data-filter" @click="showFilter = !showFilter">
                筛选
              </el-button>
            </template>
          </el-popover>
          <el-popover :visible="showSort" :show-arrow="false" :offset="0" placement="bottom-end" width="500"
            :teleported="false" trigger="click" :destroy-on-close="true">
            <DataSort :model-value="sortList" :formId="formId" @ok="setSort" @cancel="showSort = false"></DataSort>
            <template #reference>
              <el-button icon="sort" class="data-sort" @click="showSort = !showSort">
                排序
              </el-button>
            </template>
          </el-popover>
          <el-popover :visible="showField" :show-arrow="false" :offset="0" placement="bottom-end" width="500"
            :teleported="false" trigger="click" :destroy-on-close="true">
            <DataField :model-value="fieldList" :formId="formId" @ok="setField" @cancel="showField = false"></DataField>
            <template #reference>
              <el-button icon="list" class="data-field" @click="showField = !showField">
                字段
              </el-button>
            </template>
          </el-popover>
          <el-button icon="refresh" class="data-field" @click="handleQuery">
            刷新
          </el-button>
        </div>
      </div>
    </div>
    <et-toolbar :left-group="leftBars" :right-group="rightBars"></et-toolbar>
    <div class="data-list" style="height:100%">
      <el-table :data="flattedData" :span-method="idBasedSpanMethod" style="width: 100%;height: 100%;"
        show-overflow-tooltip :tooltip-formatter="tableToolFormatter" :row-class-name="rowClassName"
        @row-click="showDetails">
        <el-table-column type="selection" width="30" />
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
      <pagination :total="totalRef" @change="pageChanged" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useFormStore } from "@eimsnext/store";
import { FormDef, FormData, FieldDef, SystemField, FlowStatus, FieldType } from "@eimsnext/models";
import { ITableColumn, buildColumns } from "./type";
import { IDynamicFindOptions, SortDirection, formDataService } from "@eimsnext/services";
import AddEditFormData from "./components/AddEditFormData.vue";
import { EtDialog, ToolbarItem } from "@eimsnext/components";
import { TableTooltipData } from "element-plus";
import DataFilter from "./components/DataFilter.vue";
import { IConditionList, toDynamicFindOptions } from "@/components/ConditionList/type";
import { IFieldSortList } from "@/components/FieldSortList/type";
import DataSort from "./components/DataSort.vue";
import FormDataView from "./components/FormDataView.vue";
import DataField from "./components/DataField.vue";
import { IFormFieldDef } from "@/components/FieldList/type";

const displayItemCount = 3; //最多显示3条明细
const showAddEditDialog = ref(false);
const columns = ref<ITableColumn[]>([]);
const route = useRoute();
const formStore = useFormStore();
const formId = route.params.formId.toString();
const formDef = ref<FormDef>();

const leftBars = ref<ToolbarItem[]>([
  { type: "button", config: { text: "新增", type: "success", command: "add", icon: "el-icon-plus", onCommand: () => { showAddEditDialog.value = true; } } },
  { type: "button", config: { text: "删除", type: "danger", command: "delete", icon: "el-icon-delete" } },
  { type: "button", config: { text: "导入", command: "upload", icon: "el-icon-upload" } },
  { type: "button", config: { text: "导出", command: "download", icon: "el-icon-download" } }
])

const rightBars = ref<ToolbarItem[]>([
  { type: "button", config: { text: "筛选", class: "data-filter", command: "filter", icon: "el-icon-filter", onCommand: () => { showFilter.value = !showFilter.value; } } },
  { type: "button", config: { text: "排序", class: "data-sort", command: "sort", icon: "el-icon-sort", onCommand: () => { showSort.value = !showSort.value; } } },
  { type: "button", config: { text: "字段", class: "data-field", command: "list", icon: "el-icon-list", onCommand: () => { showField.value = !showField.value; } } },
  { type: "button", config: { text: "刷新", class: "data-field", command: "refresh", icon: "el-icon-refresh", onCommand: () => { handleQuery() } } }
])

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
  showAddEditDialog.value = false
  pageNum.value = 1
  updateQueryParams()
  handleQuery()
};
const rowClassName = (row: any) => {
  return "pointer"
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
</style>
