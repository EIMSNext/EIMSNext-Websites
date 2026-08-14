<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="dashItemDefRef.name" class="title-editor" />
    </template>
    <template #top-right>
      <el-button @click="onSave">{{ t("common.save") }}</el-button>
    </template>

    <el-container class="design-container">
      <el-aside width="250px" class="left-aside">
        <div class="left-container">
          <div class="data-source">
            <div class="data-source-setting">
              <span>{{ t("admin.dashboardDetailTableDesigner.dataSource") }}</span>
              <div class="choose-data" @click="changeDataSource">{{ t("admin.dashboardDetailTableDesigner.changeDataSource") }}</div>
            </div>
            <div class="data-source-title" v-if="detailSetting.datasource?.id">
              <et-icon size="16px" :icon="getFormIcon()" :color="getAppIconColor()"></et-icon>
              <span class="data-source-name">{{ detailSetting.datasource.label }}</span>
            </div>
          </div>

          <div class="fields-container">
            <div class="field-title">
              <span>{{ t("admin.dashboardDetailTableDesigner.fields") }}</span>
            </div>
            <div class="field-list">
              <Draggable
                :list="fields"
                :sort="false"
                ghost-class="ghost"
                :clone="cloneDragField"
                :group="{ name: 'detail-table-fields', pull: 'clone', put: false }"
                item-key="field"
              >
                <template #item="{ element }">
                  <div class="field-wrapper" :title="element.label">
                    <div class="field-name">
                      <et-icon size="16px" icon="el-copyDocument" class="mr-[8px]"></et-icon>
                      <span class="name">{{ element.label }}</span>
                    </div>
                  </div>
                </template>
              </Draggable>
            </div>
          </div>
        </div>
      </el-aside>

      <el-main class="center-main">
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
            :model-value="detailSetting.sort"
            :sort-fields="sortFields as any"
            @ok="setSort"
            @cancel="showSort = false"
          />
        </el-popover>

        <div class="center-box">
          <div class="title">{{ t("common.displayFields") }}</div>
          <div class="drag-target-container">
            <Draggable
              class="display-fields"
              :list="detailSetting.displayFields"
              item-key="field"
              :group="{ name: 'detail-table-fields', pull: false, put: true }"
              @add="normalizeDisplayFields"
              @change="normalizeDisplayFields"
            >
              <template #item="{ element }">
                <div class="display-field-item">
                  <span class="label">{{ element.label }}</span>
                  <span class="remove-btn" @click.stop="removeDisplayField(element)">
                    <et-icon icon="el-close" />
                  </span>
                </div>
              </template>
            </Draggable>
          </div>
        </div>

        <div class="center-box">
          <div class="title">{{ t("admin.dashboardChartDesigner.filter") }}</div>
          <div class="drag-target-container">
            <div class="toolbar-item">
              <FilterField
                v-if="detailSetting.datasource?.id"
                :form-id="detailSetting.datasource.id"
                :filter="detailSetting.filter"
                @ok="onFilter"
              />
            </div>
          </div>
        </div>

        <div class="center-box">
          <div class="title">{{ t("common.sort") }}</div>
          <div class="drag-target-container sort-box">
            <div class="sort-summary">{{ sortSummary }}</div>
            <div ref="sortRef" class="sort-trigger">
              <el-button link type="primary" @click="showSort = true">
                {{ t("common.sort") }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="preview-box">
          <DetailTableViewer
            :setting="detailSetting"
            :title="dashItemDefRef.name"
            :item-def="dashItemDefRef"
            :designer-mode="true"
            :show-header="false"
          />
        </div>
      </el-main>

      <el-aside width="300px" class="config-aside">
        <div class="config-box">
          <el-collapse v-model="activeItems" expand-icon-position="left">
            <el-collapse-item name="perm" :title="t('admin.dashboardDetailTableDesigner.operationPerm')" class="box-head">
              <div class="config-item">
                <el-checkbox v-model="detailSetting.inheritDataActionPerms">
                  {{ t("admin.dashboardDetailTableDesigner.inheritDataActionPerms") }}
                </el-checkbox>
                <el-tooltip effect="light" placement="top">
                  <template #content>
                    <div class="tooltip-content">
                      {{ t("admin.dashboardDetailTableDesigner.inheritDataActionPermsTip") }}
                    </div>
                  </template>
                  <et-icon icon="el-warning" color="var(--et-color-warning)" />
                </el-tooltip>
              </div>
            </el-collapse-item>

            <el-collapse-item name="display" :title="t('admin.dashboardChartDesigner.dataDisplay')" class="box-head">
              <div class="config-item">
                <el-checkbox v-model="detailSetting.showIndex">{{ t("admin.dashboardDetailTableDesigner.showIndex") }}</el-checkbox>
              </div>
              <div class="config-item row-item">
                <el-checkbox v-model="detailSetting.showTop">{{ t("admin.dashboardChartDesigner.showTop") }}</el-checkbox>
                <el-input-number
                  v-model="detailSetting.take"
                  :min="1"
                  :disabled="!detailSetting.showTop"
                  size="small"
                  controls-position="right"
                />
                <span>{{ t("admin.dashboardChartDesigner.records") }}</span>
              </div>
              <div class="config-item row-item">
                <span>{{ t("admin.dashboardDetailTableDesigner.pageSize") }}</span>
                <el-input-number
                  v-model="detailSetting.pageSize"
                  :min="1"
                  size="small"
                  controls-position="right"
                />
              </div>
            </el-collapse-item>

            <el-collapse-item name="fixed" :title="t('admin.dashboardDetailTableDesigner.columnFreeze')" class="box-head">
              <div class="config-item row-item">
                <span>{{ t("common.device.desktop") }}</span>
                <el-input-number
                  v-model="detailSetting.fixedLeftColumns"
                  :min="0"
                  size="small"
                  controls-position="right"
                />
              </div>
              <div class="config-item row-item">
                <span>{{ t("common.device.mobile") }}</span>
                <el-input-number
                  v-model="detailSetting.fixedMobileColumns"
                  :min="0"
                  size="small"
                  controls-position="right"
                />
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-aside>
    </el-container>

    <DataSourceDialog
      v-model="showDataSourceDialog"
      :appId="dashItemDefRef.appId"
      :dataSource="detailSetting.datasource"
      @ok="handleSourceOk"
    />
  </EtDrawer>
</template>

<script setup lang="ts">
import Draggable from "vuedraggable";
import { buildFieldListItems, buildSortFieldListItems, EtDrawer, IConditionList, IFieldSortList, IFormFieldDef } from "@eimsnext/components";
import { DashboardItemDef } from "@eimsnext/models";
import { dashboardItemDefService } from "@eimsnext/services";
import { useFormStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";
import { getAppIconColor, getFormIcon } from "@/utils/common";
import DataSourceDialog from "../components/DataSourceDialog.vue";
import FilterField from "../components/FieldBar/FilterField.vue";
import DashSort from "../components/DashSort.vue";
import DetailTableViewer from "./DetailTableViewer.vue";
import {
  createDefaultDetailTableSetting,
  createEmptyDetailFilter,
  IDetailTableSetting,
  parseDetailTableSetting,
} from "./type";
import { IDataSource } from "../type";

const { t } = useI18n();

defineOptions({
  name: "DetailTableDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  dashItemDef: DashboardItemDef;
}>();

const formStore = useFormStore();
const dashItemDefRef = ref<DashboardItemDef>({ ...props.dashItemDef });
const detailSetting = reactive<IDetailTableSetting>(
  parseDetailTableSetting(props.dashItemDef.details) || createDefaultDetailTableSetting({ id: "", type: 0 as any, label: "" }),
);
const fields = ref<IFormFieldDef[]>([]);
const sortFields = ref<IFormFieldDef[]>([]);
const showDataSourceDialog = ref(false);
const showSort = ref(false);
const sortRef = ref();
const activeItems = ref(["perm", "display", "fixed"]);

const sortSummary = computed(() => {
  if (!detailSetting.sort?.items?.length) {
    return t("common.notset");
  }

  return detailSetting.sort.items
    .map((item) => `${item.field.label}`)
    .join(" / ");
});

const populateFields = async () => {
  if (!detailSetting.datasource?.id) {
    fields.value = [];
    sortFields.value = [];
    return;
  }

  const form = await formStore.get(detailSetting.datasource.id);
  if (!form) {
    fields.value = [];
    sortFields.value = [];
    return;
  }

  fields.value = buildFieldListItems(form.id, form.content?.items || [], !!form.usingWorkflow, undefined, { t } as any)
    .map((item) => item.data as IFormFieldDef)
    .filter(Boolean);
  sortFields.value = buildSortFieldListItems(form.id, form.content?.items || [], !!form.usingWorkflow, undefined, { t } as any)
    .map((item) => item.data as IFormFieldDef)
    .filter(Boolean);
};

const cloneDragField = (field: IFormFieldDef) => ({ ...field });

const normalizeDisplayFields = () => {
  const deduped: IFormFieldDef[] = [];
  const fieldSet = new Set<string>();
  detailSetting.displayFields.forEach((field) => {
    if (fieldSet.has(field.field)) {
      return;
    }
    fieldSet.add(field.field);
    deduped.push(field);
  });
  detailSetting.displayFields = deduped;
};

const removeDisplayField = (field: IFormFieldDef) => {
  detailSetting.displayFields = detailSetting.displayFields.filter((item) => item.field !== field.field);
};

const changeDataSource = () => {
  showDataSourceDialog.value = true;
};

const handleSourceOk = async (source: IDataSource) => {
  detailSetting.datasource = source;
  detailSetting.displayFields = [];
  detailSetting.filter = createEmptyDetailFilter();
  detailSetting.sort = { items: [] };
  showDataSourceDialog.value = false;
  await populateFields();
};

const onFilter = (filter: IConditionList) => {
  detailSetting.filter = filter;
};

const setSort = (sort: IFieldSortList) => {
  detailSetting.sort = sort;
  showSort.value = false;
};

const onSave = async () => {
  await dashboardItemDefService.patch<DashboardItemDef>(props.dashItemDef.id, {
    id: props.dashItemDef.id,
    name: dashItemDefRef.value.name,
    details: JSON.stringify(detailSetting),
  });
};

const emit = defineEmits(["update:modelValue", "close"]);
const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

watch(
  () => props.dashItemDef,
  async (value) => {
    dashItemDefRef.value = { ...value };
    const parsed = parseDetailTableSetting(value.details);
    const nextSetting = parsed || createDefaultDetailTableSetting({ id: "", type: 0 as any, label: "" });
    detailSetting.datasource = nextSetting.datasource;
    detailSetting.displayFields = nextSetting.displayFields;
    detailSetting.filter = nextSetting.filter;
    detailSetting.sort = nextSetting.sort;
    detailSetting.pageSize = nextSetting.pageSize;
    detailSetting.showIndex = nextSetting.showIndex;
    detailSetting.showTop = nextSetting.showTop;
    detailSetting.take = nextSetting.take;
    detailSetting.fixedLeftColumns = nextSetting.fixedLeftColumns;
    detailSetting.fixedMobileColumns = nextSetting.fixedMobileColumns;
    detailSetting.inheritDataActionPerms = nextSetting.inheritDataActionPerms;
    await populateFields();
  },
  { immediate: true, deep: true },
);
</script>

<style scoped lang="scss">
.design-container {
  background: var(--et-bg-page);
  height: 100%;
}

.left-aside {
  border-right: 1px solid var(--et-border-color-light);
  background-color: var(--et-bg-container);
}

.left-container {
  font-size: var(--et-font-size-12);
  background: var(--et-bg-container);
  padding-bottom: var(--et-size-35);
}

.data-source {
  padding: var(--et-space-10) var(--et-space-10) 0 var(--et-space-20);
  border-bottom: 1px solid var(--et-border-color-light);
}

.data-source-setting,
.field-title {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  font-size: var(--et-font-size-14);
  font-weight: 600;
  line-height: var(--et-line-height-30);
}

.choose-data {
  color: var(--et-color-primary);
  cursor: pointer;
}

.data-source-title {
  font-size: var(--et-font-size-12);
  overflow: auto;
  padding: var(--et-space-5) 0;
  display: flex;
  align-items: center;
}

.data-source-name {
  margin-left: var(--et-space-10);
}

.fields-container {
  padding: var(--et-space-10) var(--et-space-10) 0 var(--et-space-20);
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

  &:hover {
    border-color: var(--et-color-primary);
    background: var(--et-bg-hover);
  }
}

.field-name {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.name {
  max-width: var(--et-size-140);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.center-main {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
  padding: var(--et-space-10);
  min-width: var(--et-size-460);
}

.center-box {
  border: 1px dashed var(--et-border-color);
  background-color: var(--et-bg-container);
  display: flex;
}

.title {
  padding: 0 var(--et-space-10);
  line-height: var(--et-line-height-34);
  width: var(--et-size-91);
  flex-shrink: 0;
}

.drag-target-container {
  flex: 1;
  min-height: var(--et-size-40);
  display: flex;
  align-items: center;
  padding: var(--et-space-4) var(--et-space-8);
}

.display-fields {
  display: flex;
  flex-wrap: wrap;
  gap: var(--et-space-8);
  min-height: var(--et-size-30);
  width: 100%;
}

.display-field-item {
  display: inline-flex;
  align-items: center;
  gap: var(--et-space-6);
  padding: 0 var(--et-space-10);
  height: var(--et-size-28);
  border-radius: var(--et-radius-20);
  background: var(--et-color-primary);
  color: var(--et-text-on-primary);
}

.display-field-item .label {
  max-width: var(--et-size-180);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toolbar-item {
  display: flex;
  align-items: center;
}

.sort-box {
  justify-content: space-between;
}

.sort-summary {
  color: var(--et-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-trigger {
  flex-shrink: 0;
}

.preview-box {
  flex: 1 1 auto;
  min-height: var(--et-size-240);
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
  overflow: hidden;
}

.config-aside {
  border-left: 1px solid var(--et-border-color-light);
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 var(--et-space-10);
  background: var(--et-bg-container);
}

.config-box {
  padding-bottom: var(--et-space-11);
}

.box-head {
  margin-top: var(--et-space-10);
}

.config-item {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  margin-bottom: var(--et-space-12);
}

.row-item {
  justify-content: space-between;
}

.tooltip-content {
  max-width: 260px;
  line-height: 1.6;
}

:deep(.el-collapse-item__header) {
  line-height: var(--et-line-height-32);
  height: var(--et-size-32);
  min-height: var(--et-size-32);
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}
</style>
