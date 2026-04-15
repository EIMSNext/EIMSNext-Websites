<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="dashItemDef.name" class="title-editor" />
    </template>
    <template #top-right>
      <el-button @click="onSave">保存</el-button>
    </template>
    <el-container class="design-container">
      <el-aside width="250px" class="left-aside">
        <div class="left-container">
          <div class="data-source">
            <div class="data-source-setting">
              <span>数据源</span>
              <div class="choose-data" @click="changeDataSource">更改数据源</div>
            </div>
            <div class="data-source-title">
              <et-icon size="16px" :icon="getFormIcon()" :color="getAppIconColor()"></et-icon>
              <span class="data-source-name">{{ chartSetting.datasource?.label }}</span>
            </div>
          </div>
          <div class="data-source" v-if="chartSetting.datasource.type == DatasourceType.Form">
            <div class="data-source-setting">
              <span>数据获取权限</span>
            </div>
            <div class="data-source-title">
              <el-select v-model="selectedRole" @change="roleChanged">
                <el-option :label="t('表单中的全部数据')" value="1"></el-option>
                <el-option :label="t('继承成员对表单的权限')" value="2"></el-option>
              </el-select>
            </div>
          </div>
          <div class="fields-container">
            <div class="field-title">
              <span>字段</span>
              <!-- <div class="field-operation">
              <div @click="addComputedField" v-if="DatasourceType == DatasourceType.Form">
                <et-icon icon="el-plus"></et-icon>
              </div>
            </div> -->
            </div>
            <div class="field-list">
              <Draggable
                :list="fields"
                :sort="false"
                ghost-class="ghost"
                :move="dragMove"
                :clone="cloneDragField"
                @start="dragStart"
                @end="dragEnd"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                item-key="id"
              >
                <template #item="{ element, index }">
                  <div class="field-wrapper" :title="element.label">
                    <div class="field-name">
                      <et-icon size="16px" icon="el-copyDocument" class="mr-[8px]"></et-icon>
                      <span class="name">{{ element.label }}</span>
                    </div>
                    <!-- <div v-if="element.isComputed" class="tool-icons">
                    <span @click="copyField(element)">
                      <et-icon icon="el-copyDocument" class="icon"></et-icon>
                    </span>
                    <span @click="editField(element, index)">
                      <et-icon icon="el-edit" class="icon"></et-icon>
                    </span>
                    <span @click="removeField(element, index)">
                      <et-icon icon="el-delete" class="icon"></et-icon>
                    </span>
                  </div> -->
                  </div>
                </template>
              </Draggable>
            </div>
          </div>
        </div>
      </el-aside>
      <el-main class="center-echarts center-echarts-main">
        <div class="center-box" :class="{ 'green-line': dropable.dimension1 }">
          <div class="title">维度</div>
          <div class="drag-target-container container-veidoo">
            <Draggable
              class="dimension1"
              :list="chartSetting.dimension1"
              :sort="false"
              ghost-class="ghost"
              :group="{ name: 'fields', pull: false, put: true }"
              item-key="id"
              @add="addDim1"
            >
              <template #item="{ element, index }">
                <DimensionField
                  :field="element"
                  :isDeleted="fieldIsDeleted(element)"
                  @remove="removeDim1"
                ></DimensionField>
              </template>
            </Draggable>
          </div>
        </div>
        <div class="center-box" :class="{ 'green-line': dropable.metrics }">
          <div class="title">指标</div>
          <div class="drag-target-container container-veidoo">
            <Draggable
              class="metrics"
              :list="chartSetting.metrics"
              :sort="false"
              ghost-class="ghost"
              :group="{ name: 'fields', pull: false, put: true }"
              item-key="id"
              @add="addMetric"
            >
              <template #item="{ element, index }">
                <MetricsField
                  :field="element"
                  :isDeleted="fieldIsDeleted(element)"
                  @remove="removeMetric"
                ></MetricsField>
              </template>
            </Draggable>
          </div>
        </div>
        <div class="center-box">
          <div class="title">过滤条件</div>
          <div class="drag-target-container container-veidoo">
            <div class="filter">
              <FilterField
                :form-id="chartSetting.datasource.id"
                :filter="chartSetting.filter"
                @ok="onFilter"
              ></FilterField>
            </div>
          </div>
        </div>

        <div class="center-box chart-main">
          <div class="chart-container">
            <EChartsViewer
              :setting="chartSetting"
              :title="dashItemDef.name"
              :designer-mode="true"
            />
          </div>
        </div>
      </el-main>
      <el-aside width="300px" class="echarts-config">
        <div class="config-box">
          <el-collapse v-model="activeCollItems" expand-icon-position="left">
            <el-collapse-item name="charttype" title="图表类型" class="box-head">
              <div class="box-body chart-type-body">
                <template v-for="cc in chartConfigs" :key="cc.id">
                  <el-tooltip placement="left" effect="light">
                    <template #content>
                      <div class="chart-type-tooltip">
                        <div class="chart-type-tooltip-title">{{ t(cc.i18n) }}</div>
                        <div>{{ getLimitationDesc(t, cc.limitation) }}</div>
                      </div>
                    </template>
                    <el-button
                      @click="selectChartType(cc)"
                      class="chart-type"
                      :class="{ active: chartSetting.chartType == cc.id }"
                    >
                      <i class="icon" :class="cc.cssClass"></i>
                    </el-button>
                  </el-tooltip>
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
          <el-collapse v-model="activeSettingItems" expand-icon-position="left">
            <el-collapse-item
              v-if="chartConfig && chartConfig.subType"
              name="chartsubtype"
              title="柱状图类型"
              class="box-head"
            >
              <div class="box-body chart-type-body">
                <template v-for="ct in chartConfig.subType" :key="ct.id">
                  <el-button
                    @click="selectChartSubType(chartConfig, ct)"
                    class="chart-type"
                    :class="{ active: chartSetting.chartSubType == ct.id }"
                  >
                    <i class="icon" :class="ct.cssClass || chartConfig.cssClass"></i>
                  </el-button>
                </template>
              </div>
            </el-collapse-item>
            <el-collapse-item name="datatake" title="数据显示" class="box-head">
              <div class="box-body chart-type-body">
                <div class="data-top">
                  <el-checkbox v-model="chartSetting.takeEnable">显示前</el-checkbox>
                  <el-input-number
                    v-model="chartSetting.take"
                    :disabled="!chartSetting.takeEnable"
                    size="small"
                    :controls="false"
                    class="take-input"
                  />
                  <span class="take-label">条数据</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-aside>
      <DataSourceDialog
        v-model="showDataSourceDialog"
        :appId="dashItemDef.appId"
        :dataSource="chartSetting.datasource"
        @ok="handleSourceOk"
      ></DataSourceDialog>
    </el-container>
  </EtDrawer>
</template>
<script setup lang="ts">
import Draggable from "vuedraggable";
import { IDataSource, IDataSourceField } from "../type";
import { DashboardItemDef, FieldDef, FieldType, FormDef, FormType } from "@eimsnext/models";
import { IConditionList, IFormItem, ISortItem, ISortList } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";
import DataSourceDialog from "../components/DataSourceDialog.vue";
import {
  ChartType,
  getChartConfigs,
  getLimitationDesc,
  IChartConfig,
  IChartSetting,
  IDimensionField,
  IMetricsField,
} from "./type";
import {
  dashboardItemDefService,
  DatasourceType,
  IDimension,
  SortDirection,
} from "@eimsnext/services";
import { getAppIconColor, getFormIcon } from "@/utils/common";
import { SortableEvent } from "sortablejs";
import EChartsViewer from "./EChartsViewer.vue";
import { uniqueId } from "@eimsnext/utils";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "EChartsDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  dashItemDef: DashboardItemDef;
}>();

const chartConfigs = getChartConfigs();
const chartSetting = reactive<IChartSetting>(JSON.parse(props.dashItemDef.details));
const selectedRole = ref("1");
const formItem = ref<IFormItem>();
const formStore = useFormStore();
const formDef = ref<FormDef>();
const fields = ref<IDataSourceField[]>([]);
const showDataSourceDialog = ref(false);

const populateDatasourceFields = () => {
  fields.value = [];
  switch (chartSetting.datasource.type) {
    case DatasourceType.Form:
      formStore.get(chartSetting.datasource.id).then((form) => {
        formDef.value = form;
        populateFormFields();
      });
      break;
    default:
      break;
  }
};

const populateFormFields = () => {
  if (formDef.value?.content && formDef.value?.content.items) {
    formDef.value?.content.items.forEach((x: FieldDef) => {
      if (x.type != FieldType.TableForm) {
        let node: IDataSourceField = {
          id: x.field,
          type: x.type,
          label: x.title,
          isComputed: false,
        };

        fields.value.push(node);
      } else {
        if (x.columns && x.columns.length > 0) {
          x.columns.forEach((y) => {
            let subNode: IDataSourceField = {
              id: `${x.field}>${y.field}`,
              type: y.type,
              label: `${x.title}.${y.title}`,
              isComputed: false,
            };
            fields.value.push(subNode);
          });
        }
      }
    });
  }
};

const changeDataSource = () => {
  showDataSourceDialog.value = true;
};

const handleSourceOk = async (source: IDataSource) => {
  chartSetting.datasource = source;
  showDataSourceDialog.value = false;
  populateDatasourceFields();
};

const roleChanged = () => {};

const activeCollItems = ref(["charttype"]);
const activeSettingItems = ref(["chartsubtype", "datatake"]);
const chartConfig = ref<IChartConfig>();
const dropable = ref<any>({});

const selectChartType = (cc: IChartConfig) => {
  chartConfig.value = cc;
  chartSetting.chartType = cc.id;
};

const selectChartSubType = (cc: IChartConfig, sub: any) => {
  chartSetting.chartSubType = sub.id;
};

const fieldIsDeleted = (item: any) => {
  let notExist = false;
  // if (this.editItem.setting && this.editItem.setting.dataSourceNotExist) {
  //   notExist = true;
  // }
  return notExist; //|| item.IsDelete;
};

const dragStart = (e: SortableEvent) => {
  e.preventDefault();
};

const dragMove = (e: SortableEvent) => {
  dropable.value = {};
  const targetClass = e.to?.className || "";

  if (targetClass.includes("dimension1")) {
    dropable.value.dimension1 = true;
  } else if (targetClass.includes("dimension2")) {
    dropable.value.dimension2 = true;
  } else if (targetClass.includes("metrics")) {
    dropable.value.metrics = true;
  }
};

const cloneDragField = (f: IDataSourceField) => {
  return {
    id: f.id,
    type: f.type,
    label: f.label,
    title: f.label,
  };
};

const dragEnd = (e: SortableEvent) => {
  dropable.value = {};
};

const addDim1 = () => {
  updateSortList();
};

const removeDim1 = (dim: IDimensionField) => {
  chartSetting.dimension1 = chartSetting.dimension1?.filter((x) => x.id != dim.id);
  updateSortList();
};

const addMetric = () => {
  updateSortList();
};

const removeMetric = (metric: IMetricsField) => {
  chartSetting.metrics = chartSetting.metrics?.filter((x) => x.id != metric.id);
  updateSortList();
};

const updateSortList = () => {
  let newSorts: ISortItem[] = [];
  let sortList: ISortList = chartSetting.sort || { items: [] };

  if (chartSetting.dimension1) {
    chartSetting.dimension1.forEach((x) => {
      let oldSort = sortList.items.find((s) => s.field.field == x.id);
      newSorts.push({
        field: { field: x.id, label: x.label!, type: x.type! },
        sort: oldSort ? oldSort.sort : SortDirection.Unset,
      });
    });
  }
  // if (chartSetting.dimension2) {
  //   chartSetting.dimension2.forEach(x => {
  //     let oldSort = sortList.items.find(s => s.field.field == x.id)
  //     newSorts.push({ field: { field: x.id, label: x.label!, type: x.type! }, sort: oldSort ? oldSort.sort : SortDirection.Unset })
  //   })
  // }
  if (chartSetting.metrics) {
    chartSetting.metrics.forEach((x) => {
      let oldSort = sortList.items.find((s) => s.field.field == x.id);
      newSorts.push({
        field: { field: x.id, label: x.label!, type: x.type! },
        sort: oldSort ? oldSort.sort : SortDirection.Unset,
      });
    });
  }

  chartSetting.sort = { items: newSorts };
};

const addComputedField = () => {};
const copyField = (field: IDataSourceField) => {};
const editField = (field: IDataSourceField, index: number) => {};
const removeField = (field: IDataSourceField, index: number) => {};

const onFilter = (filter: IConditionList) => {
  chartSetting.filter = filter;
};
const onSave = async () => {
  var details = JSON.stringify(chartSetting);

  let req = {
    id: props.dashItemDef.id,
    name: props.dashItemDef.name,
    details: details,
  };

  let resp = await dashboardItemDefService.patch<DashboardItemDef>(req.id, req);
};

const emit = defineEmits(["update:modelValue", "close"]);
const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

onMounted(() => {
  if (!chartSetting.dimension1) chartSetting.dimension1 = [];
  if (!chartSetting.dimension2) chartSetting.dimension2 = [];
  if (!chartSetting.metrics) chartSetting.metrics = [];
  if (!chartSetting.filter) chartSetting.filter = { id: uniqueId(), rel: "and", items: [] };
  if (!chartSetting.sort) chartSetting.sort = { items: [] };

  /*  */
  if (chartSetting.datasource) populateDatasourceFields();
});
</script>
<style lang="scss" scoped>
.design-container {
  background: var(--et-bg-page);
  height: 100%;

  .left-aside {
    border-right: 1px solid var(--et-border-color-light);
    background-color: var(--et-bg-container);

    .left-container {
      font-size: var(--et-font-size-12);
      background: var(--et-bg-container);
      padding-bottom: var(--et-size-35);

      .icon {
        color: var(--et-text-tertiary);
      }

      .data-source {
        padding: var(--et-space-10) var(--et-space-10) 0 var(--et-space-20);
        border-bottom: 1px solid var(--et-border-color-light);

        .data-source-setting {
          display: flex;
          justify-content: space-between;
          box-sizing: border-box;
          font-size: var(--et-font-size-14);
          font-weight: 600;
          line-height: var(--et-line-height-30);

          .choose-data {
            color: var(--et-color-primary);
            cursor: pointer;
          }
        }

        .data-source-title {
          font-size: var(--et-font-size-12);
          overflow: auto;
          padding: var(--et-space-5) 0;
          display: flex;
          align-items: center;

          .data-source-name {
            margin-left: var(--et-space-10);
            cursor: pointer;
          }
        }
      }

      .fields-container {
        padding: var(--et-space-10) var(--et-space-10) 0 var(--et-space-20);

        .field-title {
          display: flex;
          justify-content: space-between;
          box-sizing: border-box;
          font-size: var(--et-font-size-14);
          font-weight: 600;
          line-height: var(--et-line-height-30);

          .field-operation {
            float: right;
            cursor: pointer;
            padding-right: var(--et-space-15);
          }
        }

        .field-list {
          overflow-y: auto;
        }

        .field-wrapper {
          border: 1px solid var(--et-border-color-light);
          border-radius: var(--et-radius-5);
          padding: 0 0 0 var(--et-space-8);
          line-height: var(--et-line-height-30);
          margin: var(--et-space-5) 0;
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          cursor: move;

          .field-name {
            border-radius: var(--et-radius-5);
            line-height: var(--et-line-height-30);
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            flex-wrap: nowrap;

            .name {
              max-width: var(--et-size-110);
              display: inline-block;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          &:hover {
            border: 1px solid var(--et-color-primary);
            background: var(--et-bg-hover);

            .icon {
              color: var(--et-color-primary);
            }

            .name {
              color: var(--et-color-primary);
            }
          }

          .tool-icons {
            display: inline-flex;
            align-items: center;

            span {
              &:last-child {
                margin-right: 5px;
              }

              &:hover {
                color: var(--et-color-primary);
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }

  .center-echarts {
    display: flex;
    flex-direction: column;
    padding: var(--et-space-10);

    .green-line {
      background-color: var(--et-bg-success-soft) !important;
      border-color: var(--et-color-success) !important;
    }

    .center-box {
      flex: 0 0 auto;
      border: 1px dashed var(--et-border-color);
      background-color: var(--et-bg-container);
      margin-bottom: var(--et-space-8);
      display: flex;

      .el-dropdown {
        cursor: pointer;
        margin-right: var(--et-space-8);

        .builder-filter-icon {
          display: flex;
          align-items: center;

          img {
            width: var(--et-space-16);
            height: var(--et-space-16);
          }
        }
      }

      .chart-container {
        width: 100%;
      }

      .title {
        padding: 0 var(--et-space-10);
        line-height: var(--et-line-height-34);
        width: var(--et-size-91);
      }

      .drag-target-container {
        width: calc(100% - 120px);
        overflow: hidden;

        .dimension1,
        .dimension2,
        .metrics,
        .filter {
          height: 100%;
          display: flex;
          align-items: center;
          flex-direction: row;
        }

        .quota-item {
          background-color: var(--et-color-success);
          color: var(--et-text-on-primary);
          line-height: var(--et-line-height-16);
        }

        .display-item {
          color: var(--et-text-on-primary);
          background-color: var(--et-color-primary);

          .el-icon-arrow-down {
            color: var(--et-text-on-primary);
          }
        }

        .filter-item {
          background-color: var(--et-bg-hover);
        }

        .filter-item.item {
          display: flex;

          .close-icon {
            background-color: var(--et-text-secondary);
          }

          &:hover {
            .close-icon {
              display: block;
            }
          }

          .filter-label {
            color: var(--et-text-secondary);
            display: inline-block;
            vertical-align: text-bottom;
            font-size: var(--et-font-size-14);

            .label {
              display: inline-block;
            }
          }
        }

        span {
          width: 100%;
          height: 100%;
          display: block;
          min-height: var(--et-line-height-34);
          display: flex;
          flex-wrap: wrap;
        }

        .style-red {
          background-color: var(--et-bg-danger-soft);
          color: var(--et-color-danger) !important;
        }

        .layer-item {
          background-color: var(--et-bg-hover);
          color: var(--et-color-primary);
          border: 1px solid var(--et-bg-hover);
          cursor: move !important;

          .layer-text {
            position: absolute;
            right: var(--et-space-24);
            top: var(--et-space-5);
          }

          .chart-type {
            position: absolute;
            box-sizing: border-box;
            width: var(--et-space-14);
            text-align: center;
            border: none;
            border-radius: var(--et-radius-5);
            right: var(--et-space-8);
            top: 50%;
            transform: translateY(-50%);
            height: var(--et-space-14);

            .icon {
              width: var(--et-space-14);
              height: var(--et-space-14);
              background-repeat: no-repeat;
              background-size: cover;
              box-sizing: border-box;
              display: inline-block;
              opacity: 1; //0.5;
            }
          }
        }

        .active {
          background: var(--et-color-primary);
          color: var(--et-text-on-primary);

          .icon {
            filter: brightness(100);
          }
        }

        .add-layer-item {
          cursor: pointer !important;
          margin: var(--et-space-5);
          border-radius: var(--et-radius-5);
          padding: var(--et-space-4);
          position: relative;
          height: var(--et-size-25);

          &:hover {
            background-color: var(--et-bg-hover);
          }
        }
      }
    }

    .bg-img {
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
    }

    .chart-main {
      background-color: var(--et-bg-container);
      position: relative;
      flex: 1 1 auto;
      overflow: hidden;
    }
  }

  .echarts-config {
    border-left: 1px solid var(--et-border-color-light);
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 var(--et-space-10);
    background: var(--et-bg-container);

    :deep(.el-collapse-item__header) {
      line-height: var(--et-line-height-32);
      height: var(--et-size-32);
      min-height: var(--et-size-32);
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 0;
    }

    .config-box {
      padding-bottom: var(--et-space-11);

      .box-head {
        font-size: var(--et-font-size-13);
        line-height: var(--et-space-28);
        padding: 0 var(--et-space-5) 0 0;
        font-weight: 700;
        cursor: pointer;
        margin-top: var(--et-space-10);
      }

      .box-body {
        margin-bottom: var(--et-space-15);
      }

      .chart-type-body {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;

        .chart-type {
          margin: var(--et-space-8);
          cursor: pointer;
          box-sizing: border-box;
          width: var(--et-line-height-34);
          padding: var(--et-space-5) 0 var(--et-space-3) 0;
          text-align: center;
          border: none;
          border-radius: var(--et-radius-5);

          .icon {
            width: var(--et-size-24);
            height: var(--et-size-24);
            background-repeat: no-repeat;
            background-size: cover;
            box-sizing: border-box;
            display: inline-block;
            opacity: 0.8; //0.5;
          }

          //&:hover {
          //background-color: var(--el-bg-color);

          //.icon {
          //  opacity: 1;
          //}
          //}
        }

        .active {
          //background-color: var(--el-bg-color);
          background-color: var(--et-color-primary);

          .icon {
            opacity: 1;
            filter: brightness(100);
          }
        }

        .line {
          background-image: url("../../../assets/images/charts/Line.svg");
        }

        .line-area {
          background-image: url("../../../assets/images/charts/Line.area.svg");
        }

        .hbar {
          background-image: url("../../../assets/images/charts/HBar.svg");
        }

        .hbar-stack {
          background-image: url("../../../assets/images/charts/HBar.stack.svg");
        }

        .vbar {
          background-image: url("../../../assets/images/charts/VBar.svg");
        }

        .vbar-stack {
          background-image: url("../../../assets/images/charts/VBar.stack.svg");
        }

        .vbar-waterfall {
          background-image: url("../../../assets/images/charts/VBar.waterfall.svg");
        }

        .pie {
          background-image: url("../../../assets/images/charts/Pie.svg");
        }

        .pie-circle {
          background-image: url("../../../assets/images/charts/Pie.circle.svg");
        }
      }

      .data-top {
        display: flex;
        align-items: center;
      }

      .take-input {
        width: var(--et-size-60);
        margin: 0 var(--et-space-5);
      }

      .take-label {
        font-weight: 400;
      }
    }
  }
}

.center-echarts-main {
  min-width: var(--et-size-460);
}

.chart-type-tooltip {
  margin: var(--et-space-8);
  width: var(--et-size-120);
  height: var(--et-size-60);
}

.chart-type-tooltip-title {
  margin-bottom: var(--et-space-6);
  font-weight: 600;
}
</style>
