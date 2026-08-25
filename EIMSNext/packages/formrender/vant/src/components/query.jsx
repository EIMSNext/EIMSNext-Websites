import { computed, defineComponent, ref, watch } from "vue";
import {
  createFormDataQuery,
  mergeFormDataRecord,
  normalizeQueryField,
  resolveFormDataValue,
  resolveQueryFilter,
} from "@eimsnext/form-render-core";
import {
  formatDataSelectValue,
} from "../utils/dataSelect";
import { formDataService } from "@eimsnext/services";
import "./query.css";

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
    const currentFormData = () => {
      const api = props.formCreateInject?.api;
      return typeof api?.formData === "function"
        ? api.formData()
        : props.formCreateInject?.form || {};
    };

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
          filter: resolveQueryFilter(props.filterConfig, currentFormData()),
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
      () => [props.dataSource, props.resultMode, props.displayConfig, props.filterConfig, currentFormData()],
      load,
      { deep: true, immediate: true },
    );

    const cellValue = (row, field) =>
      formatDataSelectValue(resolveFormDataValue(row, field.field), field, t) || "";

    return () => {
      if (!configured.value || error.value) {
        return <div class="fc-mobile-query-state">{error.value}</div>;
      }
      if (loading.value) {
        return <div class="fc-mobile-query-loading"><van-loading size="20px" /> </div>;
      }
      if (!rows.value.length) {
        return <van-empty class="fc-mobile-query-empty" image-size="56" description={t("common.noData", "暂无数据")} />;
      }
      if (!isMultiple.value) {
        const row = rows.value[0];
        return (
          <van-cell-group inset class="fc-mobile-query-single">
            {fields.value.map((field) => (
              <van-cell key={field.field} title={field.label} value={String(cellValue(row, field))} />
            ))}
          </van-cell-group>
        );
      }
      return (
        <div class="fc-mobile-query-list">
          {rows.value.map((row, index) => (
            <van-cell-group key={row.id || row._id || index} inset class="fc-mobile-query-record">
              {fields.value.map((field) => (
                <van-cell key={field.field} title={field.label} value={String(cellValue(row, field))} />
              ))}
            </van-cell-group>
          ))}
        </div>
      );
    };
  },
});
