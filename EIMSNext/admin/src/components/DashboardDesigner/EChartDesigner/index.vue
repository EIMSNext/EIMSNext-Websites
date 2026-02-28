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
            <div style="overflow-y: auto">
              <Draggable :list="fields" :sort="false" ghost-class="ghost" @start="dragStart"
                :group="{ name: 'fields', pull: 'clone', put: false }" item-key="id">
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
      <el-main class="center-echarts" style="min-width: 460px">
        <div class="center-box" :class="{ 'green-line': dropable.dim1 }">
          <div class="title">
            维度
          </div>
          <div class="drag-target-container container-veidoo">
            <Draggable :list="chartSetting.dim1Fields" :sort="false" ghost-class="ghost" @start="dragStart"
              :group="{ name: 'fields', pull: 'clone', put: false }" item-key="id">
              <template #item="{ item, idx }">
                <div :key="item.Alias" class="item dimension-item forbid" :ref="'dim1' + idx">
                  <div @click="onDimFieldClick(idx, item, 'dim1', 'dim1' + idx)" class="item-text"
                    :class="fieldIsDelete(item) ? 'style-red' : ''">
                    <i :style="{ color: fieldIsDelete(item) ? '#eb5050' : '#fff' }"
                      class="el-icon-arrow-down ml-5 mr-2"></i>
                    {{ item.localName || item.label }}
                    <div :class="fieldIsDelete(item) ? 'close-icon-delete' : 'close-icon'">
                      <et-icon icon="el-delete" />
                    </div>
                  </div>
                </div>
              </template>
            </Draggable>
          </div>
        </div>
        <div class="center-box" :class="{ 'green-line': dropable.dim1 }">
          <div class="title">
            指标
          </div>
          <div class="drag-target-container container-veidoo">
            <Draggable :list="chartSetting.dim2Fields" :sort="false" ghost-class="ghost" @start="dragStart"
              :group="{ name: 'fields', pull: 'clone', put: false }" item-key="id">
              <template #item="{ item, idx }">
                <div :key="item.Alias" class="item dimension-item forbid" :ref="'dim2' + idx">
                  <div @click="onDimFieldClick(idx, item, 'dim2', 'dim2' + idx)" class="item-text"
                    :class="fieldIsDelete(item) ? 'style-red' : ''">
                    <i :style="{ color: fieldIsDelete(item) ? '#eb5050' : '#fff' }"
                      class="el-icon-arrow-down ml-5 mr-2"></i>
                    {{ item.localName || item.label }}
                    <div :class="fieldIsDelete(item) ? 'close-icon-delete' : 'close-icon'">
                      <et-icon icon="el-delete" />
                    </div>
                  </div>
                </div>
              </template>
            </Draggable>
          </div>
        </div>
        <div class="center-box" :class="{ 'green-line': dropable.dim1 }">
          <div class="title">
            过滤条件
          </div>
          <div class="drag-target-container container-veidoo">
            <Draggable :list="chartSetting.dim2Fields" :sort="false" ghost-class="ghost" @start="dragStart"
              :group="{ name: 'fields', pull: 'clone', put: false }" item-key="id">
              <template #item="{ item, idx }">
                <div :key="item.Alias" class="item dimension-item forbid" :ref="'dim2' + idx">
                  <div @click="onDimFieldClick(idx, item, 'dim2', 'dim2' + idx)" class="item-text"
                    :class="fieldIsDelete(item) ? 'style-red' : ''">
                    <i :style="{ color: fieldIsDelete(item) ? '#eb5050' : '#fff' }"
                      class="el-icon-arrow-down ml-5 mr-2"></i>
                    {{ item.localName || item.label }}
                    <div :class="fieldIsDelete(item) ? 'close-icon-delete' : 'close-icon'">
                      <et-icon icon="el-delete" />
                    </div>
                  </div>
                </div>
              </template>
            </Draggable>
          </div>
        </div>

        <div class="center-box chart-main"></div>
      </el-main>
      <el-aside width="300px" class="echarts-config">
        <div class="config-box">
          <el-collapse v-model="activeCollItems" expand-icon-position="left">
            <el-collapse-item name="charttype" title="图表类型" class="box-head">
              <div class="box-body chart-type-body pt-5">
                <template v-for="cc in chartConfigs" :key="cc.id">
                  <el-button @click="selectChartType(cc)" class="chart-type"
                    :class="{ active: chartSetting.chartType == cc.id }">
                    <i class="icon" :class="cc.cssClass"></i>
                  </el-button></template>
              </div>
            </el-collapse-item>
          </el-collapse>
          <div v-if="chartConfig">
            <el-collapse v-model="activeSettingItems" expand-icon-position="left">
              <el-collapse-item v-if="chartConfig.subType" name="charttype" title="柱状图类型" class="box-head">
                <div class="box-body chart-type-body pt-5">
                  <template v-for="ct in chartConfig.subType" :key="ct.id">
                    <el-button @click="selectChartSubType(chartConfig, ct.id)" class="chart-type"
                      :class="{ active: chartSetting.chartSubType == ct.id }">
                      <i class="icon" :class="ct.cssClass || chartConfig.cssClass"></i>
                    </el-button></template>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-aside>
      <DataSourceDialog v-model="showDataSourceDialog" :appId="dashItemDef.appId" :dataSource="chartSetting.datasource"
        @ok="handleSourceOk">
      </DataSourceDialog>
    </el-container>
  </EtDrawer>
</template>
<script setup lang="ts">
import Draggable from "vuedraggable";
import { DatasourceType, IDataSource, IDataSourceField } from "../type";
import { DashboardItemDef, FieldDef, FieldType, FormDef, FormType } from "@eimsnext/models";
import { IFormItem } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";
import DataSourceDialog from "../components/DataSourceDialog.vue";
import { useLocale } from "element-plus";
import { ChartType, getChartConfigs, IChartConfig, IChartSetting } from "./type";
import { dashboardItemDefService } from "@eimsnext/services";
import { getAppIconColor, getFormIcon } from "@/utils/common";

const { t } = useLocale();

defineOptions({
  name: "EChartDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  dashItemDef: DashboardItemDef
}>();

const chartConfigs = getChartConfigs()
const chartSetting = reactive<IChartSetting>(JSON.parse(props.dashItemDef.details))
const selectedRole = ref("1");
const formItem = ref<IFormItem>()
const formStore = useFormStore();
const formDef = ref<FormDef>()
const fields = ref<IDataSourceField[]>([]);
const draggingNode = ref<IDataSourceField>();
const showDataSourceDialog = ref(false)

const populateDatasourceFields = () => {
  fields.value = [];
  switch (chartSetting.datasource.type) {
    case DatasourceType.Form:
      formStore.get(chartSetting.datasource.id).then(form => {
        formDef.value = form;
        populateFormFields()
      })
      break;
    default:
      break;
  }
}

const populateFormFields = () => {
  if (formDef.value?.content && formDef.value?.content.items) {
    formDef.value?.content.items.forEach((x: FieldDef) => {
      if (x.type != FieldType.TableForm) {
        let node: IDataSourceField = {
          id: x.field,
          label: x.title,
          isComputed: false
        };

        fields.value.push(node);
      }
      else {
        if (x.columns && x.columns.length > 0) {
          x.columns.forEach((y) => {
            let subNode: IDataSourceField = {
              id: `${x.field}>${y.field}`,
              label: `${x.title}.${y.title}`,
              isComputed: false
            };
            fields.value.push(subNode)
          });
        }
      }
    });
  }
};

const changeDataSource = () => {
  showDataSourceDialog.value = true
};

const handleSourceOk = async (source: IDataSource) => {
  chartSetting.datasource = source;
  showDataSourceDialog.value = false
  populateDatasourceFields()
}

const roleChanged = () => { };

const activeCollItems = ref(["charttype"])
const activeSettingItems = ref(["subcharttype"])
const chartConfig = ref<IChartConfig>()
const dropable = ref<any>({})

const selectChartType = (cc: IChartConfig) => {
  chartConfig.value = cc
  chartSetting.chartType = cc.id
}

const selectChartSubType = (cc: IChartConfig, sub: any) => {
  chartSetting.chartSubType = sub.id
}

const onDimFieldClick = (idx: number, item: any, type: string, ref: any, e?: MouseEvent) => { }

const fieldIsDelete = (item: any) => {
  let notExist = false;
  // if (this.editItem.setting && this.editItem.setting.dataSourceNotExist) {
  //   notExist = true;
  // }
  return notExist || item.IsDelete;
}

const dragStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.originalEvent.srcElement._underlying_vm_;
};

const addComputedField = () => { };
const copyField = (field: IDataSourceField) => { };
const editField = (field: IDataSourceField, index: number) => { };
const removeField = (field: IDataSourceField, index: number) => { };

const onSave = async () => {
  var details = JSON.stringify(chartSetting)

  let req = {
    id: props.dashItemDef.id,
    name: props.dashItemDef.name,
    details: details
  };

  let resp = await dashboardItemDefService.patch<DashboardItemDef>(req.id, req);
  // contextStore.setAppChanged(); //reload 菜单
}

const emit = defineEmits(["update:modelValue", "close"]);
const close = () => {
  emit("update:modelValue", false)
  emit("close");
}

onMounted(() => {
  if (chartSetting.datasource)
    populateDatasourceFields()
})
</script>
<style lang="scss" scoped>
.design-container {
  background: #f4f6f9;
  height: 100%;

  .left-aside {
    border-right: 1px solid #e9e9e9;
    background-color: #fff;

    .left-container {
      font-size: 12px;
      background: #fff;
      padding-bottom: 35px;

      .icon {
        color: #999;
      }

      .data-source {
        padding: 10px 10px 0 20px;
        border-bottom: 1px solid #f3f3f3;

        .data-source-setting {
          display: flex;
          justify-content: space-between;
          box-sizing: border-box;
          font-size: 14px;
          font-weight: 600;
          line-height: 30px;

          .choose-data {
            color: var(--el-color-primary);
            cursor: pointer;
          }
        }

        .data-source-title {
          font-size: 12px;
          overflow: auto;
          padding: 5px 0;
          display: flex;
          align-items: center;

          .data-source-name {
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }

      .fields-container {
        padding: 10px 10px 0 20px;

        .field-title {
          display: flex;
          justify-content: space-between;
          box-sizing: border-box;
          font-size: 14px;
          font-weight: 600;
          line-height: 30px;

          .field-operation {
            float: right;
            cursor: pointer;
            padding-right: 15px;
          }
        }

        .field-wrapper {
          border: 1px solid #edeff5;
          border-radius: 5px;
          padding: 0px 0px 0px 8px;
          line-height: 30px;
          margin: 5px 0;
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          cursor: move;

          .field-name {
            border-radius: 5px;
            line-height: 30px;
            display: flex !important;
            align-items: center;
            justify-content: space-between;

            .name {
              max-width: 110px;
              display: inline-block;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          &:hover {
            border: 1px solid var(--el-color-primary);
            background: var(--el-bg-color);

            .icon {
              color: var(--el-color-primary);
            }

            .name {
              color: var(--el-color-primary);
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
                color: var(--el-color-primary);
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
    padding: 10px;

    .green-line {
      background-color: #e6f8f9 !important;
      border-color: #00b899 !important;
    }

    .center-box {
      flex: 0 0 auto;
      border: 1px dashed #d9d9d9;
      background-color: #fff;
      margin-bottom: 8px;
      display: flex;

      .el-dropdown {
        cursor: pointer;
        margin-right: 8px;
        margin-top: 9px;

        .builder-filter-icon {
          display: flex;
          align-items: center;

          img {
            width: 16px;
            height: 16px;
          }
        }
      }

      .chart-container {

        // display: flex;
        .chart-title {
          font-size: 14px;
          text-align: left;
          padding: 20px 20px 10px 20px;
          position: relative;

          .index-sort {
            position: absolute;
            right: 54px;
            top: 20px;
            padding: 6px;
            box-shadow: 0px 1px 4px rgba(84, 48, 132, 0.1);
            cursor: pointer;

            i {
              font-size: 16px;
              font-weight: 500;
            }
          }
        }

        .index-chart-main {
          width: 100%;
          height: 100%;
          padding: 20px 20px;
          overflow-y: auto;
          overflow-x: auto;
        }
      }

      .title {
        padding: 0 10px;
        line-height: 34px;
        width: 91px;
      }

      .drag-target-container {
        width: calc(100% - 120px);
        overflow: hidden;

        .item {
          cursor: pointer !important;
          margin: 5px 10px 4px 0px;
          border-radius: 20px;
          padding: 4px 25px 4px 2px;
          position: relative;
          height: 25px;

          &:hover {
            .close-icon {
              display: block;
            }

            .close-icon-delete {
              display: block;
            }
          }

          .el-submenu [class^="el-icon-"] {
            vertical-align: text-bottom;
            width: 18px;
          }

          .close-icon {
            position: absolute;
            right: 6px;
            top: 4px;
            display: none;
            cursor: pointer;
            background-color: #fff;
            border-radius: 50%;
            width: 15px;
            height: 15px;
            line-height: 16px;
            text-align: center;

            .vs-icon {
              font-size: 10px;
            }
          }

          .close-icon-delete {
            position: absolute;
            right: 6px;
            top: 4px;
            display: none;
            cursor: pointer;
            background-color: #eb5050;
            border-radius: 50%;
            width: 15px;
            height: 15px;
            line-height: 16px;
            text-align: center;

            .vs-icon {
              font-size: 10px;
              color: #fff;
            }
          }

          .item-text {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 16px;
          }
        }

        .dimension-item {
          background-color: #8095fe;
          color: #fff;

          .vs-icon {
            color: #8095fe;
          }
        }

        .quota-item {
          background-color: #45cb7f;
          color: #fff;
          line-height: 16px;

          .vs-icon {
            color: #45cb7f;
          }
        }

        .display-item {
          color: #fff;
          background-color: var(--el-color-primary);

          .vs-icon {
            color: var(--el-color-primary);
          }

          .el-icon-arrow-down {
            color: #fff;
          }
        }

        .filter-item {
          background-color: var(--el-bg-color);

          .vs-icon {
            color: #fff;
          }
        }

        .filter-item.item {
          display: flex;

          .close-icon {
            background-color: #5e6d82;
          }

          &:hover {
            .close-icon {
              display: block;
            }
          }

          .filter-label {
            color: #5e6d82;
            display: inline-block;
            vertical-align: text-bottom;
            font-size: 14px;

            .label {
              display: inline-block;
            }
          }
        }

        span {
          width: 100%;
          height: 100%;
          display: block;
          min-height: 34px;
          display: flex;
          flex-wrap: wrap;
        }

        .style-red {
          background-color: #fdeeee;
          color: #eb5050 !important;
        }

        .layer-item {
          background-color: var(--el-bg-color);
          color: var(--el-color-primary);
          border: 1px solid var(--el-bg-color);
          cursor: move !important;

          .layer-text {
            position: absolute;
            right: 24px;
            top: 5px;
          }

          .chart-type {
            position: absolute;
            box-sizing: border-box;
            width: 14px;
            text-align: center;
            border: none;
            border-radius: 5px;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            height: 14px;

            .icon {
              width: 14px;
              height: 14px;
              background-repeat: no-repeat;
              background-size: cover;
              box-sizing: border-box;
              display: inline-block;
              opacity: 1; //0.5;
            }

            .line {
              background-image: url("../../../assets/images/charts/Line.svg");
            }

            .linearea {
              background-image: url("../../../assets/images/charts/LineArea.svg");
            }

            .horizontalbar {
              background-image: url("../../../assets/images/charts/HorizontalBar.svg");
            }

            .verticalbar {
              background-image: url("../../../assets/images/charts/VerticalBar.svg");
            }

            .pie {
              background-image: url("../../../assets/images/charts/Pie1.svg");
            }

            .index {
              background-image: url("../../../assets/images/charts/Index.svg");
            }

            .double {
              background-image: url("../../../assets/images/charts/Double.svg");
            }

            .funnel {
              background-image: url("../../../assets/images/charts/Funnel.svg");
            }

            .radar {
              background-image: url("../../../assets/images/charts/Radar.svg");
            }

            .fittext {
              background-image: url("../../../assets/images/charts/FitText.svg");
            }

            .gauge {
              background-image: url("../../../assets/images/charts/gauge.svg");
            }

            .map {
              background-image: url("../../../assets/images/charts/map.svg");
            }

            .scatter {
              background-image: url("../../../assets/images/charts/scatter.svg");
            }

            .bubble {
              background-image: url("../../../assets/images/charts/bubble.svg");
            }

            .detailtable {
              background-image: url("../../../assets/images/charts/detailtable.svg");
            }

            .treemap {
              background-image: url("../../../assets/images/charts/treemap.svg");
            }

            .wordcloud {
              background-image: url("../../../assets/images/charts/wordcloud.svg");
            }

            .heatmap {
              background-image: url("../../../assets/images/charts/heatmap.svg");
            }
          }
        }

        .layer-chevron-right {
          padding: 9px 4px 0px 0px;
          margin-left: -5px;

          .vs-icon {
            font-size: 16px;
            color: #ccc;
          }
        }

        .active {
          background: var(--el-color-primary);
          color: #fff;

          .icon {
            filter: brightness(100);
          }
        }

        .add-layer-item {
          cursor: pointer !important;
          margin: 5px;
          border-radius: 5px;
          padding: 4px;
          position: relative;
          height: 25px;

          &:hover {
            background-color: var(--el-bg-color);
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
      background-color: #fff;
      position: relative;
      flex: 1 1 auto;
      overflow: hidden;
    }
  }

  .echarts-config {
    border-left: 1px solid #e9e9e9;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 10px;
    background: #fff;

    .config-box {
      padding-bottom: 11px;

      .box-head {
        font-size: 13px;
        line-height: 28px;
        padding: 0 5px 0 0;
        font-weight: 700;
        cursor: pointer;
        margin-top: 10px;

        .fa {
          font-size: 18px;
          width: 14px;
          text-align: center;
        }
      }

      .chart-type-body {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;

        .chart-type {
          margin: 8px;
          cursor: pointer;
          box-sizing: border-box;
          width: 34px;
          padding: 5px 0 3px 0;
          text-align: center;
          border: none;
          border-radius: 5px;

          .icon {
            width: 24px;
            height: 24px;
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
          background-color: var(--el-color-primary);

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
    }
  }
}
</style>
