import { computed, defineComponent, ref, watch } from "vue";
import { ElEmpty, ElSkeleton, ElTable, ElTableColumn } from "element-plus";
import {
  createFormDataQuery,
  mergeFormDataRecord,
  normalizeQueryField,
  resolveFormDataValue,
  resolveQueryFilter,
} from "@eimsnext/form-render-core";
import {
  formatDataSelectValue,
} from "@eimsnext/components";
import { formDataService } from "@eimsnext/services";
import "./style.css";

const normalizeFields = (fields) =>
  (fields || []).map(normalizeQueryField).filter(Boolean);

export default defineComponent({
  name: "fcQuery",
  inheritAttrs: false,
  props: {
    dataSource: { type: String, default: "" },
    resultMode: { type: String, default: "single" },
    displayConfig: { type: Object, default: () => ({ fields: [] }) },
    filterConfig: { type: Object, default: () => ({ id: "", rel: "and", items: [] }) },
    formCreateInject: { type: Object, default: null },
  },
  setup(props) {
    const rows = ref([]);
    const loading = ref(false);
    const error = ref("");
    let requestId = 0;
    const t = (key, fallback) => props.formCreateInject?.t?.(key) || fallback;

    const fields = computed(() => normalizeFields(props.displayConfig?.fields));
    const configured = computed(() => !!props.dataSource && fields.value.length > 0);
    const isMultiple = computed(() => props.resultMode === "multiple");

    const load = async () => {
      const currentRequest = ++requestId;
      if (!configured.value) {
        rows.value = [];
        error.value = t("com.query.invalidConfig", "此项配置有误，请检查字段属性");
        return;
      }

      loading.value = true;
      error.value = "";
      try {
        const query = createFormDataQuery({
          formId: props.dataSource,
          page: 1,
          pageSize: isMultiple.value ? 20 : 1,
          filter: resolveQueryFilter(props.filterConfig, props.formCreateInject?.form),
          fields: fields.value,
        });
        const body = props.formCreateInject?.api?.fetch
          ? await props.formCreateInject.api.fetch({
              action: "/FormData/$query",
              method: "post",
              data: query,
              dataType: "json",
            })
          : await formDataService.query(query);
        if (currentRequest !== requestId) return;
        const data = Array.isArray(body?.value) ? body.value : Array.isArray(body) ? body : [];
        rows.value = data.map(mergeFormDataRecord);
      } catch (reason) {
        if (currentRequest !== requestId) return;
        rows.value = [];
        error.value = t("com.query.fetchFailed", "查询数据失败，请重试");
        console.error(reason);
      } finally {
        if (currentRequest === requestId) loading.value = false;
      }
    };

    watch(
      () => [props.dataSource, props.resultMode, props.displayConfig, props.filterConfig, props.formCreateInject?.form],
      load,
      { deep: true, immediate: true },
    );

    const cellValue = (row, field) =>
      formatDataSelectValue(resolveFormDataValue(row, field.field), field) || "";

    return () => {
      if (!configured.value) {
        return <div class="fc-query-state is-error">{error.value}</div>;
      }

      if (loading.value) {
        return <ElSkeleton animated rows={isMultiple.value ? 3 : fields.value.length || 1} />;
      }

      if (error.value) {
        return <div class="fc-query-state is-error">{error.value}</div>;
      }

      if (!rows.value.length) {
        return <ElEmpty class="fc-query-empty" description={t("common.noData", "暂无数据")} image-size={56} />;
      }

      if (isMultiple.value) {
        return (
          <div class="fc-query-table-wrap">
            <ElTable data={rows.value} border class="fc-query-table">
              {fields.value.map((field) => (
                <ElTableColumn key={field.field} label={field.label} minWidth={150} showOverflowTooltip>
                  {{ default: (scope) => <span>{cellValue(scope.row, field)}</span> }}
                </ElTableColumn>
              ))}
            </ElTable>
          </div>
        );
      }

      const row = rows.value[0];
      return (
        <div class="fc-query-single">
          {fields.value.map((field) => (
            <div key={field.field} class="fc-query-single-row">
              <span class="fc-query-single-label">{field.label}</span>
              <span class="fc-query-single-value">{cellValue(row, field)}</span>
            </div>
          ))}
        </div>
      );
    };
  },
});
