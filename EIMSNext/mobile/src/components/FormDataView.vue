<template>
  <MobilePage :title="isAdd ? t('mobile.formData.addTitle') : t('mobile.formData.detailTitle')" @back="handleBack">
    <template #right>
      <van-button v-if="!isAdd && !editing && canEdit && !workflowLocked" size="mini" plain @click="enterEdit">
        {{ t("mobile.formData.edit") }}
      </van-button>
      <van-button v-else-if="editing" size="mini" plain @click="cancelEdit">
        {{ t("common.cancel") }}
      </van-button>
    </template>

    <div class="detail-page">
      <div v-if="loading" class="loading-wrap">{{ t("common.loading") }}</div>
      <van-empty v-else-if="loadError" image="error" :description="t('admin.formData.dataNotAvailable')">
        <van-button size="small" @click="loadData">{{ t("common.retry") }}</van-button>
      </van-empty>
      <div v-else class="detail-card mobile-card">
        <div class="detail-title">{{ formDef?.name }}</div>

        <MobileFormRenderer
          v-if="renderRule.length > 0"
          v-model="formData"
          :rule="renderRule"
          :option="renderOption"
          :preview="!editing"
          @settled="syncBaseline"
        />

        <van-empty v-else class="unsupported-tip" :description="t('mobile.formData.mobileUnsupported')" />
      </div>
    </div>

    <template v-if="isAdd || editing" #footer>
      <div class="detail-footer-actions">
        <van-button class="footer-btn" block :loading="saving" :disabled="saving" @click="handleSave()">{{ t("common.save") }}</van-button>
        <van-button
          v-if="formDef?.usingWorkflow"
          class="footer-btn"
          block
          type="primary"
          :loading="saving"
          :disabled="saving"
          @click="handleSubmit"
        >{{ t("common.submit") }}</van-button>
      </div>
    </template>
  </MobilePage>

  <van-dialog
    v-model:show="showDiscardConfirm"
    :message="t('mobile.formData.discardConfirm')"
    :close-on-popstate="false"
    show-cancel-button
    @confirm="confirmDiscard"
    @cancel="showDiscardConfirm = false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { useI18n } from "vue-i18n";
import { DataAction, FieldType, FlowStatus, FormDataPermissions, type FormDataPermissionGroup, type FormData, type FormDef, type FormFieldPermission } from "@eimsnext/models";
import FormCreateMobile from "@eimsnext/form-render-vant";
import { FlagEnum, useSubmitGuard } from "@eimsnext/utils";
import MobileFormRenderer from "@/components/form/MobileFormRenderer.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataPermissionGroupServiceMobile, formDataServiceMobile, formServiceMobile } from "@/services/mobileService";
import { markErrorHandled } from "@/utils/httpFeedback";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const formId = route.params.formId as string;
const dataId = route.params.dataId as string | undefined;
const permissionGroupId = computed(() => String(route.query.permissionGroupId || ""));

// 与 PC 端 FormView 一致的字段分组：选项类字段需要清理默认值，人员/部门类字段需要数据源上下文
const optionFieldTypes = new Set<FieldType>([
  FieldType.Radio,
  FieldType.CheckBox,
  FieldType.Select1,
  FieldType.Select2,
]);
const memberFieldTypes: FieldType[] = [
  FieldType.Employee1,
  FieldType.Employee2,
  FieldType.Department1,
  FieldType.Department2,
];

const loading = ref(false);
const saving = ref(false);
const { run: runSave } = useSubmitGuard();
const formDef = ref<FormDef>();
const formData = ref<Record<string, unknown>>({});
const currentData = ref<FormData>();
const editSnapshot = ref<Record<string, unknown>>({});
const loadError = ref(false);
const permissionGroup = ref<FormDataPermissionGroup>();
const formFieldPermissions = computed<FormFieldPermission[] | undefined>(() => permissionGroup.value?.formFieldPermissions);
const showDiscardConfirm = ref(false);
const leaveConfirmed = ref(false);

const isAdd = computed(() => !dataId || Boolean(route.meta.isAdd));
const canAdd = computed(() => !permissionGroup.value || FlagEnum.has(permissionGroup.value.formDataPermissions, FormDataPermissions.AddNew));
const canEdit = computed(() => !permissionGroup.value || FlagEnum.has(permissionGroup.value.formDataPermissions, FormDataPermissions.Edit));
// 与 PC 端 FormDataView 一致：流程审批中的数据（非草稿态）锁定编辑；新增页不锁定
const workflowLocked = computed(() => !isAdd.value && Boolean(formDef.value?.usingWorkflow) && currentData.value?.flowStatus !== FlowStatus.Draft);
// 新增页直接进入编辑态；详情页默认只读，点「编辑」才切编辑（与 PC isView 默认 true 一致）
const editing = ref(isAdd.value);

const renderRule = computed(() => {
  const layout = formDef.value?.content?.layout;
  if (!layout) return [];
  try {
    const rules = FormCreateMobile.parseJson(layout);
    if (isExistingData()) clearExistingOptionDefaults(rules);
    addMemberSourceContext(rules);
    return reactive(applyFieldPermissions(rules, formFieldPermissions.value, isAdd.value));
  } catch {
    return [];
  }
});

const renderOption = computed(() => {
  let parsed: Record<string, unknown> = {};
  try {
    const options = FormCreateMobile.parseJson(formDef.value?.content?.options || "{}");
    if (options && typeof options === "object") parsed = options as unknown as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  return {
    ...parsed,
    submitBtn: false,
    resetBtn: false,
    form: { ...(parsed.form as Record<string, unknown> | undefined), labelPosition: "top" },
  };
});

const goBack = () => router.back();

const isExistingData = () => !isAdd.value && Boolean(currentData.value?.id);

// 与 PC 端 FormView 一致：回显数据时清掉选项类字段的默认值，
// 避免空字段落入 rule.value 默认值、保存时写入脏数据
const clearExistingOptionDefaults = (nodes: any[]) => {
  nodes.forEach((rule) => {
    if (rule && optionFieldTypes.has(rule.type) && rule.field) {
      rule.value = rule.type === FieldType.CheckBox || rule.type === FieldType.Select2 ? [] : undefined;
    }
    if (Array.isArray(rule?.children)) clearExistingOptionDefaults(rule.children);
    if (Array.isArray(rule?.columns)) clearExistingOptionDefaults(rule.columns);
    if (Array.isArray(rule?.rule)) clearExistingOptionDefaults(rule.rule);
    if (Array.isArray(rule?.subForm)) clearExistingOptionDefaults(rule.subForm);
    if (Array.isArray(rule?.props?.columns)) {
      rule.props.columns.forEach((column: any) => {
        if (Array.isArray(column?.rule)) clearExistingOptionDefaults(column.rule);
      });
    }
  });
};

// 与 PC 端 FormView 一致：人员/部门字段需要 sourceMode 上下文才会走表单数据源
// （自定义部门范围 limitType:custom 的运行时下发），缺省时按 management 全量拉取
const addMemberSourceContext = (nodes: any[], parentField?: string) => {
  nodes.forEach((rule) => {
    if (!rule) return;

    const fieldId = parentField && rule.field ? `${parentField}>${rule.field}` : rule.field;
    if (memberFieldTypes.includes(rule.type)) {
      rule.props = {
        ...(rule.props || {}),
        sourceMode: "form-runtime",
        formId: formId,
        fieldId: fieldId || "",
      };
    }

    if (Array.isArray(rule.children)) addMemberSourceContext(rule.children, parentField);
    if (Array.isArray(rule.columns)) {
      rule.columns.forEach((column: any) => {
        if (Array.isArray(column?.rule)) addMemberSourceContext(column.rule, fieldId);
      });
    }
    if (Array.isArray(rule.props?.columns)) {
      rule.props.columns.forEach((column: any) => {
        if (Array.isArray(column?.rule)) addMemberSourceContext(column.rule, fieldId);
      });
    }
  });
};

const enterEdit = () => {
  editing.value = true;
  editSnapshot.value = JSON.parse(JSON.stringify(formData.value || {}));
};

// form-create 生成/刷新完成后同步脏检查基线：其生成期写入的控件初始值不算用户修改
// （新增页一进入就会写入如 days:1 的初始值，不同步基线会误弹丢弃确认）
const syncBaseline = () => {
  editSnapshot.value = JSON.parse(JSON.stringify(formData.value || {}));
};

const cancelEdit = () => {
  editing.value = false;
  formData.value = JSON.parse(JSON.stringify(editSnapshot.value));
};

const isDirty = () => JSON.stringify(formData.value || {}) !== JSON.stringify(editSnapshot.value || {});

const handleBack = () => {
  if (editing.value && isDirty()) {
    showDiscardConfirm.value = true;
    return;
  }
  goBack();
};

// 覆盖 header 返回之外的离开路径（Android 返回手势/浏览器返回）：脏数据先确认
onBeforeRouteLeave(() => {
  if (leaveConfirmed.value) return true;
  if (editing.value && isDirty()) {
    showDiscardConfirm.value = true;
    return false;
  }
  return true;
});

const confirmDiscard = () => {
  showDiscardConfirm.value = false;
  leaveConfirmed.value = true;
  goBack();
};

const handleSave = (action = DataAction.Save) => runSave(async () => {
  if (isAdd.value && !canAdd.value) {
    showToast(t("mobile.formData.noAddPermission"));
    return;
  }
  if (!isAdd.value && !canEdit.value) {
    showToast(t("mobile.formData.noEditPermission"));
    return;
  }
  if (workflowLocked.value) {
    showToast(t("mobile.formData.workflowLocked"));
    return;
  }
  saving.value = true;
  try {
    if (isAdd.value && formDef.value) {
      await formDataServiceMobile.post(formDef.value, formData.value, action);
    } else if (currentData.value) {
      await formDataServiceMobile.put(currentData.value, formData.value, action);
    }
    showToast(t("common.saveSuccess"));
    // 保存后同步快照：离开时的脏检查守卫不应把已保存的数据误判为未保存修改
    editSnapshot.value = JSON.parse(JSON.stringify(formData.value || {}));
    if (action === DataAction.Save && !isAdd.value) {
      // 保存草稿后停留在详情并退出编辑态（与 PC saveDraft 行为一致）
      editing.value = false;
    } else {
      router.back();
    }
  } catch (error) {
    markErrorHandled(error);
    showToast(t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
});

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
      editSnapshot.value = JSON.parse(JSON.stringify(formData.value || {}));
    }
  } catch (error) {
    markErrorHandled(error);
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

.unsupported-tip {
  padding: 24px 0;
}

.detail-footer-actions {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}

.footer-btn {
  flex: 1;
}
</style>
