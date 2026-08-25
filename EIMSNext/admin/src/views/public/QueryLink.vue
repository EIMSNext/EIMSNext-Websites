<template>
  <div class="public-page">
    <component :is="renderToolbar" />

    <div v-if="loading" class="public-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("common.loading") }}</span>
    </div>

    <div v-else-if="accessCodeGate" class="access-code-gate">
      <el-card class="access-code-card">
        <h3>{{ t("publicpublish.accessCodeGateTitle") }}</h3>
        <el-input
          v-model="accessCodeInput"
          type="password"
          :placeholder="t('publicpublish.accessCodePlaceholder')"
          @keyup.enter="submitAccessCode"
        />
        <el-button type="primary" :loading="accessCodeSubmitting" @click="submitAccessCode">
          {{ t("common.confirm") }}
        </el-button>
        <p v-if="accessCodeExpired" class="access-code-error">{{ t("publicpublish.accessCodeExpired") }}</p>
        <p v-else-if="accessCodeError" class="access-code-error">{{ t("publicpublish.accessCodeInvalid") }}</p>
      </el-card>
    </div>

    <PublicNotFound v-else-if="!formId" :description="t('publicpublish.formNotAvailable')" />

    <div v-else class="public-content">
      <h1 v-if="formDef?.name" class="public-form-title">{{ formDef.name }}</h1>

      <div v-if="mode === 'query'" class="query-panel">
        <el-form v-if="queryFields.length" label-position="top">
          <PublicConditionList v-model="queryCondition" :fields="queryFields" :option-loader="loadPublicSelectOptions" @validity-change="queryValid = $event" />
        </el-form>

        <div class="query-actions">
          <el-button @click="resetQuery">{{ t("common.reset") }}</el-button>
          <el-button type="primary" :loading="queryLoading" :disabled="!queryValid || !queryFields.length" @click="runQuery">
            {{ t("common.search") }}
          </el-button>
        </div>
      </div>

      <div v-else class="list-panel">
        <el-table
          v-loading="queryLoading"
          :data="listRows"
          class="public-data-table public-data-table--clickable"
          @row-click="openDetail"
        >
          <el-table-column type="index" width="56" />
          <el-table-column
            v-for="field in displayFields"
            :key="field.field"
            :label="field.title"
            min-width="140"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ formatCell(row, field.field) }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="listTotal > listPageSize"
          v-model:current-page="listPage"
          background
          layout="prev, pager, next"
          :page-size="listPageSize"
          :total="listTotal"
          class="list-pagination"
          @current-change="loadListData"
        />

        <div class="list-actions">
          <el-button @click="backToQuery">{{ t("publicpublish.changeQueryConditions") }}</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :show-close="false"
      fullscreen
      :align-center="true"
      @close="onDetailClose"
    >
      <PublicDataView
        v-if="detailVisible && currentDetail"
        mode="dialog"
        :form-id="formId"
        :data-id="currentDetail.id"
        :initial-data="currentDetail"
        :preloaded-form-def="formDef"
        :preloaded-setting="publicSetting"
        :public-http="publicHttp"
        :scope="PublicScope.QueryLink"
        :allowed-fields="detailFields"
        :has-prev="currentDetailIndex > 0"
        :has-next="currentDetailIndex < listRows.length - 1"
        @prev="goPrevDetail"
        @next="goNextDetail"
        @update:visible="detailVisible = $event"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { IDynamicFindOptions, IDynamicFilter } from "@eimsnext/services";
import {
  IConditionList,
  IFormFieldDef,
  PublicConditionList,
  toDynamicFilter,
} from "@eimsnext/components";
import { loadDynamicSelectOptions, type DynamicSelectOption, type DynamicSelectSource } from "@eimsnext/utils";
import {
  FieldDef,
  FieldType,
  FormContent,
  FormData,
  FormDef,
  PublicScope,
  PublicSetting,
} from "@eimsnext/models";
import {
  AccessCodeExpiredError,
  PublicNotFound,
  bootstrapWithToken,
  renderPrintFullscreenToolbar,
  toAccessCodeError,
  usePublicHttp,
} from "./shared";
import PublicDataView from "./PublicDataView.vue";
import { isPublicSystemFieldDef } from "@/utils/publicSystemFields";
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "QueryLinkView" });

type Mode = "query" | "list";

const route = useRoute();
const { t } = useI18n();
const formId = computed(() => route.params.formId?.toString() || "");

const publicHttp = usePublicHttp();

const loading = ref(false);
const accessCodeGate = ref(false);
const accessCodeInput = ref("");
const accessCodeSubmitting = ref(false);
const accessCodeError = ref(false);
const accessCodeExpired = ref(false);

const formDef = ref<FormDef>();
const publicSetting = ref<PublicSetting>();
const mode = ref<Mode>("query");
const queryCondition = ref<IConditionList>({ id: "public_conditions", rel: "and", items: [] });
const queryValid = ref(false);
const listRows = ref<FormData[]>([]);
const listTotal = ref(0);
const listPage = ref(1);
const listPageSize = 20;
const queryLoading = ref(false);
const detailVisible = ref(false);
const currentDetailIndex = ref(-1);

const ordinaryFields = computed(() => flattenFields(formDef.value?.content?.items || []));
const queryableFields = computed(() => ordinaryFields.value.filter((field) => isPublicQueryField(field.type)));
const queryFields = computed<IFormFieldDef[]>(() => resolveFields(publicSetting.value?.form?.queryLink?.queryFields || [], queryableFields.value).map((field) => ({
  formId: formId.value,
  field: field.field,
  label: field.title,
  type: field.type,
  format: field.props?.format,
  options: field.props?.options,
  source: field.type === FieldType.Select1
    ? (field as FieldDef & { effect?: { source?: DynamicSelectSource } }).effect?.source
    : undefined,
  isSubField: field.field.includes(">"),
})));
const displayFields = computed(() => {
  const configured = resolveFields(publicSetting.value?.form?.queryLink?.displayFields || []);
  return configured.length ? configured : ordinaryFields.value.slice(0, 5);
});
const detailFields = computed(() => displayFields.value.map((field) => field.field));

const currentDetail = computed(() => listRows.value[currentDetailIndex.value]);

const renderToolbar = () => renderPrintFullscreenToolbar();

watch(
  formId,
  async (id) => {
    if (!id) return;
    await bootstrap();
  },
  { immediate: true },
);

async function bootstrap(accessCode?: string) {
  loading.value = true;
  accessCodeError.value = false;
  accessCodeExpired.value = false;
  try {
    if (!publicHttp.token.value) {
      await bootstrapWithToken(publicHttp, formId.value, PublicScope.QueryLink, accessCode);
    }
    if (!formDef.value) {
      formDef.value = await publicHttp.odata.get<FormDef>("FormDef", formId.value);
    }
    if (!publicSetting.value) {
      publicSetting.value = await publicHttp.api.get<PublicSetting>("/PublicSetting/current");
    }
    accessCodeGate.value = false;
  } catch (err: any) {
    if (toAccessCodeError(err)) {
      accessCodeGate.value = true;
      accessCodeExpired.value = err instanceof AccessCodeExpiredError;
      accessCodeError.value = !!accessCode && !accessCodeExpired.value;
    } else {
      formDef.value = undefined;
    }
  } finally {
    loading.value = false;
  }
}

async function submitAccessCode() {
  if (!accessCodeInput.value) return;
  accessCodeSubmitting.value = true;
  try {
    await bootstrap(accessCodeInput.value);
    if (!accessCodeGate.value) {
      accessCodeInput.value = "";
    }
  } finally {
    accessCodeSubmitting.value = false;
  }
}

async function runQuery() {
  if (!queryValid.value || queryFields.value.length === 0) return;
  listPage.value = 1;
  await loadListData();
  if (listRows.value.length >= 0) {
    mode.value = "list";
  }
}

async function loadListData() {
  if (!formId.value) return;
  queryLoading.value = true;
  try {
    const queryRequest = buildQueryRequest();
    const [total, result] = await Promise.all([
      publicHttp.api.post<number>("/FormData/$count", queryRequest.filter),
      publicHttp.api.post<{ value: FormData[] }>("/FormData/$query", queryRequest),
    ]);
    listTotal.value = total || 0;
    listRows.value = (result?.value || []).map((d: any) => ({
      id: d.id,
      formId: d.formId,
      appId: d.appId,
      dataTitle: d.dataTitle,
      createTime: d.createTime,
      data: d.data || {},
    } as FormData));
  } catch (err: any) {
    ElMessage.error(err?.message || t("common.loadFailed"));
    listRows.value = [];
    listTotal.value = 0;
  } finally {
    queryLoading.value = false;
  }
}

function buildQueryRequest(): IDynamicFindOptions {
  const publicFilter = toDynamicFilter(queryCondition.value);
  const filters: IDynamicFilter[] = [{ field: "formId", op: "eq", value: formId.value }, ...(publicFilter.items || [])];

  return {
    filter: { rel: "and", items: filters },
    skip: (listPage.value - 1) * listPageSize,
    take: listPageSize,
  };
}

function resetQuery() {
  queryCondition.value = { id: "public_conditions", rel: "and", items: [] };
  queryValid.value = false;
  listPage.value = 1;
}

function backToQuery() {
  mode.value = "query";
}

function openDetail(row: FormData) {
  const index = listRows.value.findIndex((r) => r.id === row.id);
  if (index < 0) return;
  currentDetailIndex.value = index;
  detailVisible.value = true;
}

function goPrevDetail() {
  if (currentDetailIndex.value > 0) currentDetailIndex.value -= 1;
}

function goNextDetail() {
  if (currentDetailIndex.value < listRows.value.length - 1) currentDetailIndex.value += 1;
}

function onDetailClose() {
  currentDetailIndex.value = -1;
}

function formatCell(row: FormData, field: string) {
  const value = getFieldValue(row.data, field);
  return formatValue(value);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (value && typeof value === "object") {
    const option = value as { label?: unknown; value?: unknown; name?: unknown };
    if (option.label !== undefined && option.label !== null) return String(option.label);
    if (option.value !== undefined && option.value !== null) return String(option.value);
    if (option.name !== undefined && option.name !== null) return String(option.name);
    return JSON.stringify(value);
  }
  return String(value);
}

function getFieldValue(data: any, field: string) {
  if (!data) return undefined;
  if (field.includes(">")) {
    return data[field] ?? data[field.replace(">", ".")];
  }
  return data[field];
}

function resolveFields(fields: string[], candidates = ordinaryFields.value): FieldDef[] {
  if (!fields.length) return [];
  const allowed = new Set(fields);
  return candidates.filter((field) => allowed.has(field.field));
}

function loadPublicSelectOptions(source: DynamicSelectSource, keyword?: string): Promise<DynamicSelectOption[]> {
  return loadDynamicSelectOptions(source, keyword, publicHttp);
}

function flattenFields(fields: FieldDef[]): FieldDef[] {
  const result: FieldDef[] = [];
  fields.forEach((field) => {
    const publicSystemField = isPublicSystemFieldDef(field);
    if ((!publicSystemField && field.hidden) || (field.type !== FieldType.TableForm && !isSupportedQueryField(field.type))) return;
    if (field.type === FieldType.TableForm && field.columns?.length) {
      field.columns.forEach((sub) => {
        const publicSystemSubField = isPublicSystemFieldDef(sub);
        if ((publicSystemSubField || !sub.hidden) && isSupportedQueryField(sub.type)) {
          result.push({ ...sub, field: `${field.field}>${sub.field}`, title: `${field.title}.${sub.title}` });
        }
      });
      return;
    }
    result.push(field);
  });
  return result;
}

function isSupportedQueryField(type?: string) {
  return ![FieldType.DataSelect, FieldType.FileUpload, FieldType.ImageUpload, FieldType.Signature, FieldType.TableForm].includes(type as FieldType);
}

function isPublicQueryField(type?: FieldType | string) {
  return [
    FieldType.Input,
    FieldType.TextArea,
    FieldType.SerialNo,
    FieldType.Radio,
    FieldType.Select1,
    FieldType.Number,
    FieldType.TimeStamp,
  ].includes(type as FieldType);
}
</script>

<style scoped lang="scss">
.public-form-title {
  color: var(--et-text-primary, #303133);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
}

.query-panel {
  background: var(--et-bg-container, #fff);
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.query-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}

.list-panel {
  background: var(--et-bg-container, #fff);
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.public-data-table {
  width: 100%;

  &--clickable {
    cursor: pointer;
  }
}

.list-pagination {
  justify-content: flex-end;
  margin-top: 16px;
}

.list-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
