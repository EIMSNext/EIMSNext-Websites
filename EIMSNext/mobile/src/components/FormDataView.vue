<template>
  <MobilePage :title="isAdd ? t('mobile.formData.addTitle') : t('mobile.formData.detailTitle')" @back="goBack">
    <div class="detail-page">
      <div v-if="loading" class="loading-wrap">{{ t("common.loading") }}</div>
      <van-empty v-else-if="loadError" image="error" :description="t('admin.formData.dataNotAvailable')">
        <van-button size="small" @click="goBack">{{ t("common.back") }}</van-button>
      </van-empty>
      <div v-else class="detail-card mobile-card">
        <div class="detail-title">{{ formDef?.name }}</div>

        <MobileFormRenderer
          v-if="renderRule.length > 0"
          v-model="formData"
          :rule="renderRule"
          :option="renderOption"
        />

        <div v-else class="json-fallback">{{ JSON.stringify(formData, null, 2) }}</div>
      </div>
    </div>

    <template #footer>
      <div v-if="isAdd || editing" class="detail-footer-actions">
        <van-button block :loading="saving" @click="() => handleSave()">{{ t("common.save") }}</van-button>
        <van-button
          v-if="isAdd && formDef?.usingWorkflow"
          block
          type="primary"
          :loading="saving"
          @click="handleSubmit"
        >{{ t("common.submit") }}</van-button>
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { useI18n } from "vue-i18n";
import { DataAction, FormDataPermissions, type FormDataPermissionGroup, type FormData, type FormDef, type FormFieldPermission } from "@eimsnext/models";
import FormCreateMobile from "@eimsnext/form-render-vant";
import { FlagEnum } from "@eimsnext/utils";
import MobileFormRenderer from "@/components/form/MobileFormRenderer.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataPermissionGroupServiceMobile, formDataServiceMobile, formServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const formId = route.params.formId as string;
const dataId = route.params.dataId as string | undefined;
const permissionGroupId = computed(() => String(route.query.permissionGroupId || ""));

const loading = ref(false);
const saving = ref(false);
const editing = ref(true);
const formDef = ref<FormDef>();
const formData = ref<Record<string, unknown>>({});
const currentData = ref<FormData>();
const loadError = ref(false);
const permissionGroup = ref<FormDataPermissionGroup>();
const formFieldPermissions = computed<FormFieldPermission[] | undefined>(() => permissionGroup.value?.formFieldPermissions);

const isAdd = computed(() => !dataId || Boolean(route.meta.isAdd));
const canAdd = computed(() => !permissionGroup.value || FlagEnum.has(permissionGroup.value.formDataPermissions, FormDataPermissions.AddNew));
const canEdit = computed(() => !permissionGroup.value || FlagEnum.has(permissionGroup.value.formDataPermissions, FormDataPermissions.Edit));
const renderRule = computed(() => {
  const layout = formDef.value?.content?.layout;
  if (!layout) return [];
  try {
    const rules = FormCreateMobile.parseJson(layout);
    return reactive(applyFieldPermissions(rules, formFieldPermissions.value, isAdd.value));
  } catch {
    return [];
  }
});
const renderOption = computed(() => ({
  submitBtn: false,
  resetBtn: false,
  form: { labelPosition: "top" },
}));

const goBack = () => router.back();

const handleSave = async (action = DataAction.Save) => {
  if ((isAdd.value && !canAdd.value) || (!isAdd.value && !canEdit.value)) return;
  saving.value = true;
  try {
    if (isAdd.value && formDef.value) {
      await formDataServiceMobile.post(formDef.value, formData.value, action);
    } else if (currentData.value) {
      await formDataServiceMobile.put(currentData.value, formData.value);
    }
    showToast(t("common.saveSuccess"));
    router.back();
  } catch {
    showToast(t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
};

const handleSubmit = () => handleSave(DataAction.Submit);

const loadData = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    formDef.value = await formServiceMobile.get(formId);
    if (!formDef.value) throw new Error("Form definition is unavailable");
    const groups = await formDataPermissionGroupServiceMobile.getAssigned(formId);
    permissionGroup.value = groups.find((group) => group.id === permissionGroupId.value);
    if (!isAdd.value && dataId) {
      const data = await formDataServiceMobile.get(dataId, permissionGroupId.value || undefined);
      if (!data) throw new Error("Form data is unavailable");
      currentData.value = data;
      formData.value = data.data || {};
    }
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadData();
});

function applyFieldPermissions(rules: any[], permissions: FormFieldPermission[] | undefined, isNewData: boolean) {
  if (permissions === undefined) return rules;

  return rules.map((rule) => {
    const next = { ...rule, props: { ...(rule.props || {}) } };
    const permission = permissions.find((item) => item.id === rule.field);
    if (rule.type === "tableform") {
      if (!permission) return { ...next, hidden: true };
      next.hidden = next.hidden === true || !permission.visible;
      next.props = {
        ...next.props,
        disabled: next.props.disabled === true || !permission.editable,
        addable: next.props.addable !== false && permission.tableInsert === true,
        deletable: next.props.deletable !== false && permission.tableDelete === true,
        editable: permission.tableEdit === true,
        initialRowsAreNew: isNewData,
      };
      next.props.columns = (next.props.columns || []).map((column: any) => {
        const child = column.rule?.[0];
        const childPermission = child && permissions.find((item) => item.id === `${rule.field}>${child.field}`);
        if (!child || !childPermission) return { ...column, hidden: true };
        return {
          ...column,
          hidden: column.hidden === true || !childPermission.visible,
          rule: [{ ...child, hidden: child.hidden === true || !childPermission.visible, props: { ...(child.props || {}), disabled: child.props?.disabled === true || !childPermission.editable } }],
        };
      });
      return next;
    }
    if (!permission) return { ...next, hidden: true };
    next.hidden = next.hidden === true || !permission.visible;
    next.props.disabled = next.props.disabled === true || !permission.editable;
    return next;
  });
}
</script>

<style scoped lang="scss">
.detail-page {
  padding: 12px;
}

.loading-wrap {
  padding: 40px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
}

.detail-card {
  padding: 16px;
}

.detail-title {
  margin-bottom: 12px;
  color: var(--mobile-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.json-fallback {
  color: var(--mobile-text-secondary);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-footer-actions {
  padding: 12px 16px;
}
</style>
