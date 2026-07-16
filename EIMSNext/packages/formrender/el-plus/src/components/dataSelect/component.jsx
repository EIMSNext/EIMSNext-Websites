import { defineComponent, ref, watch, computed, nextTick } from "vue";
import { ElButton, ElDialog, ElIcon } from "element-plus";
import { Tickets } from "@element-plus/icons-vue";
import { DataSelectTablePanel } from "@eimsnext/components";
import { formDataService } from "@eimsnext/services";
import {
  buildDataSelectValue,
  createDataSelectQuery,
  mergeDataSelectRecord,
  normalizeDataSelectField,
  normalizeDataSelectValue,
  resolveDataSelectValue,
} from "@eimsnext/components";
import "./style.css";

const normalizeLegacyDisplayTags = (val) => {
  if (!Array.isArray(val)) return [];
  return val
    .map((item) => item && item.label != null && item.value != null
      ? { label: String(item.label), value: String(item.value ?? "") }
      : null)
    .filter(Boolean);
};

export default defineComponent({
  name: "fcDataSelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Object, Array],
      default: null,
    },
    placeholder: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Boolean,
      default: undefined,
    },
    formCreateInject: {
      type: Object,
      default: null,
    },
    selectionProcess: {
      type: Object,
      default: () => ({
        buttonText: "",
        tableFields: [],
      }),
    },
    dataSource: {
      type: String,
      default: "",
    },
    fillConfig: {
      type: Object,
      default: () => ({
        mappings: [],
      }),
    },
    displayConfig: {
      type: Object,
      default: () => ({
        fields: [],
      }),
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const showDialog = ref(false);
    const selectedValue = ref(normalizeDataSelectValue(props.modelValue));
    const formData = ref([]);
    const loading = ref(false);
    const selectedRecord = ref(null);
    const error = ref("");
    const currentPage = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const filterConfig = ref({ id: "", rel: "and", items: [] });
    const t = (key) => props.formCreateInject?.t?.(key) || "";

    const isPreviewMode = computed(() => {
      if (props.preview !== undefined) {
        return !!props.preview;
      }
      return !!props.formCreateInject?.preview;
    });

    const tableFields = computed(() => {
      return (props.selectionProcess?.tableFields || [])
        .map(normalizeDataSelectField)
        .filter(Boolean);
    });

    const displayFields = computed(() => {
      return (props.displayConfig?.fields || [])
        .map(normalizeDataSelectField)
        .filter(Boolean);
    });

    const fillMappings = computed(() => {
      return (props.fillConfig?.mappings || [])
        .map((mapping) => ({
          sourceField: normalizeDataSelectField(mapping?.sourceField),
          targetField: normalizeDataSelectField(mapping?.targetField),
        }))
        .filter((mapping) => mapping.sourceField && mapping.targetField);
    });

    watch(
      () => props.modelValue,
      (newVal) => {
        selectedValue.value = normalizeDataSelectValue(newVal);
      },
      { immediate: true, deep: true }
    );

    const fetchFormData = async (page = 1, size = pageSize.value) => {
      if (!props.dataSource) {
        error.value = t("com.dataselect.sourceRequired") || "请先选择数据源";
        formData.value = [];
        total.value = 0;
        return;
      }

      loading.value = true;
      error.value = "";
      selectedRecord.value = null;

      try {
        const query = createDataSelectQuery({
          formId: props.dataSource,
          page,
          pageSize: size,
          filter: filterConfig.value,
        });
        const data = await formDataService.query(query);
        formData.value = data.map((item) => mergeDataSelectRecord(item));
        total.value = data.length;
        const selectedId = selectedValue.value?.dataId;
        selectedRecord.value = selectedId
          ? formData.value.find((item) => String(item.id || item._id || "") === selectedId) || null
          : null;
      } catch (err) {
        error.value = t("com.dataselect.fetchFailed") || "获取表单数据失败，请重试";
        console.error("获取表单数据失败:", err);
      } finally {
        loading.value = false;
      }
    };

    const applyMappings = async (record) => {
      if (!fillMappings.value.length || !props.formCreateInject) {
        return;
      }

      const formDataToFill = {};
      fillMappings.value.forEach((mapping) => {
        formDataToFill[mapping.targetField.field] = resolveDataSelectValue(
          record,
          mapping.sourceField.field
        );
      });

      const injectApi = props.formCreateInject.api;
      if (injectApi?.setFormData) {
        injectApi.setFormData(formDataToFill);
      }

      await nextTick();

      if (injectApi?.setValue) {
        Object.keys(formDataToFill).forEach((field) => {
          injectApi.setValue(field, formDataToFill[field]);
        });
      }

      if (props.formCreateInject.form) {
        Object.keys(formDataToFill).forEach((field) => {
          props.formCreateInject.form[field] = formDataToFill[field];
        });
      }

      injectApi?.refresh && injectApi.refresh();
    };

    const handleConfirm = async () => {
      if (!selectedRecord.value) {
        return;
      }

      const selectedData = buildDataSelectValue(
        selectedRecord.value,
        displayFields.value,
        fillMappings.value,
      );
      await applyMappings(selectedRecord.value);
      selectedValue.value = selectedData;
      emit("update:modelValue", selectedData);
      emit("change", selectedData);
      showDialog.value = false;
    };

    const handleEditTag = async () => {
      currentPage.value = 1;
      filterConfig.value = { id: "", rel: "and", items: [] };
      await fetchFormData();
      showDialog.value = true;
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchFormData(page, pageSize.value);
    };

    const handlePageSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchFormData(1, size);
    };

    const handleFilter = (filter) => {
      filterConfig.value = filter;
      currentPage.value = 1;
      fetchFormData(1, pageSize.value);
    };

    const displayRows = computed(() => {
      if (selectedValue.value) {
        return displayFields.value.map((field) => {
          const value = resolveDataSelectValue(selectedValue.value.data, field.field);
          return {
            label: field.label || t("com.dataselect.unknownField") || "未知字段",
            value: value == null ? "" : String(value),
            empty: value == null || value === "",
          };
        });
      }

      return normalizeLegacyDisplayTags(props.modelValue).map((tag) => ({
        label: tag.label,
        value: tag.value,
        empty: tag.value === "",
      }));
    });

    return () => {
      const editable = !(props.disabled || isPreviewMode.value);
      const emptyText =
        props.selectionProcess?.buttonText || props.placeholder || t("com.dataselect.selectData") || "选择数据";

      return (
        <div class="_fc-form-selected-data-wrap">
          {editable && (
            <button
              type="button"
              class="form-selected-data-trigger"
              onClick={handleEditTag}
            >
              <span class="form-selected-data-trigger-main">
                <ElIcon class="form-selected-data-trigger-icon">
                  <Tickets />
                </ElIcon>
                <span class="form-selected-data-trigger-text">{emptyText}</span>
              </span>
            </button>
          )}

          {displayRows.value.length > 0 && (
            <div class="form-selected-data-display-panel">
              {displayRows.value.map((tag, index) => (
                <div
                  key={`${tag.label}-${index}`}
                  class="form-selected-data-display-row"
                  style={{
                    borderBottom:
                      index === displayRows.value.length - 1
                        ? "none"
                        : undefined,
                  }}
                >
                  <span class="form-selected-data-display-label">
                    {tag.label}
                  </span>
                  <span
                    class={[
                      "form-selected-data-display-value",
                      tag.empty ? "is-empty" : "",
                    ]}
                  >
                    {tag.value || ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <ElDialog
            modelValue={showDialog.value}
            appendToBody={true}
            width="96%"
            top="4vh"
            class="form-selected-data-dialog"
            closeOnClickModal={false}
            onClose={() => {
              showDialog.value = false;
              selectedRecord.value = null;
            }}
          >
            {{
              header: () => (
                <div class="form-selected-data-dialog-header">
                  <div class="form-selected-data-dialog-title">{t("com.dataselect.selectData") || "选择数据"}</div>
                </div>
              ),
              default: () => (
                <div class="form-selected-data-dialog-body">
                  {error.value && (
                    <div class="form-selected-data-error">{error.value}</div>
                  )}
                  <DataSelectTablePanel
                    formId={props.dataSource}
                    fields={tableFields.value}
                    rows={formData.value}
                    loading={loading.value}
                    total={total.value}
                    page={currentPage.value}
                    pageSize={pageSize.value}
                    filter={filterConfig.value}
                    modelValue={selectedRecord.value}
                    onUpdate:modelValue={(row) => {
                      selectedRecord.value = row;
                    }}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onFilter={handleFilter}
                  >
                    {{ title: () => t("com.dataselect.selectData") || "选择数据" }}
                  </DataSelectTablePanel>
                </div>
              ),
              footer: () => (
                <div class="form-selected-data-dialog-footer">
                  <ElButton onClick={() => (showDialog.value = false)}>
                    {t("common.cancel") || "取消"}
                  </ElButton>
                  <ElButton
                    type="primary"
                    disabled={!selectedRecord.value}
                    onClick={handleConfirm}
                  >
                    {t("common.ok") || "确定"}
                  </ElButton>
                </div>
              ),
            }}
          </ElDialog>
        </div>
      );
    };
  },
});
