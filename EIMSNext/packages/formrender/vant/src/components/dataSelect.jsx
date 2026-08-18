import { computed, defineComponent, nextTick, ref, watch } from "vue";
import {
  buildDataSelectValue,
  createDataSelectQuery,
  formatDataSelectValue,
  mergeDataSelectRecord,
  normalizeDataSelectField,
  normalizeDataSelectValue,
  resolveDataSelectValue,
} from "../utils/dataSelect";
import { formDataService } from "@eimsnext/services";

const normalizeFields = (fields) =>
  (fields || []).map(normalizeDataSelectField).filter(Boolean);

const recordId = (record) => String(record?.id || record?._id || "");

export default defineComponent({
  name: "fcDataSelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Object, Array],
      default: null,
    },
    placeholder: String,
    disabled: Boolean,
    preview: {
      type: Boolean,
      default: undefined,
    },
    formCreateInject: Object,
    selectionProcess: {
      type: Object,
      default: () => ({ buttonText: "", tableFields: [] }),
    },
    dataSource: String,
    fillConfig: {
      type: Object,
      default: () => ({ mappings: [] }),
    },
    displayConfig: {
      type: Object,
      default: () => ({ fields: [] }),
    },
  },
  emits: ["update:modelValue", "change", "fc.el"],
  setup(props, { emit }) {
    const show = ref(false);
    const loading = ref(false);
    const error = ref("");
    const rows = ref([]);
    const selectedValue = ref(normalizeDataSelectValue(props.modelValue));
    const selectedRecord = ref(null);
    const page = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const keyword = ref("");
    const t = (key, fallback) => props.formCreateInject?.t?.(key) || fallback;

    watch(
      () => props.modelValue,
      (value) => {
        selectedValue.value = normalizeDataSelectValue(value);
      },
      { immediate: true, deep: true },
    );

    const isPreview = computed(() =>
      props.preview === undefined
        ? !!props.formCreateInject?.preview
        : !!props.preview,
    );
    const editable = computed(() => !(props.disabled || isPreview.value));
    const tableFields = computed(() =>
      normalizeFields(props.selectionProcess?.tableFields),
    );
    const displayFields = computed(() =>
      normalizeFields(props.displayConfig?.fields),
    );
    const fillMappings = computed(() =>
      (props.fillConfig?.mappings || [])
        .map((mapping) => ({
          sourceField: normalizeDataSelectField(mapping?.sourceField),
          targetField: normalizeDataSelectField(mapping?.targetField),
        }))
        .filter((mapping) => mapping.sourceField && mapping.targetField),
    );
    const queryFields = computed(() =>
      [
        ...tableFields.value,
        ...displayFields.value,
        ...fillMappings.value.map((mapping) => mapping.sourceField),
      ].filter(
        (field, index, fields) =>
          fields.findIndex((item) => item.field === field.field) === index,
      ),
    );
    const filteredRows = computed(() => {
      const word = keyword.value.trim().toLocaleLowerCase();
      if (!word) return rows.value;
      return rows.value.filter((row) =>
        tableFields.value.some((field) =>
          String(formatDataSelectValue(resolveDataSelectValue(row, field.field), field))
            .toLocaleLowerCase()
            .includes(word),
        ),
      );
    });
    const displayRows = computed(() => {
      const data = selectedValue.value?.data;
      if (!data) return [];
      return displayFields.value.map((field) => ({
        label: field.label || t("com.dataselect.unknownField", "未知字段"),
        value: formatDataSelectValue(resolveDataSelectValue(data, field.field), field),
      }));
    });

    const fetchRows = async (nextPage = page.value) => {
      if (!props.dataSource) {
        error.value = t("com.dataselect.sourceRequired", "请先选择数据源");
        rows.value = [];
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        const query = createDataSelectQuery({
          formId: props.dataSource,
          page: nextPage,
          pageSize: pageSize.value,
          filter: { id: "", rel: "and", items: [] },
          fields: queryFields.value,
        });
        const body = props.formCreateInject?.api?.fetch
          ? await props.formCreateInject.api.fetch({
              action: "/FormData/$query",
              method: "post",
              data: query,
              dataType: "json",
            })
          : await formDataService.query(query);
        const data = Array.isArray(body?.value)
          ? body.value
          : Array.isArray(body)
            ? body
            : [];
        rows.value = data.map(mergeDataSelectRecord);
        const count = Number(body?.count ?? body?.["@odata.count"]);
        total.value = Number.isFinite(count)
          ? count
          : (nextPage - 1) * pageSize.value + data.length +
            (data.length === pageSize.value ? 1 : 0);
        page.value = nextPage;
        const selectedId = selectedValue.value?.dataId;
        selectedRecord.value = selectedId
          ? rows.value.find((item) => recordId(item) === selectedId) || null
          : null;
      } catch (reason) {
        error.value = t(
          "com.dataselect.fetchFailed",
          "获取表单数据失败，请重试",
        );
        console.error(reason);
      } finally {
        loading.value = false;
      }
    };

    const applyMappings = async (record) => {
      if (!fillMappings.value.length || !props.formCreateInject) return;
      const values = {};
      fillMappings.value.forEach((mapping) => {
        values[mapping.targetField.field] = resolveDataSelectValue(
          record,
          mapping.sourceField.field,
        );
      });
      const api = props.formCreateInject.api;
      api?.setFormData?.(values);
      await nextTick();
      Object.keys(values).forEach((field) => api?.setValue?.(field, values[field]));
      if (props.formCreateInject.form) {
        Object.assign(props.formCreateInject.form, values);
      }
      api?.refresh?.();
    };

    const confirm = async () => {
      if (!selectedRecord.value) return;
      const value = buildDataSelectValue(
        selectedRecord.value,
        displayFields.value,
        fillMappings.value,
      );
      await applyMappings(selectedRecord.value);
      selectedValue.value = value;
      emit("update:modelValue", value);
      emit("change", value);
      show.value = false;
    };

    return {
      show,
      loading,
      error,
      page,
      pageSize,
      total,
      keyword,
      selectedRecord,
      filteredRows,
      tableFields,
      displayRows,
      editable,
      fetchRows,
      recordId,
      fieldValue(row, field) {
        return formatDataSelectValue(resolveDataSelectValue(row, field.field), field);
      },
      async open() {
        if (!editable.value) return;
        keyword.value = "";
        show.value = true;
        await fetchRows(1);
      },
      confirm,
      triggerText: computed(
        () =>
          props.selectionProcess?.buttonText ||
          props.placeholder ||
          t("com.dataselect.selectData", "选择数据"),
      ),
    };
  },
  render() {
    return (
      <div class="fc-data-select-mobile" ref="el">
        {this.editable ? (
          <van-cell
            clickable
            isLink
            title={this.triggerText}
            icon="records-o"
            onClick={this.open}
          />
        ) : null}
        {this.displayRows.length ? (
          <van-cell-group inset class="fc-data-select-display">
            {this.displayRows.map((item) => (
              <van-cell title={item.label} value={String(item.value ?? "")} />
            ))}
          </van-cell-group>
        ) : null}
        <van-popup
          show={this.show}
          onUpdate:show={(value) => (this.show = value)}
          round
          position="bottom"
          teleport={this.formCreateInject?.popupContainer ?? undefined}
          class="fc-data-select-popup"
        >
          <div class="fc-mobile-popup-header">
            <strong>{this.triggerText}</strong>
            <van-icon name="cross" onClick={() => (this.show = false)} />
          </div>
          <van-search
            modelValue={this.keyword}
            onUpdate:modelValue={(value) => (this.keyword = value)}
            placeholder={this.triggerText}
          />
          <div class="fc-mobile-popup-content">
            {this.loading ? <van-loading vertical /> : null}
            {this.error ? (
              <van-empty description={this.error}>
                <van-button size="small" onClick={() => this.fetchRows(this.page)}>
                  重试
                </van-button>
              </van-empty>
            ) : null}
            {!this.loading && !this.error
              ? this.filteredRows.map((row) => (
                  <div
                    key={this.recordId(row)}
                    class={[
                      "fc-data-select-record",
                      this.recordId(this.selectedRecord) === this.recordId(row)
                        ? "is-selected"
                        : "",
                    ]}
                    onClick={() => (this.selectedRecord = row)}
                  >
                    {this.tableFields.map((field) => (
                      <div class="fc-data-select-record-row">
                        <span>{field.label}</span>
                        <strong>{String(this.fieldValue(row, field) ?? "")}</strong>
                      </div>
                    ))}
                    {!this.tableFields.length ? (
                      <div class="fc-data-select-record-row">
                        <strong>{this.recordId(row)}</strong>
                      </div>
                    ) : null}
                  </div>
                ))
              : null}
            {!this.loading && !this.error && !this.filteredRows.length ? (
              <van-empty />
            ) : null}
          </div>
          {this.total > this.pageSize ? (
            <van-pagination
              modelValue={this.page}
              onUpdate:modelValue={(value) => this.fetchRows(value)}
              totalItems={this.total}
              itemsPerPage={this.pageSize}
              mode="simple"
            />
          ) : null}
          <div class="fc-mobile-popup-footer">
            <van-button onClick={() => (this.show = false)}>取消</van-button>
            <van-button
              type="primary"
              disabled={!this.selectedRecord}
              onClick={this.confirm}
            >
              确定
            </van-button>
          </div>
        </van-popup>
      </div>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
