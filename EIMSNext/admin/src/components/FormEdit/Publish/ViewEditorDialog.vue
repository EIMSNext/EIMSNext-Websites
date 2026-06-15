<template>
  <et-dialog
    :model-value="modelValue"
    :title="t('common.view')"
    width="96vw"
    top="3vh"
    class="view-editor-dialog"
    destroy-on-close
    @ok="save"
    @cancel="cancel"
  >
    <div class="view-editor">
      <div class="preview-panel">
        <div v-if="draft.pcType === FormListViewType.Table" class="table-preview">
          <table>
            <thead>
              <tr>
                <th v-for="field in previewFields" :key="field.field">{{ field.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in previewRows" :key="row.id">
                <td v-for="field in previewFields" :key="field.field">{{ row[field.field] || "" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="draft.pcType === FormListViewType.Kanban" class="kanban-preview">
          <div v-for="group in previewGroups" :key="group" class="preview-column">
            <div class="preview-column-title">{{ group }} <span>1</span></div>
            <FormListViewCard
              :title="previewRows[0]?.[titleField] || draft.name"
              :image-url="sampleImage"
              :cover-field="cardSettings.coverField"
              :fields="cardDisplayFields"
              :image-position="cardSettings.imagePosition"
              :image-fit="cardSettings.imageFit"
              :size="cardSettings.cardSize"
              :show-field-title="cardSettings.showFieldTitle"
              :format-field="(field) => previewRows[0]?.[field] || '--'"
            />
          </div>
        </div>
        <div v-else class="gallery-preview">
          <FormListViewCard
            v-for="row in previewRows"
            :key="row.id"
            :title="row[titleField] || draft.name"
            :image-url="sampleImage"
            :cover-field="cardSettings.coverField"
            :fields="cardDisplayFields"
            :image-position="cardSettings.imagePosition"
            :image-fit="cardSettings.imageFit"
            :size="cardSettings.cardSize"
            :show-field-title="cardSettings.showFieldTitle"
            :format-field="(field) => row[field] || '--'"
          />
        </div>
      </div>
      <div class="settings-panel">
        <el-form label-position="top">
          <el-form-item :label="t('common.name')">
            <el-input v-model="draft.name" />
          </el-form-item>
          <el-collapse model-value="style">
            <el-collapse-item :title="t('admin.formListView.defaultStyle')" name="style">
              <div class="device-switch">
                <button type="button" class="active">{{ t("common.device.desktop") }}</button>
                <button type="button">{{ t("common.device.mobile") }}</button>
              </div>
              <div class="section-label">{{ t("common.type") }}</div>
              <div class="type-grid">
                <button
                  v-for="item in pcTypes"
                  :key="item.value"
                  type="button"
                  class="type-option"
                  :class="{ active: draft.pcType === item.value }"
                  @click="setPcType(item.value)"
                >
                  <span class="type-icon" :class="item.icon"></span>
                  <span>{{ item.label }}</span>
                </button>
              </div>

              <template v-if="draft.pcType === FormListViewType.Table">
                <el-form-item :label="t('common.displayFields')">
                  <el-select v-model="tableFieldIds" multiple collapse-tags collapse-tags-tooltip :placeholder="t('common.allFields')" @change="syncTableFields">
                    <el-option v-for="field in allFields" :key="field.field" :label="field.label" :value="field.field" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="t('admin.formListView.rowHeight')">
                  <el-segmented v-model="settings.table!.rowHeight" :options="rowHeightOptions" />
                </el-form-item>
              </template>

              <template v-else>
                <el-form-item v-if="draft.pcType === FormListViewType.Kanban" :label="t('admin.formListView.groupField')">
                  <el-select v-model="settings.kanban!.groupField" :placeholder="t('common.selectField')">
                    <el-option v-for="field in groupFields" :key="field.field" :label="field.label" :value="field.field" />
                  </el-select>
                </el-form-item>
                <el-checkbox v-model="cardSettings.showFieldTitle">{{ t("admin.formListView.showFieldTitle") }}</el-checkbox>
                <el-form-item :label="t('common.displayFields')">
                  <el-select v-model="cardFieldIds" multiple collapse-tags collapse-tags-tooltip :placeholder="t('common.selectField')" @change="syncCardFields">
                    <el-option v-for="field in allFields" :key="field.field" :label="field.label" :value="field.field" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="t('admin.formListView.coverImage')">
                  <el-select v-model="cardSettings.coverField" clearable :placeholder="t('common.selectField')">
                    <el-option v-for="field in imageFields" :key="field.field" :label="field.label" :value="field.field" />
                  </el-select>
                </el-form-item>
                <div class="inline-controls">
                  <el-form-item :label="t('admin.formListView.imagePosition')">
                    <el-select v-model="cardSettings.imagePosition">
                      <el-option :label="t('common.position.top')" value="top" />
                      <el-option :label="t('common.position.left')" value="left" />
                      <el-option :label="t('common.position.right')" value="right" />
                    </el-select>
                  </el-form-item>
                  <el-form-item :label="t('admin.formListView.imageFit')">
                    <el-select v-model="cardSettings.imageFit">
                      <el-option :label="t('common.imageFit.cover')" value="cover" />
                      <el-option :label="t('common.imageFit.contain')" value="contain" />
                      <el-option :label="t('common.shape.circle')" value="circle" />
                      <el-option :label="t('common.shape.rectangle')" value="rectangle" />
                    </el-select>
                  </el-form-item>
                </div>
                <el-form-item :label="t('admin.formListView.cardSize')">
                  <el-segmented v-model="cardSettings.cardSize" :options="cardSizeOptions" />
                </el-form-item>
              </template>
            </el-collapse-item>
            <el-collapse-item :title="t('admin.formListView.defaultSort')" name="sort">
              <DataSort :model-value="defaultSort" :form-id="formDef.id" @ok="setDefaultSort" @cancel="noop" />
            </el-collapse-item>
            <el-collapse-item :title="t('admin.formListView.defaultFilter')" name="filter">
              <DataFilter :model-value="defaultFilter" :form-id="formDef.id" @ok="setDefaultFilter" @cancel="noop" />
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </div>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  FieldType,
  FormDef,
  FormListView,
  FormListViewRequest,
  FormListViewSettings,
  FormListViewType,
  MobileFormListViewType,
} from "@eimsnext/models";
import { IConditionList, IFieldSortList, IFormFieldDef } from "@eimsnext/components";
import { uniqueId } from "@eimsnext/utils";
import DataFilter from "@/views/form/components/DataFilter.vue";
import DataSort from "@/views/form/components/DataSort.vue";
import FormListViewCard from "@/views/form/components/FormListViewCard.vue";
import {
  buildAllViewFields,
  createDefaultSort,
  createEmptyCondition,
  parseCondition,
  parseSort,
  parseViewSettings,
  toViewFields,
} from "@/views/form/listViewUtils";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: boolean;
  formDef: FormDef;
  view?: FormListView;
  sortIndex: number;
}>();

const emit = defineEmits(["update:modelValue", "ok", "cancel"]);
const { t } = useI18n();

const draft = reactive<FormListViewRequest>({
  id: "",
  appId: props.formDef.appId,
  formId: props.formDef.id,
  name: t("admin.formListView.unnamedView"),
  pcType: FormListViewType.Table,
  mobileType: MobileFormListViewType.Table,
  sortIndex: props.sortIndex,
  authGroupIds: [],
  settings: "",
  disabled: false,
});

const settings = reactive<FormListViewSettings>({
  table: { displayFields: [], rowHeight: "auto" },
  kanban: { displayFields: [], imagePosition: "top", imageFit: "cover", cardSize: "medium", showFieldTitle: true },
  gallery: { displayFields: [], imagePosition: "top", imageFit: "cover", cardSize: "medium", showFieldTitle: true },
  mobile: { displayFields: [], fieldColumns: 1 },
});
const defaultFilter = ref<IConditionList>(createEmptyCondition());
const defaultSort = ref<IFieldSortList>(createDefaultSort(props.formDef.id, t));
const tableFieldIds = ref<string[]>([]);
const cardFieldIds = ref<string[]>([]);

const pcTypes = computed(() => [
  { label: t("common.viewType.table"), value: FormListViewType.Table, icon: "table-icon" },
  { label: t("common.viewType.kanban"), value: FormListViewType.Kanban, icon: "kanban-icon" },
  { label: t("common.viewType.gallery"), value: FormListViewType.Gallery, icon: "gallery-icon" },
]);
const rowHeightOptions = computed(() => [
  { label: t("common.auto"), value: "auto" },
  { label: t("common.level.low"), value: "low" },
  { label: t("common.level.middle"), value: "middle" },
  { label: t("common.level.high"), value: "high" },
]);
const cardSizeOptions = computed(() => [
  { label: t("common.size.small"), value: "small" },
  { label: t("common.size.medium"), value: "medium" },
  { label: t("common.size.large"), value: "large" },
]);

const allFields = computed(() => buildAllViewFields(props.formDef, t));
const imageFields = computed(() => allFields.value.filter((field) => field.type === FieldType.ImageUpload));
const groupFields = computed(() => allFields.value.filter((field) => field.type !== FieldType.ImageUpload && !field.isSubField));
const cardSettings = computed(() => draft.pcType === FormListViewType.Kanban ? settings.kanban! : settings.gallery!);
const titleField = computed(() => cardSettings.value.titleField || "dataTitle");
const cardDisplayFields = computed(() => draft.pcType === FormListViewType.Kanban ? settings.kanban?.displayFields || [] : settings.gallery?.displayFields || []);
const previewFields = computed(() => {
  const selected = settings.table?.displayFields || [];
  return selected.length > 0 ? selected : allFields.value.slice(0, 6);
});
const previewRows = computed(() => {
  const row: Record<string, string> = { id: "preview", dataTitle: draft.name || t("admin.formListView.unnamedData") };
  allFields.value.forEach((field) => {
    row[field.field] = field.type === FieldType.ImageUpload ? "" : field.label;
  });
  return [row, { ...row, id: "preview2", dataTitle: "456" }, { ...row, id: "preview3", dataTitle: "123" }];
});
const previewGroups = computed(() => [
  t("admin.formListView.ungrouped"),
  t("admin.formListView.previewOption3"),
  t("admin.formListView.previewOption4"),
]);
const sampleImage = computed(() => "");

watch(
  () => props.view,
  () => {
    if (!props.view) return;
    Object.assign(draft, {
      id: props.view.id,
      appId: props.view.appId,
      formId: props.view.formId,
      name: props.view.name,
      pcType: props.view.pcType,
      mobileType: props.view.mobileType,
      sortIndex: props.view.sortIndex,
      authGroupIds: [...(props.view.authGroupIds || [])],
      disabled: props.view.disabled,
    });
    Object.assign(settings, parseViewSettings(props.view.settings));
    settings.table ||= { displayFields: [], rowHeight: "auto" };
    settings.kanban ||= { displayFields: [], imagePosition: "top", imageFit: "cover", cardSize: "medium", showFieldTitle: true };
    settings.gallery ||= { displayFields: [], imagePosition: "top", imageFit: "cover", cardSize: "medium", showFieldTitle: true };
    settings.mobile ||= { displayFields: [], fieldColumns: 1 };
    defaultFilter.value = parseCondition(props.view.defaultFilter);
    defaultSort.value = parseSort(props.formDef.id, props.view.defaultSort, t);
    tableFieldIds.value = (settings.table.displayFields || []).map((field) => field.field);
    cardFieldIds.value = (cardSettings.value.displayFields || []).map((field) => field.field);
  },
  { immediate: true },
);

const setPcType = (type: FormListViewType) => {
  draft.pcType = type;
  if (type === FormListViewType.Kanban) draft.mobileType = MobileFormListViewType.Card;
};

const syncTableFields = () => {
  settings.table!.displayFields = toViewFields(allFields.value.filter((field) => tableFieldIds.value.includes(field.field)));
};

const syncCardFields = () => {
  cardSettings.value.displayFields = toViewFields(allFields.value.filter((field) => cardFieldIds.value.includes(field.field)));
};

const setDefaultSort = (sort: IFieldSortList) => {
  defaultSort.value = sort;
};

const setDefaultFilter = (filter: IConditionList) => {
  defaultFilter.value = filter;
};

const noop = () => {};

const save = () => {
  const payload: FormListViewRequest = {
    ...draft,
    id: draft.id || "",
    settings: JSON.stringify(settings),
    defaultFilter: JSON.stringify(defaultFilter.value),
    defaultSort: JSON.stringify(defaultSort.value),
  };
  if (!payload.name?.trim()) payload.name = t("admin.formListView.unnamedView");
  emit("ok", payload);
};

const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
</script>

<style lang="scss" scoped>
.view-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  height: calc(88vh - 110px);
  min-height: 560px;
  background: var(--et-bg-container);
}

.preview-panel {
  overflow: auto;
  padding: var(--et-space-28);
  border-right: 1px solid var(--et-border-color-light);
  background: var(--et-bg-page);
}

.settings-panel {
  overflow: auto;
  padding: var(--et-space-18);
  background: var(--et-bg-container);
}

.table-preview {
  height: 100%;
  overflow: auto;
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    min-width: 150px;
    height: 36px;
    border: 1px solid var(--et-border-color-light);
    padding: 0 var(--et-space-10);
    color: var(--et-text-primary);
    text-align: left;
  }

  th {
    background: var(--et-bg-muted);
    font-weight: 600;
  }
}

.kanban-preview {
  display: flex;
  gap: var(--et-space-16);
  min-height: 100%;
}

.preview-column {
  width: 280px;
  padding: var(--et-space-12);
  border-radius: var(--et-radius-6);
  background: var(--et-bg-muted);
}

.preview-column-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--et-space-12);
  color: var(--et-text-primary);
  font-weight: 600;
}

.gallery-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--et-space-16);
}

.device-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 32px;
  padding: 2px;
  border-radius: var(--et-radius-4);
  background: var(--et-bg-muted);
  margin-bottom: var(--et-space-16);

  button {
    border: 0;
    background: transparent;
    color: var(--et-text-secondary);
    cursor: pointer;
  }

  .active {
    border-radius: var(--et-radius-4);
    background: var(--et-bg-container);
    color: var(--et-color-primary);
    font-weight: 600;
  }
}

.section-label {
  margin: var(--et-space-12) 0 var(--et-space-8);
  color: var(--et-text-primary);
  font-weight: 600;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--et-space-12);
  margin-bottom: var(--et-space-18);
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--et-space-8);
  min-height: 74px;
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-radius-6);
  background: var(--et-bg-container);
  color: var(--et-text-secondary);
  cursor: pointer;

  &.active {
    border-color: var(--et-color-primary);
    color: var(--et-color-primary);
  }
}

.type-icon {
  width: 46px;
  height: 34px;
  margin-top: var(--et-space-8);
  border: 2px solid currentColor;
  border-radius: var(--et-radius-4);
  opacity: 0.35;
}

.kanban-icon,
.gallery-icon {
  position: relative;
}

.kanban-icon::before,
.gallery-icon::before {
  content: "";
  position: absolute;
  inset: 8px;
  border-top: 3px solid currentColor;
  border-bottom: 3px solid currentColor;
}

.gallery-icon::before {
  inset: 7px;
  border: 0;
  background: radial-gradient(circle at 25% 30%, currentColor 0 3px, transparent 4px),
    linear-gradient(currentColor, currentColor) 8px 20px / 12px 3px no-repeat,
    linear-gradient(currentColor, currentColor) 26px 20px / 12px 3px no-repeat;
}

.inline-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--et-space-10);
}
</style>
