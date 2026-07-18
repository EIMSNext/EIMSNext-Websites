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
        <p v-if="accessCodeError" class="access-code-error">{{ t("publicpublish.accessCodeInvalid") }}</p>
      </el-card>
    </div>

    <PublicNotFound v-else-if="!formDef || errorText" :description="errorText || t('publicpublish.formNotAvailable')" />

    <div v-else-if="submitSuccess" class="public-submit-success">
      <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
      <div class="success-title">{{ t("publicpublish.submitSuccessTitle") }}</div>
      <div class="success-desc">{{ t("publicpublish.submitSuccessDesc") }}</div>
      <el-button type="primary" @click="continueAdd">{{ t("publicpublish.continueAdd") }}</el-button>
    </div>

    <div v-else class="public-content">
      <h1 v-if="formDef.name" class="public-form-title">{{ formDef.name }}</h1>
      <div v-if="unsupportedFields.length" class="unsupported-list">
        <div v-for="field in unsupportedFields" :key="field.field">
          <strong>{{ field.title }}</strong>
          <span>{{
            t("publicpublish.fieldNotSupported", {
              type: isDepartmentField(field.type) ? t("common.department") : t("common.employee"),
            })
          }}</span>
        </div>
      </div>

      <FormView
        ref="formViewRef"
        :key="formViewKey"
        :def="renderContent"
        :data="prefillData"
        :actions="actions"
        :is-view="false"
        :is-public="true"
        :public-token="publicToken || undefined"
        @submit="submitData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, CircleCheckFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  DataAction,
  FieldDef,
  FieldType,
  FormContent,
  FormData,
  FormDataRequest,
  FormDef,
  PublicSetting,
  PublicScope,
  PublicWechatAcquireMode,
} from "@eimsnext/models";
import FormView from "@/components/FormView/index.vue";
import { FormActionSettings } from "@/components/FormView/type";
import {
  AccessCodeInvalidError,
  PublicNotFound,
  bootstrapWithToken,
  renderPrintFullscreenToolbar,
  toAccessCodeError,
  usePublicHttp,
} from "./shared";
import { isPublicSystemFieldDef } from "@/utils/publicSystemFields";
import { http } from "@eimsnext/utils";
import { h, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "FormLinkView" });

const route = useRoute();
const { t } = useI18n();
const formId = computed(() => route.params.formId?.toString() || "");

const publicHttp = usePublicHttp();
const { token: publicToken } = publicHttp;

const loading = ref(false);
const errorText = ref("");
const formDef = ref<FormDef>();
const publicSetting = ref<PublicSetting>();
const renderContent = ref<FormContent>(new FormContent());
const unsupportedFields = ref<FieldDef[]>([]);
const prefillData = ref<FormData>({ id: "", appId: "", formId: "", data: {} as any, flowStatus: 0 });
const publicSystemValues = ref<Record<string, any>>({});
const formViewRef = ref<InstanceType<typeof FormView>>();
const submitting = ref(false);

const submitSuccess = ref(false);
const formViewKey = ref("");

const accessCodeGate = ref(false);
const accessCodeInput = ref("");
const accessCodeSubmitting = ref(false);
const accessCodeError = ref(false);

const actions = ref<FormActionSettings>({
  submit: { text: "common.wfProcess.submit", disabled: false },
  reset: { text: "common.reset", disabled: false },
});

const extValue = computed(() => route.query.ext?.toString() || "");
const wechatCode = computed(() => route.query.code?.toString() || "");
const wechatRefreshToken = computed(() => {
  const value = route.query.refreshToken ?? route.query.refresh_token;
  return value?.toString() || "";
});
const extEnabled = computed(() => publicSetting.value?.form?.formLink?.extLink?.enabled === true);
const wechatEnabled = computed(() => publicSetting.value?.form?.formLink?.wechat?.enabled === true);
const wechatAcquireMode = computed(
  () => publicSetting.value?.form?.formLink?.wechat?.acquireMode ?? PublicWechatAcquireMode.SilentOpenId,
);
const hasWechatAuthParam = computed(() => !!wechatCode.value || !!wechatRefreshToken.value);

// 打印/全屏 toolbar
const renderToolbar = () => renderPrintFullscreenToolbar();

watch(
  formId,
  async (id) => {
    if (!id) {
      formDef.value = undefined;
      return;
    }
    await bootstrap();
  },
  { immediate: true },
);

async function bootstrap(accessCode?: string) {
  loading.value = true;
  errorText.value = "";
  accessCodeError.value = false;
  try {
    if (!publicToken.value) {
      await bootstrapWithToken(publicHttp, formId.value, PublicScope.FormLink, accessCode);
    }

    const form = await loadFormDef();
    publicSetting.value = await loadPublicSetting();
    publicSystemValues.value = await buildPublicSystemValues();
    formDef.value = form;
    renderContent.value = buildPublicContent(form.content || new FormContent());
    prefillData.value = buildInitialPrefill(form);
    refreshFormKey();
  } catch (err: any) {
    if (toAccessCodeError(err)) {
      accessCodeGate.value = true;
      accessCodeError.value = !!accessCode;
    } else {
      errorText.value = t("publicpublish.formNotAvailable");
      formDef.value = undefined;
    }
  } finally {
    loading.value = false;
    writePublicSystemValuesToForm();
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
  } catch {
    accessCodeError.value = true;
  } finally {
    accessCodeSubmitting.value = false;
  }
}

async function loadFormDef(): Promise<FormDef> {
  return await publicHttp.odata.get<FormDef>("FormDef", formId.value);
}

async function loadPublicSetting(): Promise<PublicSetting> {
  return await publicHttp.api.get<PublicSetting>("/PublicSetting/current");
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

function buildInitialPrefill(form: FormDef): FormData {
  return {
    id: "",
    appId: form.appId,
    formId: form.id,
    data: { ...publicSystemValues.value },
    flowStatus: 0,
  };
}

function continueAdd() {
  submitSuccess.value = false;
  if (formDef.value) {
    prefillData.value = buildInitialPrefill(formDef.value);
    refreshFormKey();
    writePublicSystemValuesToForm();
  }
}

function refreshFormKey() {
  formViewKey.value = `${formId.value}:submit:${Date.now()}`;
}

async function submitData(data: Record<string, any>) {
  if (!formDef.value) return;
  submitting.value = true;
  try {
    const finalData = normalizeSubmitData({ ...data, ...publicSystemValues.value });
    if (wechatEnabled.value && !hasValue(finalData.wxopenid)) {
      ElMessage.error(t("publicpublish.wechatOpenIdRequired"));
      return;
    }
    const payload: FormDataRequest = {
      id: "",
      action: DataAction.Submit,
      appId: formDef.value.appId,
      formId: formDef.value.id,
      data: finalData,
    };
    await publicHttp.api.post<FormData>("/FormData", payload);
    submitSuccess.value = true;
  } catch (err: any) {
    ElMessage.error(err?.message || t("common.saveFailed"));
  } finally {
    submitting.value = false;
  }
}

function normalizeSubmitData(data: Record<string, any>) {
  const next = { ...data };
  if (!extEnabled.value) {
    delete next.ext;
  } else if (!hasValue(next.ext)) {
    delete next.ext;
  }

  if (!wechatEnabled.value) {
    delete next.wxopenid;
    delete next.wxnickname;
    delete next.wxavator;
  } else {
    ["wxopenid", "wxnickname", "wxavator"].forEach((field) => {
      if (!hasValue(next[field])) {
        delete next[field];
      }
    });
  }

  return next;
}

async function buildPublicSystemValues(): Promise<Record<string, any>> {
  const values: Record<string, any> = {};
  if (extEnabled.value && extValue.value) {
    values.ext = extValue.value;
  }

  if (!wechatEnabled.value || !hasWechatAuthParam.value) {
    return values;
  }

  try {
    const wx = await loadWechatUserInfo();
    if (wx?.openid) {
      values.wxopenid = wx.openid;
    }
    if (wechatAcquireMode.value === PublicWechatAcquireMode.ExplicitGrant) {
      if (wx?.nickname) {
        values.wxnickname = wx.nickname;
      }
      if (wx?.headimgurl) {
        values.wxavator = wx.headimgurl;
      }
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.errmsg || err?.message || t("publicpublish.wechatOpenIdRequired"));
  }

  return values;
}

async function loadWechatUserInfo(): Promise<any> {
  return await http.auth.post(
    "/WeChat/UserInfo",
    {
      code: wechatCode.value,
      refreshToken: wechatRefreshToken.value,
      scopeType: wechatAcquireMode.value === PublicWechatAcquireMode.SilentOpenId ? 1 : 2,
    },
    undefined,
    false,
  );
}

async function writePublicSystemValuesToForm() {
  await nextTick();
  formViewRef.value?.setValues(publicSystemValues.value);
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
      if (isPublicSystemRule(rule)) return true;
      if (rule.hidden) return false;
      if (isOrgField(rule.type)) {
        unsupportedFields.value.push({
          field: rule.field || "",
          title: rule.title || rule.field || "",
          type: rule.type,
        } as FieldDef);
        return true;
      }
      if (!allowed || !rule.field || rule.type === FieldType.TableForm) return true;
      const key = parentField ? `${parentField}>${rule.field}` : rule.field;
      return allowed.has(key.toLowerCase());
    })
    .map((rule) => {
      const orgField = isOrgField(rule.type);
      const next = isPublicSystemRule(rule)
        ? {
            ...rule,
            hidden: true,
            display: false,
            props: { ...(rule.props || {}), disabled: true },
          }
        : orgField
          ? { ...rule, props: { ...(rule.props || {}), disabled: true, readonly: true } }
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

function isPublicSystemRule(rule: any) {
  return isPublicSystemFieldDef(rule);
}

function hasValue(value: any) {
  return value !== undefined && value !== null && `${value}`.trim() !== "";
}

function isOrgField(type?: string) {
  return isDepartmentField(type) || type === FieldType.Employee1 || type === FieldType.Employee2;
}

function isDepartmentField(type?: string) {
  return type === FieldType.Department1 || type === FieldType.Department2;
}
</script>

<style scoped lang="scss">
.public-form-title {
  color: var(--et-text-primary, #303133);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
}

.unsupported-list {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
  background: #fdf6ec;
  padding: 12px;
  border-radius: 4px;

  div {
    display: grid;
    gap: 4px;
  }

  strong {
    color: var(--et-text-primary, #303133);
  }

  span {
    color: var(--el-color-warning, #e6a23c);
    font-size: 13px;
  }
}
</style>
