<template>
  <div class="public-data-view" :class="`public-data-view--${mode}`">
    <div v-if="mode === 'page'" class="public-data-view__toolbar">
      <el-button :icon="Printer" circle size="large" @click="onPrint" />
    </div>

    <div v-if="loading" class="public-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("common.loading") }}</span>
    </div>

    <PublicNotFound
      v-else-if="!formDef || !data"
      :description="t('publicpublish.dataNotAvailable')"
    />

    <div v-else class="public-data-view__body">
      <FormView
        :key="formViewKey"
        :def="renderContent"
        :data="data"
        :is-view="true"
        :is-public="true"
        :field-perms="fieldPerms"
      />
    </div>

    <div v-if="mode === 'dialog'" class="public-data-view__dialog-footer">
      <el-button :disabled="!hasPrev" @click="$emit('prev')">
        <el-icon><ArrowLeft /></el-icon>
        {{ t("publicpublish.prev") }}
      </el-button>
      <el-button :disabled="!hasNext" @click="$emit('next')">
        {{ t("publicpublish.next") }}
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Loading, Printer } from "@element-plus/icons-vue";
import {
  FieldDef,
  FieldType,
  FormContent,
  FormData,
  FormDef,
  PublicFieldPermission,
  PublicScope,
  PublicSetting,
} from "@eimsnext/models";
import FormView from "@/components/FormView/index.vue";
import { PublicNotFound, bootstrapWithToken, toAccessCodeError, usePublicHttp, type PublicHttp } from "./shared";
import { isPublicSystemFieldDef } from "@/utils/publicSystemFields";
import { IFieldPerm } from "@eimsnext/models";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "PublicDataView" });

const props = withDefaults(
  defineProps<{
    formId: string;
    dataId: string;
    initialData?: FormData;
    mode?: "page" | "dialog";
    hasPrev?: boolean;
    hasNext?: boolean;
    preloadedFormDef?: FormDef;
    preloadedSetting?: PublicSetting;
    publicHttp?: PublicHttp;
    scope?: PublicScope;
    allowedFields?: string[];
  }>(),
  { mode: "page", hasPrev: false, hasNext: false, scope: PublicScope.DataLink }
);

const emit = defineEmits<{
  prev: [];
  next: [];
  "update:visible": [boolean];
  loaded: [FormData];
  error: [string];
}>();

const { t } = useI18n();

const ownPublicHttp = usePublicHttp();
const activePublicHttp = computed(() => props.publicHttp ?? ownPublicHttp);

const formDef = ref<FormDef>(props.preloadedFormDef as FormDef);
const data = ref<FormData | undefined>(props.initialData);
const setting = ref<PublicSetting | undefined>(props.preloadedSetting);
const renderContent = ref<FormContent>(new FormContent());
const unsupportedFields = ref<FieldDef[]>([]);
const loading = ref(false);
const formViewKey = ref("");

const fieldPerms = computed<IFieldPerm[] | undefined>(() => {
  if (props.allowedFields?.length) {
    return props.allowedFields.map((field) => ({ id: field, visible: true, editable: false }));
  }
  if (!setting.value) return undefined;
  const fields = setting.value.form?.dataLink?.fields;
  if (!fields?.length) return undefined;
  return fields.map((f: PublicFieldPermission) => ({ id: f.field, visible: f.visible !== false, editable: f.editable !== false }));
});

watch(
  () => [props.formId, props.dataId, props.initialData],
  () => {
    if (props.formId && props.dataId) {
      void load();
    }
  },
  { immediate: true },
);

async function load() {
  if (!props.formId || !props.dataId) return;
  loading.value = true;
  try {
    const publicHttp = activePublicHttp.value;
    if (!publicHttp.token.value) {
      await bootstrapWithToken(publicHttp, props.formId, props.scope);
    }
    if (!formDef.value) {
      formDef.value = await publicHttp.odata.get<FormDef>("FormDef", props.formId);
    }
    if (!setting.value) {
      setting.value = await publicHttp.api.get<PublicSetting>("/PublicSetting/current");
    }
    if (!props.initialData) {
      const fetched = await publicHttp.api.get<FormData>(`/FormData/${props.dataId}`);
      data.value = {
        ...fetched,
        appId: fetched.appId || formDef.value?.appId,
        formId: fetched.formId || formDef.value?.id,
        data: fetched.data || {},
      };
    }
    if (formDef.value) {
      const allowed = props.allowedFields?.length
        ? props.allowedFields
        : (setting.value?.form?.dataLink?.fields || [])
          .filter((f) => f.visible !== false)
          .map((f) => f.field);
      renderContent.value = buildPublicContent(formDef.value.content || new FormContent(), allowed.length ? allowed : undefined);
      refreshFormKey();
    }
    emit("loaded", data.value!);
  } catch (err: any) {
    if (toAccessCodeError(err)) {
      emit("error", "accessCodeRequired");
      return;
    }
    data.value = undefined;
    emit("error", err?.message || t("publicpublish.dataNotAvailable"));
  } finally {
    loading.value = false;
  }
}

function onPrint() {
  window.print();
}

function refreshFormKey() {
  formViewKey.value = `${props.formId}:${props.dataId}:${Date.now()}`;
}

function buildPublicContent(content: FormContent, allowedFields?: string[]): FormContent {
  const next = new FormContent();
  next.options = content.options;
  next.items = content.items;
  const rules = parseRules(content.layout);
  const allowed = allowedFields?.length ? new Set(allowedFields.map((f) => f.toLowerCase())) : undefined;
  unsupportedFields.value = [];
  next.layout = JSON.stringify(filterPublicRules(rules, allowed));
  return next;
}

function parseRules(layout?: string): any[] {
  if (!layout) return [];
  try {
    const value = JSON.parse(layout);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function filterPublicRules(rules: any[], allowed?: Set<string>, parentField?: string): any[] {
  return rules
    .filter((rule) => {
      if (!rule) return false;
      const publicSystemField = isPublicSystemFieldDef(rule);
      if (!publicSystemField && rule.hidden) return false;
      if (isOrgField(rule.type)) return false;
      if (!allowed || !rule.field || rule.type === FieldType.TableForm) return true;
      const key = parentField ? `${parentField}>${rule.field}` : rule.field;
      return allowed.has(key.toLowerCase());
    })
    .map((rule) => {
      const next = isPublicSystemFieldDef(rule)
        ? {
            ...rule,
            hidden: false,
            display: true,
            props: { ...(rule.props || {}), disabled: true },
          }
        : { ...rule };
      if (Array.isArray(next.children)) {
        next.children = filterPublicRules(next.children, allowed, parentField);
      }
      if (next.props?.columns) {
        next.props = {
          ...next.props,
          columns: next.props.columns
            .map((column: any) => ({
              ...column,
              rule: Array.isArray(column.rule) ? filterPublicRules(column.rule, allowed, next.field) : column.rule,
            }))
            .filter((column: any) => !Array.isArray(column.rule) || column.rule.length > 0),
        };
      }
      return next;
    })
    .filter((rule) => rule.type !== FieldType.TableForm || !allowed || rule.props?.columns?.length > 0);
}

function isOrgField(type?: string) {
  return type === FieldType.Department1 || type === FieldType.Department2 || type === FieldType.Employee1 || type === FieldType.Employee2;
}
</script>

<style scoped lang="scss">
.public-data-view {
  &--page {
    min-height: 100vh;
    background: var(--et-bg-page, #f5f7fa);
    padding: 24px;
  }

  &--dialog {
    padding: 0;
  }

  &__toolbar {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 100;
  }

  &__body {
    background: var(--et-bg-container, #fff);
    border-radius: 6px;
    padding: 24px;
    max-width: 860px;
    margin: 0 auto;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  }

  &__dialog-footer {
    display: flex;
    justify-content: space-between;
    padding: 12px 24px;
    border-top: 1px solid var(--et-border-color-light, #ebeef5);
  }
}
</style>
