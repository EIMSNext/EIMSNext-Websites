<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="dashItemDef.name" class="title-editor" />
    </template>
    <template #top-right>
      <el-button @click="onSave">{{ t("common.save") }}</el-button>
    </template>
    <el-container class="design-container">
      <el-aside width="250px" class="left-aside">
        <div class="left-container">
          <div class="data-source">
            <div class="data-source-setting">
              <span>{{ t("admin.dashboardChartDesigner.dataSource") }}</span>
              <div class="choose-data" @click="changeDataSource">{{ t("admin.dashboardChartDesigner.changeDataSource") }}</div>
            </div>
            <div class="data-source-title">
              <et-icon size="16px" :icon="getFormIcon()" :color="getAppIconColor()"></et-icon>
              <span class="data-source-name" :title="chartSetting.datasource?.label">{{ chartSetting.datasource?.label }}</span>
            </div>
          </div>
          <div class="data-source" v-if="chartSetting.datasource.type == DatasourceType.Form">
            <div class="data-source-setting">
              <span>{{ t("admin.dashboardChartDesigner.dataAccess") }}</span>
            </div>
            <div class="data-source-title">
              <el-select v-model="selectedEmployeeGroup" @change="employeeGroupChanged">
                <el-option :label="t('admin.dashboardChartDesigner.allFormData')" value="1"></el-option>
                <el-option :label="t('admin.dashboardChartDesigner.inheritFormPerms')" value="2"></el-option>
              </el-select>
            </div>
          </div>
          <div class="fields-container">
            <div class="field-title">
              <span>{{ t("admin.dashboardChartDesigner.fields") }}</span>
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
                      <et-icon
                        size="16px"
                        :icon="fieldIcons[element.type] || 'fc-icon-input'"
                        class="mr-[8px]"
                      ></et-icon>
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
        <div v-if="chartSetting.chartType !== ChartType.Indicator && chartSetting.chartType !== ChartType.Progress" class="center-box" :class="{ 'green-line': dropable.dimension1 }">
          <div class="title">{{ t("admin.dashboardChartDesigner.dimension") }}</div>
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
          <div class="title">{{ t("admin.dashboardChartDesigner.metric") }}</div>
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
        <div
          v-if="chartSetting.chartType === ChartType.Progress"
          class="center-box progress-target-box"
          :class="{ 'green-line': dropable.progressTarget }"
        >
          <div class="title">{{ t("admin.dashboardChartDesigner.targetValue") }}</div>
          <div class="drag-target-container progress-target-container">
            <Draggable
              class="progress-target"
              :list="progressTargetFields"
              :sort="false"
              :group="{ name: 'fields', pull: false, put: true }"
              item-key="id"
              @add="addProgressTarget"
            >
              <template #item="{ element }">
                <div class="progress-target-tag" @click.stop="editProgressTarget">
                  <span class="progress-target-check">✓</span>
                  <span class="progress-target-label">{{ element.label || element.id }} ({{ getAggregateLabel(element.aggFun) }})</span>
                  <button type="button" class="progress-target-remove" @click.stop="clearProgressTarget">
                    <et-icon icon="el-close" size="12px" />
                  </button>
                </div>
              </template>
            </Draggable>
            <div
              v-if="!targetEditing && progressTargetFields.length === 0 && progressOptions.targetValue != null"
              class="progress-target-tag"
              @click.stop="editProgressTarget"
            >
              <span class="progress-target-check">✓</span>
              <span class="progress-target-label">{{ t("admin.dashboardChartDesigner.manualTargetLabel", { value: progressOptions.targetValue }) }}</span>
            </div>
            <el-input-number
              v-if="targetEditing"
              v-model="progressOptions.targetValue"
              class="progress-target-input"
              :min="0.000001"
              :controls="false"
              :placeholder="t('admin.dashboardChartDesigner.manualTarget')"
              @change="commitProgressManualTarget"
            />
            <span v-else-if="progressTargetFields.length === 0 && progressOptions.targetValue == null" class="progress-target-hint" @click="editProgressTarget">
              {{ t("admin.dashboardChartDesigner.targetValueHint") }}
            </span>
          </div>
        </div>
        <div class="center-box">
          <div class="title">{{ t("admin.dashboardChartDesigner.filter") }}</div>
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
              :item-def="dashItemDef"
              :designer-mode="true"
            />
          </div>
        </div>
      </el-main>
      <el-aside width="300px" class="echarts-config">
        <div class="config-box">
          <el-collapse v-model="activeCollItems" expand-icon-position="left">
            <el-collapse-item name="charttype" :title="t('admin.dashboardChartDesigner.chartType')" class="box-head">
              <div class="box-body chart-type-body">
                <template v-for="cc in chartConfigs" :key="cc.id">
                  <el-tooltip placement="left" effect="light">
                    <template #content>
                      <div class="chart-type-tooltip">
                        <div class="chart-type-tooltip-title">{{ t(cc.i18n) }}</div>
                        <div>{{ cc.limitationDescription ? t(cc.limitationDescription) : getLimitationDesc(t, cc.limitation) }}</div>
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
              :title="t(chartSetting.chartType === ChartType.Line ? 'admin.dashboardChartDesigner.lineType' : 'admin.dashboardChartDesigner.barSubType')"
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
            <el-collapse-item v-if="chartSetting.chartType === ChartType.Indicator" name="indicatorconfig" :title="t('admin.dashboardChartDesigner.indicatorConfig')" class="box-head">
              <div class="chart-settings-panel">
                <el-checkbox v-model="indicatorOptions.showName">{{ t('admin.dashboardChartDesigner.showMetricName') }}</el-checkbox>
                <div class="setting-row">
                  <span>{{ t('admin.dashboardChartDesigner.decimalPlaces') }}</span>
                  <el-input-number v-model="indicatorOptions.decimalPlaces" :min="0" :max="6" :controls="false" />
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item v-if="chartSetting.chartType === ChartType.Progress" name="progressconfig" :title="t('admin.dashboardChartDesigner.progressConfig')" class="box-head">
              <div class="chart-settings-panel">
                <div class="box-body chart-type-body">
                  <el-button v-for="style in progressStyles" :key="style.id" @click="progressOptions.style = style.id" class="chart-type" :class="{ active: progressOptions.style === style.id }">
                    <i class="icon" :class="style.cssClass"></i>
                  </el-button>
                </div>
                <div class="setting-row">
                  <span>{{ t('admin.dashboardChartDesigner.decimalPlaces') }}</span>
                  <el-input-number v-model="progressOptions.decimalPlaces" :min="0" :max="6" :controls="false" />
                </div>
                <el-checkbox v-model="progressOptions.showName">{{ t('admin.dashboardChartDesigner.showMetricName') }}</el-checkbox>
                <el-checkbox v-model="progressOptions.showActual">{{ t('admin.dashboardChartDesigner.showActualValue') }}</el-checkbox>
                <el-checkbox v-model="progressOptions.showTarget">{{ t('admin.dashboardChartDesigner.showTargetValue') }}</el-checkbox>
                <el-checkbox v-model="progressOptions.showPercent">{{ t('admin.dashboardChartDesigner.showPercent') }}</el-checkbox>
              </div>
            </el-collapse-item>
            <el-collapse-item v-if="chartSetting.chartType === ChartType.Line" name="lineconfig" :title="t('admin.dashboardChartDesigner.lineConfig')" class="box-head">
              <div class="chart-settings-panel">
                <div class="setting-row">
                  <span>{{ t('admin.dashboardChartDesigner.lineType') }}</span>
                  <el-radio-group v-model="lineOptions.smooth">
                    <el-radio :value="false">{{ t('admin.dashboardChartDesigner.lineNormal') }}</el-radio>
                    <el-radio :value="true">{{ t('admin.dashboardChartDesigner.lineCurve') }}</el-radio>
                  </el-radio-group>
                </div>
                <el-checkbox v-model="lineOptions.showSymbol">{{ t('admin.dashboardChartDesigner.showDataPoint') }}</el-checkbox>
                <el-select v-model="lineOptions.xAxisLabelMode">
                  <el-option value="horizontal" :label="t('admin.dashboardChartDesigner.xAxisHorizontal')" />
                  <el-option value="tilt" :label="t('admin.dashboardChartDesigner.xAxisTilt')" />
                  <el-option value="vertical" :label="t('admin.dashboardChartDesigner.xAxisVertical')" />
                </el-select>
                <el-checkbox v-model="lineOptions.showAllLabels">{{ t('admin.dashboardChartDesigner.showAllXAxisLabels') }}</el-checkbox>
                <el-checkbox v-model="lineOptions.showDataZoom">{{ t('admin.dashboardChartDesigner.showDataZoom') }}</el-checkbox>
                <el-input v-model="lineOptions.yAxisTitle" :placeholder="t('admin.dashboardChartDesigner.yAxisTitle')" />
                <div class="setting-row"><span>{{ t('admin.dashboardChartDesigner.yAxisMin') }}</span><el-input-number v-model="lineOptions.yAxisMin" :controls="false" /></div>
                <div class="setting-row"><span>{{ t('admin.dashboardChartDesigner.yAxisMax') }}</span><el-input-number v-model="lineOptions.yAxisMax" :controls="false" /></div>
                <el-checkbox v-model="lineOptions.showDataLabel">{{ t('admin.dashboardChartDesigner.showDataLabel') }}</el-checkbox>
                <el-radio-group v-model="lineOptions.labelOverlap">
                  <el-radio value="adjust">{{ t('admin.dashboardChartDesigner.labelAdjust') }}</el-radio>
                  <el-radio value="hide">{{ t('admin.dashboardChartDesigner.labelHide') }}</el-radio>
                  <el-radio value="stagger">{{ t('admin.dashboardChartDesigner.labelStagger') }}</el-radio>
                </el-radio-group>
              </div>
            </el-collapse-item>
            <el-collapse-item v-if="chartSetting.chartType === ChartType.VBar || chartSetting.chartType === ChartType.HBar" name="barconfig" :title="t('admin.dashboardChartDesigner.barConfig')" class="box-head">
              <div class="chart-settings-panel">
                <el-select v-model="barOptions.categoryAxisLabelMode">
                  <el-option value="horizontal" :label="t('admin.dashboardChartDesigner.xAxisHorizontal')" />
                  <el-option value="tilt" :label="t('admin.dashboardChartDesigner.xAxisTilt')" />
                  <el-option value="vertical" :label="t('admin.dashboardChartDesigner.xAxisVertical')" />
                </el-select>
                <el-checkbox v-model="barOptions.showAllCategoryLabels">{{ t('admin.dashboardChartDesigner.showAllXAxisLabels') }}</el-checkbox>
                <el-checkbox v-model="barOptions.showDataZoom">{{ t('admin.dashboardChartDesigner.showDataZoom') }}</el-checkbox>
                <el-input v-model="barOptions.valueAxisTitle" :placeholder="t('admin.dashboardChartDesigner.valueAxisTitle')" />
                <div class="setting-row"><span>{{ t('admin.dashboardChartDesigner.valueAxisMin') }}</span><el-input-number v-model="barOptions.valueAxisMin" :controls="false" /></div>
                <div class="setting-row"><span>{{ t('admin.dashboardChartDesigner.valueAxisMax') }}</span><el-input-number v-model="barOptions.valueAxisMax" :controls="false" /></div>
                <el-checkbox v-model="barOptions.showDataLabel">{{ t('admin.dashboardChartDesigner.showDataLabel') }}</el-checkbox>
                <el-radio-group v-model="barOptions.labelOverlap">
                  <el-radio value="adjust">{{ t('admin.dashboardChartDesigner.labelAdjust') }}</el-radio>
                  <el-radio value="hide">{{ t('admin.dashboardChartDesigner.labelHide') }}</el-radio>
                  <el-radio value="stagger">{{ t('admin.dashboardChartDesigner.labelStagger') }}</el-radio>
                </el-radio-group>
              </div>
            </el-collapse-item>
            <el-collapse-item name="datatake" :title="t('admin.dashboardChartDesigner.dataDisplay')" class="box-head">
              <div class="box-body chart-type-body">
                <div class="data-top">
                  <el-checkbox v-model="chartSetting.takeEnable">{{ t("admin.dashboardChartDesigner.showTop") }}</el-checkbox>
                  <el-input-number
                    v-model="chartSetting.take"
                    :disabled="!chartSetting.takeEnable"
                    size="small"
                    :controls="false"
                    class="take-input"
                  />
                  <span class="take-label">{{ t("admin.dashboardChartDesigner.records") }}</span>
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
import { fieldIcons, IConditionList, IFormItem, ISortItem, ISortList } from "@eimsnext/components";
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
  chartSettingValidate,
} from "./type";
import {
  dashboardItemDefService,
  AggregateFun,
  DatasourceType,
  IDimension,
  SortDirection,
} from "@eimsnext/services";
import { getAppIconColor, getFormIcon } from "@/utils/common";
import { SortableEvent } from "sortablejs";
import EChartsViewer from "./EChartsViewer.vue";
import { uniqueId } from "@eimsnext/utils";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
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
const selectedEmployeeGroup = ref("1");
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
  const sourceChanged = chartSetting.datasource?.id !== source?.id || chartSetting.datasource?.type !== source?.type;
  chartSetting.datasource = source;
  if (sourceChanged) {
    chartSetting.dimension1 = [];
    chartSetting.dimension2 = [];
    chartSetting.metrics = [];
    chartSetting.sort = { items: [] };
    chartSetting.filter = { id: uniqueId(), rel: "and", items: [] };
    chartSetting.progress = undefined;
    progressTargetFields.value = [];
    targetEditing.value = false;
  }
  showDataSourceDialog.value = false;
  populateDatasourceFields();
};

const employeeGroupChanged = () => {};

const activeCollItems = ref(["charttype"]);
const activeSettingItems = ref(["chartsubtype", "datatake"]);
const chartConfig = ref<IChartConfig>();
const dropable = ref<any>({});
const indicatorOptions = reactive({ showName: true, decimalPlaces: 0 });
const progressStyles = [
  { id: "ring" as const, cssClass: "progress-ring" },
  { id: "semi" as const, cssClass: "progress-semi" },
  { id: "thin" as const, cssClass: "progress-thin" },
];
const progressOptions = reactive({ targetType: "metric" as "metric" | "value", targetValue: undefined as number | undefined, decimalPlaces: 0, style: "ring" as "ring" | "semi" | "thin", showName: true, showActual: false, showTarget: false, showPercent: true });
const progressTargetFields = ref<IDataSourceField[]>([]);
const targetEditing = ref(false);
const lineOptions = reactive({ smooth: false, showSymbol: true, xAxisLabelMode: "horizontal" as "horizontal" | "tilt" | "vertical", showAllLabels: false, showDataZoom: false, yAxisTitle: "", yAxisMin: null as number | null, yAxisMax: null as number | null, showDataLabel: false, labelOverlap: "adjust" as "adjust" | "hide" | "stagger" });
const barOptions = reactive({ categoryAxisLabelMode: "horizontal" as "horizontal" | "tilt" | "vertical", showAllCategoryLabels: false, showDataZoom: false, valueAxisTitle: "", valueAxisMin: null as number | null, valueAxisMax: null as number | null, showDataLabel: false, labelOverlap: "adjust" as "adjust" | "hide" | "stagger" });
const syncProgressTargetField = () => {
  const target = chartSetting.progress?.targetMetric;
  progressTargetFields.value = target ? [{ ...target }] : [];
};

const addProgressTarget = () => {
  const target = progressTargetFields.value.at(-1);
  const targetMetric = target as (IDataSourceField & { aggFun?: AggregateFun }) | undefined;
  progressTargetFields.value = target ? [target] : [];
  targetEditing.value = false;
  progressOptions.targetType = "metric";
  progressOptions.targetValue = undefined;
  chartSetting.progress = {
    ...progressOptions,
    targetType: "metric",
    targetValue: undefined,
    targetMetric: target ? { ...target, aggFun: targetMetric?.aggFun || (target.type === FieldType.Number ? AggregateFun.Sum : AggregateFun.Count) } : undefined,
  };
};

const clearProgressTarget = () => {
  progressTargetFields.value = [];
  targetEditing.value = true;
  progressOptions.targetType = "value";
  progressOptions.targetValue = undefined;
  chartSetting.progress = { ...progressOptions, targetType: "value", targetMetric: undefined };
};

const editProgressTarget = () => {
  const currentManualTarget = progressOptions.targetType === "value" ? progressOptions.targetValue : undefined;
  targetEditing.value = true;
  progressOptions.targetType = "value";
  progressOptions.targetValue = currentManualTarget;
  chartSetting.progress = { ...progressOptions, targetType: "value", targetMetric: undefined };
};

const commitProgressManualTarget = () => {
  targetEditing.value = false;
  progressOptions.targetType = "value";
  chartSetting.progress = { ...progressOptions, targetType: "value", targetMetric: undefined };
};

const getAggregateLabel = (aggFun?: AggregateFun) => {
  const key = aggFun || AggregateFun.Count;
  return t(`admin.dashboardFieldBar.${key}`);
};

const selectChartType = (cc: IChartConfig) => {
  chartConfig.value = cc;
  chartSetting.chartType = cc.id;
  chartSetting.chartSubType = cc.subType?.[0]?.id;
  if (cc.id === ChartType.Indicator || cc.id === ChartType.Progress) {
    chartSetting.dimension1 = [];
    chartSetting.dimension2 = [];
    chartSetting.sort = { items: [] };
  }
  if (cc.id === ChartType.Indicator || cc.id === ChartType.Progress) {
    chartSetting.metrics = (chartSetting.metrics || []).slice(0, 1).map((metric) => ({
      ...metric,
      aggFun: metric.aggFun || AggregateFun.Count,
    }));
    if (cc.id === ChartType.Indicator) {
      Object.assign(indicatorOptions, {
        showName: chartSetting.indicator?.showName ?? true,
        decimalPlaces: chartSetting.indicator?.decimalPlaces ?? 0,
      });
      chartSetting.indicator = { ...indicatorOptions };
    } else {
      Object.assign(progressOptions, {
        targetType: chartSetting.progress?.targetType ?? "metric",
        targetValue: chartSetting.progress?.targetValue,
        decimalPlaces: chartSetting.progress?.decimalPlaces ?? 0,
        style: chartSetting.progress?.style ?? "ring",
        showName: chartSetting.progress?.showName ?? true,
        showActual: chartSetting.progress?.showActual ?? false,
        showTarget: chartSetting.progress?.showTarget ?? false,
        showPercent: chartSetting.progress?.showPercent ?? true,
      });
      chartSetting.progress = {
        ...progressOptions,
        targetMetric: chartSetting.progress?.targetMetric,
      };
      syncProgressTargetField();
    }
  }
  if (cc.id !== ChartType.Indicator && cc.id !== ChartType.Progress && chartSetting.dimension1 && chartSetting.dimension1.length > 1) chartSetting.dimension1 = chartSetting.dimension1.slice(0, 1);
  if (cc.id !== ChartType.Indicator && cc.id !== ChartType.Progress) updateSortList();
};

const selectChartSubType = (cc: IChartConfig, sub: any) => {
  chartSetting.chartSubType = sub.id;
  if (cc.id === ChartType.Line) lineOptions.smooth = sub.id === "smooth";
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
  } else if (targetClass.includes("progress-target")) {
    dropable.value.progressTarget = true;
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
  if (chartSetting.dimension1 && chartSetting.dimension1.length > 1) chartSetting.dimension1 = chartSetting.dimension1.slice(-1);
  updateSortList();
};

const removeDim1 = (dim: IDimensionField) => {
  chartSetting.dimension1 = chartSetting.dimension1?.filter((x) => x.id != dim.id);
  updateSortList();
};

const addMetric = () => {
  if ((chartSetting.chartType === ChartType.Progress || chartSetting.chartType === ChartType.Indicator) && (chartSetting.metrics?.length || 0) > 1) {
    chartSetting.metrics?.splice(1);
  }
  updateSortList();
};

const removeMetric = (metric: IMetricsField) => {
  chartSetting.metrics = chartSetting.metrics?.filter((x) => x.id != metric.id);
  updateSortList();
};

const updateSortList = () => {
  if (chartSetting.chartType === ChartType.Indicator || chartSetting.chartType === ChartType.Progress) {
    chartSetting.sort = { items: [] };
    return;
  }
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
  if (chartSetting.chartType === ChartType.Indicator || chartSetting.chartType === ChartType.Progress) {
    chartSetting.sort = { items: [] };
  }
  chartSetting.indicator = chartSetting.chartType === ChartType.Indicator ? { ...indicatorOptions } : chartSetting.indicator;
  chartSetting.progress = chartSetting.chartType === ChartType.Progress ? { ...progressOptions, targetMetric: progressOptions.targetType === "metric" ? chartSetting.progress?.targetMetric : undefined } : chartSetting.progress;
  chartSetting.line = chartSetting.chartType === ChartType.Line ? { ...lineOptions } : chartSetting.line;
  chartSetting.bar = chartSetting.chartType === ChartType.VBar || chartSetting.chartType === ChartType.HBar ? { ...barOptions } : chartSetting.bar;
  if (!chartSettingValidate(chartSetting)) {
    ElMessage.warning(t("admin.dashItem.invalidConfig"));
    return;
  }
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
  chartConfig.value = chartConfigs.find((config) => config.id === chartSetting.chartType);
  Object.assign(indicatorOptions, { showName: chartSetting.indicator?.showName ?? true, decimalPlaces: chartSetting.indicator?.decimalPlaces ?? 0 });
  Object.assign(progressOptions, { targetType: chartSetting.progress?.targetType ?? "metric", targetValue: chartSetting.progress?.targetValue, decimalPlaces: chartSetting.progress?.decimalPlaces ?? 0, style: chartSetting.progress?.style ?? "ring", showName: chartSetting.progress?.showName ?? true, showActual: chartSetting.progress?.showActual ?? false, showTarget: chartSetting.progress?.showTarget ?? false, showPercent: chartSetting.progress?.showPercent ?? true });
  syncProgressTargetField();
  Object.assign(lineOptions, { smooth: chartSetting.line?.smooth ?? chartSetting.chartSubType === "smooth", showSymbol: chartSetting.line?.showSymbol ?? true, xAxisLabelMode: chartSetting.line?.xAxisLabelMode ?? "horizontal", showAllLabels: chartSetting.line?.showAllLabels ?? false, showDataZoom: chartSetting.line?.showDataZoom ?? false, yAxisTitle: chartSetting.line?.yAxisTitle ?? "", yAxisMin: chartSetting.line?.yAxisMin ?? null, yAxisMax: chartSetting.line?.yAxisMax ?? null, showDataLabel: chartSetting.line?.showDataLabel ?? false, labelOverlap: chartSetting.line?.labelOverlap ?? "adjust" });
  Object.assign(barOptions, { categoryAxisLabelMode: chartSetting.bar?.categoryAxisLabelMode ?? "horizontal", showAllCategoryLabels: chartSetting.bar?.showAllCategoryLabels ?? false, showDataZoom: chartSetting.bar?.showDataZoom ?? false, valueAxisTitle: chartSetting.bar?.valueAxisTitle ?? "", valueAxisMin: chartSetting.bar?.valueAxisMin ?? null, valueAxisMax: chartSetting.bar?.valueAxisMax ?? null, showDataLabel: chartSetting.bar?.showDataLabel ?? false, labelOverlap: chartSetting.bar?.labelOverlap ?? "adjust" });

  /*  */
  if (chartSetting.datasource) populateDatasourceFields();
});

watch(indicatorOptions, (options) => {
  if (chartSetting.chartType === ChartType.Indicator) chartSetting.indicator = { ...options };
}, { deep: true });
watch(progressOptions, (options) => {
  if (chartSetting.chartType === ChartType.Progress) chartSetting.progress = { ...options, targetMetric: options.targetType === "metric" ? chartSetting.progress?.targetMetric : undefined };
}, { deep: true });
watch(lineOptions, (options) => {
  if (chartSetting.chartType === ChartType.Line) {
    chartSetting.line = { ...options };
    if (!chartSetting.chartSubType || chartSetting.chartSubType === "basic" || chartSetting.chartSubType === "smooth") chartSetting.chartSubType = options.smooth ? "smooth" : "basic";
  }
}, { deep: true });
watch(barOptions, (options) => {
  if (chartSetting.chartType === ChartType.VBar || chartSetting.chartType === ChartType.HBar) chartSetting.bar = { ...options };
}, { deep: true });
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
            flex: 1 1 auto;
            min-width: 0;
            margin-left: var(--et-space-10);
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
        color: var(--et-text-primary);
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
          color: var(--et-text-on-success);
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

        .indicator {
          background-image: url("../../../assets/images/charts/Indicator.svg");
        }

        .progress {
          background-image: url("../../../assets/images/charts/Progress.svg");
        }

        .progress-ring {
          border: 3px solid var(--et-color-primary);
          border-radius: 50%;
        }

        .progress-semi {
          border: 3px solid var(--et-color-primary);
          border-bottom: 0;
          border-radius: var(--et-size-24) var(--et-size-24) 0 0;
          height: var(--et-size-14) !important;
          margin-top: var(--et-space-5);
        }

        .progress-thin {
          border: 3px solid var(--et-color-primary);
          border-radius: 50%;
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

.progress-target-container {
  min-height: var(--et-size-40);
}

.progress-target {
  flex: 1;
  min-width: 0;
  min-height: var(--et-size-30);
  display: flex;
  align-items: center;
}

.progress-target-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--et-space-5);
  max-width: 100%;
  padding: 0 var(--et-space-8);
  border-radius: var(--et-radius-20);
  background: var(--et-color-primary);
  color: var(--et-text-on-primary);
  cursor: pointer;
}

.progress-target-check {
  font-weight: 700;
}

.progress-target-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-target-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.progress-target-input {
  flex: 1;
  min-width: 0;
}

.progress-target-hint {
  color: var(--et-text-secondary);
  cursor: text;
  font-size: var(--et-font-size-12);
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

.chart-settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
  padding: 0 var(--et-space-8) var(--et-space-10);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-8);
}
</style>
