<template>
  <div class="form-list-view-renderer">
    <el-table
      v-if="view.pcType === FormListViewType.Table"
      ref="tableRef"
      :data="flattedData"
      :span-method="spanMethod"
      class="data-table-full"
      show-overflow-tooltip
      :tooltip-formatter="tableToolFormatter"
      :row-class-name="() => 'pointer'"
      :fit="true"
      @selection-change="$emit('selection-change', $event)"
      @row-click="onRowClick"
    >
      <el-table-column type="selection" width="40" :selectable="selectable" />
      <template v-for="col in columns" :key="col.field">
        <template v-if="col.children">
          <el-table-column :label="col.title" :fieldSetting="col" show-overflow-tooltip :resizable="true">
            <el-table-column
              v-for="sub in col.children"
              :key="sub.field"
              :prop="sub.field"
              :formatter="tableFormatter"
              :label="sub.title"
              :width="sub.width"
              :resizable="true"
              :dangerouslyUseHTMLString="true"
            />
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column :prop="col.field" :label="col.title" :width="col.width" show-overflow-tooltip :resizable="true">
            <template #default="scope">
              <div v-html="formatTableHtml(scope.row, col.field)"></div>
            </template>
          </el-table-column>
        </template>
      </template>
    </el-table>

    <div v-else-if="view.pcType === FormListViewType.Kanban" class="kanban-view">
      <div v-for="group in kanbanGroups" :key="group.key" class="kanban-column">
        <div class="kanban-title">
          <span>{{ group.label }}</span>
          <span>{{ group.items.length }}</span>
        </div>
        <div class="kanban-cards">
          <FormListViewCard
            v-for="row in group.items"
            :key="row.id"
            :title="getCardTitle(row)"
            :image-url="getCoverUrl(row)"
            :cover-field="cardSettings.coverField"
            :fields="displayFieldsForCards"
            :image-position="cardSettings.imagePosition"
            :image-fit="cardSettings.imageFit"
            :size="cardSettings.cardSize"
            :show-field-title="cardSettings.showFieldTitle"
            :format-field="(field) => formatCardValue(row, field)"
            @click="$emit('row-click', row)"
          />
        </div>
      </div>
    </div>

    <div v-else class="gallery-view">
      <FormListViewCard
        v-for="row in normalizedRows"
        :key="row.id"
        :title="getCardTitle(row)"
        :image-url="getCoverUrl(row)"
        :cover-field="cardSettings.coverField"
        :fields="displayFieldsForCards"
        :image-position="cardSettings.imagePosition"
        :image-fit="cardSettings.imageFit"
        :size="cardSettings.cardSize"
        :show-field-title="cardSettings.showFieldTitle"
        :format-field="(field) => formatCardValue(row, field)"
        @click="$emit('row-click', row)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { FormData, FormDef, FormListView, FormListViewField, FormListViewSettings, FormListViewType, FlowStatus, SystemField } from "@eimsnext/models";
import type { TableInstance, TableTooltipData } from "element-plus";
import { flowStatusArray } from "@eimsnext/components";
import { useI18n } from "vue-i18n";
import { ITableColumn } from "../type";
import { extractImageUrl, flattenDataItem, formatFormValue, findFieldDef } from "../listViewUtils";
import FormListViewCard from "./FormListViewCard.vue";

const props = defineProps<{
  formDef: FormDef;
  view: FormListView;
  settings: FormListViewSettings;
  rows: FormData[];
  columns: ITableColumn[];
  flattedData: any[];
  spanMethod: (data: { row: any; column: any; rowIndex: number; columnIndex: number }) => any;
  selectable: (row: any, index: number) => boolean;
  displayFields: FormListViewField[];
}>();

const emit = defineEmits(["selection-change", "row-click"]);
const { t } = useI18n();
const tableRef = ref<TableInstance>();

const normalizedRows = computed(() => props.rows.map(flattenDataItem));

const cardSettings = computed(() => {
  const value = props.view.pcType === FormListViewType.Kanban ? props.settings.kanban : props.settings.gallery;
  return {
    titleField: value?.titleField || SystemField.DataTitle,
    coverField: value?.coverField,
    imagePosition: value?.imagePosition || "top",
    imageFit: value?.imageFit || "cover",
    cardSize: value?.cardSize || "medium",
    showFieldTitle: value?.showFieldTitle ?? true,
    groupField: props.settings.kanban?.groupField,
  };
});

const displayFieldsForCards = computed(() => props.displayFields.length > 0 ? props.displayFields : []);

const getFlowStatusName = (status: FlowStatus) => {
  const st = flowStatusArray().find((x) => x.id == status);
  return st ? t(st.i18n) : "";
};

const getColumnSetting = (field: string): any => {
  const findSub = (children: ITableColumn[], target: string): any => {
    for (const item of children) {
      if (item.field === target) return item;
      if (item.children?.length) {
        const sub = findSub(item.children, target);
        if (sub) return sub;
      }
    }
    return undefined;
  };

  return findSub(props.columns, field);
};

const formatCell = (row: any, field: string, value?: any) => {
  if (field === SystemField.FlowStatus) return getFlowStatusName(value ?? row[field]);
  const col = getColumnSetting(field);
  const fieldDef = col || findFieldDef(props.formDef, field, t);
  return formatFormValue(value ?? row[field], fieldDef, getFlowStatusName);
};

const formatTableHtml = (row: any, field: string) => {
  const col = getColumnSetting(field);
  if (col?.type === "imageupload") {
    const value = row[field];
    const list = Array.isArray(value) ? value : [value];
    return list
      .map((item) => extractImageUrl(item))
      .filter(Boolean)
      .map((url) => `<img src="${url}" class="table-image-thumb table-image-thumb-spaced" />`)
      .join("");
  }

  return formatCell(row, field);
};

const tableFormatter = (row: any, column: any, cellValue: any) => formatCell(row, column.property, cellValue);
const tableToolFormatter = (data: TableTooltipData<FormData>) => formatCell(data.row, data.column.property, data.cellValue);

const onRowClick = (row: FormData, column: any) => {
  if (column.type === "selection" && props.selectable(row, 0)) {
    tableRef.value?.toggleRowSelection(row);
    return;
  }
  emit("row-click", row);
};

const formatCardValue = (row: any, field: string) => {
  const fieldDef = findFieldDef(props.formDef, field, t);
  return formatFormValue(row[field], fieldDef, getFlowStatusName);
};

const getCardTitle = (row: any) => formatCardValue(row, cardSettings.value.titleField || SystemField.DataTitle) || row[SystemField.DataTitle] || "-";
const getCoverUrl = (row: any) => cardSettings.value.coverField ? extractImageUrl(row[cardSettings.value.coverField]) : "";

const kanbanGroups = computed(() => {
  const groupField = cardSettings.value.groupField;
  const groups = new Map<string, { key: string; label: string; items: any[] }>();
  normalizedRows.value.forEach((row) => {
    const label = groupField ? formatCardValue(row, groupField) || t("admin.formListView.ungrouped") : t("admin.formListView.ungrouped");
    if (!groups.has(label)) groups.set(label, { key: label, label, items: [] });
    groups.get(label)!.items.push(row);
  });
  return Array.from(groups.values());
});
</script>

<style lang="scss" scoped>
.form-list-view-renderer {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.data-table-full {
  width: 100%;
  height: 100%;
}

.kanban-view {
  display: flex;
  height: 100%;
  gap: var(--et-space-16);
  overflow-x: auto;
  padding: var(--et-space-12);
  background: var(--et-bg-page);
}

.kanban-column {
  flex: 0 0 280px;
  min-width: 0;
  border-radius: var(--et-radius-6);
  background: var(--et-bg-muted);
  padding: var(--et-space-12);
}

.kanban-title {
  display: flex;
  justify-content: space-between;
  color: var(--et-text-primary);
  font-weight: 600;
  margin-bottom: var(--et-space-12);
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
}

.gallery-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--et-space-16);
  height: 100%;
  overflow: auto;
  padding: var(--et-space-16);
  background: var(--et-bg-page);
}
</style>
