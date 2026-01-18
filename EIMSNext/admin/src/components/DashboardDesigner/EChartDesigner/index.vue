<template>
  <el-container class="design-container">
    <el-aside width="250px" class="left-aside">
      <div class="left-container">
        <div class="data-source">
          <div class="data-source-setting">
            <span>数据源</span>
            <div class="choose-data" @click="changeDataSource">更改数据源</div>
          </div>
          <div class="data-source-name">
            <et-icon icon="el-icon-document"></et-icon>
            <span>{{ dataSource?.label }}</span>
          </div>
        </div>
        <div class="data-source" v-if="dataSource.type == DataSourceType.Form">
          <div class="data-source-setting">
            <span>数据获取权限</span>
            <!-- <div class="choose-data" v-if="selectedRole === 2">
              <a :href="getFormRoleLink(queryId)" target="_blank">{{ $t("FormRoleConfig") }}</a>
            </div> -->
          </div>
          <div class="data-source-name">
            <el-select size="small" v-model="selectedRole" @change="roleChanged">
              <el-option :label="t('表单中的全部数据')" value="1"></el-option>
              <el-option :label="t('继承成员对表单的权限')" value="2"></el-option>
            </el-select>
          </div>
        </div>
        <div class="fields-container">
          <div class="field-title">
            <span>字段</span>
            <!-- <div class="field-operation">
              <div @click="addComputedField" v-if="dataSourceType == DataSourceType.Form">
                <et-icon icon="el-icon-plus"></et-icon>
              </div>
            </div> -->
          </div>
          <div style="overflow-y: auto">
            <Draggable :list="fields" :sort="false" ghost-class="ghost" @start="dragStart"
              :group="{ name: 'fields', pull: 'clone', put: false }" item-key="id">
              <template #item="{ element, index }">
                <div class="field-wrapper" :title="element.title">
                  <div class="field-name">
                    <et-icon icon="el-icon-copyDocument" class="mr-[8px]"></et-icon>
                    <span class="name">{{ element.title }}</span>
                  </div>
                  <!-- <div v-if="element.isComputed" class="tool-icons">
                    <span @click="copyField(element)">
                      <et-icon icon="el-icon-copyDocument" class="icon"></et-icon>
                    </span>
                    <span @click="editField(element, index)">
                      <et-icon icon="el-icon-edit" class="icon"></et-icon>
                    </span>
                    <span @click="removeField(element, index)">
                      <et-icon icon="el-icon-delete" class="icon"></et-icon>
                    </span>
                  </div> -->
                </div>
              </template>
            </Draggable>
          </div>
        </div>
      </div>
    </el-aside>
    <el-main style="min-width: 460px"></el-main>
    <el-aside width="300px"></el-aside>
    <DataSourceDialog v-model="showDataSourceDialog" :appId="appId" :dataSource="dataSource"></DataSourceDialog>
  </el-container>
</template>
<script setup lang="ts">
import Draggable from "vuedraggable";
import { DataSourceType, IDataSource, IDataSourceField } from "../type";
import { FieldDef, FieldType, FormDef } from "@eimsnext/models";
import { IFormItem } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";
import DataSourceDialog from "../components/DataSourceDialog.vue";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "EChartDesigner",
});

const props = defineProps<{
  appId: string;
  dataSource: IDataSource,
  layout?: string
}>();

const selectedRole = ref("1");
const dataSource = toRef(props.dataSource);
const formItem = ref<IFormItem>()
const formStore = useFormStore();
const formDef = ref<FormDef>()
const fields = ref<IDataSourceField[]>([]);
const draggingNode = ref<IDataSourceField>();
const showDataSourceDialog = ref(false)

const populateFormFields = () => {
  fields.value = [];

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

const chartType = ref(0);

const changeDataSource = () => {
  // if (dataSourceType == DataSourceType.Form) {

  // }
};
const roleChanged = () => { };

const dragStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.originalEvent.srcElement._underlying_vm_;
};
const addComputedField = () => { };
const copyField = (field: IDataSourceField) => { };
const editField = (field: IDataSourceField, index: number) => { };
const removeField = (field: IDataSourceField, index: number) => { };
</script>
<style lang="scss" scoped>
.design-container {
  background: #f4f6f9;

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
        padding: 12px 12px 0 15px;
        border-bottom: 1px solid #f3f3f3;

        .data-source-setting {
          display: flex;
          justify-content: space-between;
          box-sizing: border-box;
          margin-top: 5px;
          font-size: 14px;
          line-height: 21px;

          .choose-data {
            color: var(--el-color-primary);
            cursor: pointer;
          }
        }

        .data-source-name {
          margin: 15px 0 15px 0;
          line-height: 18px;

          .icon {
            vertical-align: text-bottom;
          }

          .el-select {
            width: 100%;
          }

          .icon-red {
            vertical-align: text-bottom;
            color: #eb5050 !important;
          }

          .style-red {
            color: #eb5050 !important;
          }
        }
      }

      .fields-container {
        padding: 18px 0 0 10px;

        .field-title {
          font-size: 14px;
          margin-left: 5px;
          line-height: 21px;

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
          margin: 4px 0;
          width: 225px;
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          cursor: move;

          .field-name {
            display: inline-flex;
            align-items: center;

            .icon {
              font-size: 13px;
            }

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

              .icon {
                padding: 8px 5px;
              }
            }
          }
        }
      }
    }
  }

  .center-echarts {
    padding: 0 8px;

    .green-line {
      background-color: #e6f8f9 !important;
      border-color: #00b899 !important;
    }

    .center-box {
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
      position: relative;
    }
  }

  .echarts-config {
    border-left: 1px solid #e9e9e9;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 10px;
    background: #fff;

    .vs-tabs--content {
      padding: 10px 0;
    }

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

        .disabled {
          cursor: not-allowed;
          //background-color: #fff;
          //border: 3px solid #fff;

          //.icon-border {
          //  border: 3px solid #fff;
          //}

          .icon {
            opacity: 0.5;
          }

          //&:hover {
          //  border: 3px solid #fff;
          //  background-color: #fff;
          //
          //  .icon-border {
          //    border: 3px solid #fff;
          //
          //    .icon {
          //      border: 3px solid #fff;
          //    }
          //  }
          //}
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
  }
}
</style>
