<template>
  <div class="form-wrapper">
    <div class="data-container">
      <formCreate ref="fcInst" :modelValue="dataRef" :rule="rules" :option="options" :preview="isView" />
    </div>
    <div v-if="actions" class="form-actions">
      <el-button v-if="actions.submit && (!actions.submit.visible || actions.submit.visible)" type="primary"
        :disabled="actions.submit.disabled" @click="handleSubmit">
        {{ t(actions.submit.text) }}
      </el-button>
      <el-button v-if="actions.draft && (!actions.draft.visible || actions.draft.visible)"
        :disabled="actions.draft.disabled" @click="handleDraft">
        {{ t(actions.draft.text) }}
      </el-button>
      <el-button v-if="actions.reset && (!actions.reset.visible || actions.reset.visible)"
        :disabled="actions.reset.disabled" @click="handleReset">
        {{ t(actions.reset.text) }}
      </el-button>
      <el-button v-if="actions.approve && (!actions.approve.visible || actions.approve.visible)" type="primary"
        :disabled="actions.approve.disabled" @click="handleApprove">
        {{ t(actions.approve.text) }}
      </el-button>
      <el-button v-if="actions.reject && (!actions.reject.visible || actions.reject.visible)"
        :disabled="actions.reject.disabled" @click="handleReject">
        {{ t(actions.reject.text) }}
      </el-button>
      <el-button v-if="actions.withdraw && (!actions.withdraw.visible || actions.withdraw.visible)"
        :disabled="actions.withdraw.disabled" @click="handleWithdraw">
        {{ t(actions.withdraw.text) }}
      </el-button>
      <el-button v-if="actions.urge && (!actions.urge.visible || actions.urge.visible)"
        :disabled="actions.urge.disabled" @click="handleUrge">
        {{ t(actions.urge.text) }}
      </el-button>
      <el-button v-for="action in visibleCustomActions" :key="action.key"
        :type="action.type === 'default' ? undefined : action.type" :disabled="action.disabled"
        @click="handleCustomAction(action)">
        {{ t(action.text) }}
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import formCreate from "@eimsnext/form-render-elplus";
import { FieldType, FormContent, FormData, FormFieldPermission } from "@eimsnext/models";
import { FormActionSettings, FormCustomAction } from "./type";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "FormView",
});

const props = withDefaults(
  defineProps<{
    def: FormContent;
    data?: FormData;
    isView?: boolean;
    isPublic?: boolean;
    publicToken?: string;
    isNewData?: boolean;
    actions?: FormActionSettings;
    formFieldPermissions?: FormFieldPermission[];
  }>(),
  {
    isView: false,
    isPublic: false,
    isNewData: false,
  }
);

const fcInst = ref<any>(null);
const optionFieldTypes = new Set([
  FieldType.Radio,
  FieldType.CheckBox,
  FieldType.Select1,
  FieldType.Select2,
]);

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

const parsedRules = formCreate.parseJson(props.def.layout!);
const isExistingData = !!props.data?.id && !props.isNewData;
if (isExistingData) {
  clearExistingOptionDefaults(parsedRules);
}
const rules = ref(parsedRules);
const parsedOptions: any = formCreate.parseJson(props.def.options!);
if (props.isPublic && props.publicToken) {
  const originalBeforeFetch = parsedOptions.beforeFetch;
  parsedOptions.beforeFetch = async (request: any, context: any) => {
    if (typeof originalBeforeFetch === "function") {
      await originalBeforeFetch(request, context);
    }
    request.__eimsPublicToken = props.publicToken;
    request.headers = {
      ...(request.headers || {}),
      Authorization: `Bearer ${props.publicToken}`,
    };
  };
}
const options = ref(parsedOptions);
const dataRef = ref<any>(props.data?.data);
const visibleCustomActions = computed(() => props.actions?.customActions?.filter((x) => x.visible !== false) || []);

watch(
  () => props.data?.data,
  (value) => {
    const nextValue = value || {};
    dataRef.value = nextValue;

    const fapi = fcInst.value?.fapi;
    if (!fapi) return;

    if (typeof fapi.coverValue === "function") {
      fapi.coverValue(nextValue);
    } else {
      fapi.setValue(nextValue);
    }
  }
);

if (props.formFieldPermissions !== undefined) {
  let layout = formCreate.parseJson(props.def.layout!);
  if (isExistingData) clearExistingOptionDefaults(layout);
  layout.forEach((x) => {
    if (x.type == FieldType.TableForm) {
      let perm = props.formFieldPermissions?.find((p) => p.id == x.field);
      if (perm) {
        x.hidden = x.hidden === true || !perm.visible;
        const tableProps: Record<string, any> = typeof x.props === "object" ? x.props : {};
        x.props = {
          ...tableProps,
          disabled: tableProps.disabled === true || !perm.editable,
          addable: tableProps.addable !== false && perm.tableInsert === true,
          deletable: tableProps.deletable !== false && perm.tableDelete === true,
          editable: perm.tableEdit === true,
          initialRowsAreNew: props.isNewData,
        };
      } else {
        x.hidden = true;
      }

      let xProps: any = x.props;
      if (xProps?.columns && xProps?.columns.length > 0) {
        xProps.columns.forEach((c: any) => {
          if (c.rule && c.rule.length > 0) {
            let f = c.rule[0];
            let fPerm = props.formFieldPermissions?.find((p) => p.id == `${x.field}>${f.field}`);
            if (fPerm) {
              c.hidden = c.hidden === true || !fPerm.visible;
              f.hidden = f.hidden === true || !fPerm.visible;
              const fieldProps: Record<string, any> = typeof f.props === "object" ? f.props : {};
              f.props = {
                ...fieldProps,
                disabled: fieldProps.disabled === true || !fPerm.editable,
              };
            } else {
              c.hidden = true;
              f.hidden = true;
            }
          }
        });
      }
    } else {
      let perm = props.formFieldPermissions?.find((p) => p.id == x.field);
      if (perm) {
        x.hidden = x.hidden === true || !perm.visible;
        const fieldProps: Record<string, any> = typeof x.props === "object" ? x.props : {};
        x.props = {
          ...fieldProps,
          disabled: fieldProps.disabled === true || !perm.editable,
        };
      } else {
        x.hidden = true;
      }
    }
  });

  rules.value = layout;
}

const emit = defineEmits(["draft", "submit", "cancel", "approve", "reject", "withdraw", "urge", "action"]);
const cancel = () => {
  emit("cancel");
};
const handleDraft = () => {
  let data: any = fcInst.value.fapi.formData();
  emit("draft", data);
};
const handleSubmit = () => {
  fcInst.value.fapi
    .validate()
    .then(() => {
      let data: any = fcInst.value.fapi.formData();
      emit("submit", data);
    })
    .catch();
};
const handleApprove = () => {
  fcInst.value.fapi
    .validate()
    .then(() => {
      let data: any = fcInst.value.fapi.formData();
      emit("approve", data);
    })
    .catch();
};
const handleReject = () => {
  fcInst.value.fapi
    .validate()
    .then(() => {
      let data: any = fcInst.value.fapi.formData();
      emit("reject", data);
    })
    .catch();
};
const handleWithdraw = () => {
  emit("withdraw");
};
const handleUrge = () => {
  emit("urge");
};
const handleReset = () => {
  fcInst.value.fapi.resetFields();
};
const handleCustomAction = (action: FormCustomAction) => {
  if (action.requiresValidate) {
    fcInst.value.fapi
      .validate()
      .then(() => {
        const data: any = fcInst.value.fapi.formData();
        emit("action", action.key, data);
      })
      .catch();
    return;
  }

  const data: any = fcInst.value.fapi.formData();
  emit("action", action.key, data);
};

function setValues(values: Record<string, any>) {
  fcInst.value?.fapi?.setValue(values);
}

function getFormData(includeIgnored = false) {
  return fcInst.value?.fapi?.formData(includeIgnored === true) || {};
}

defineExpose({
  setValues,
  getFormData,
});
</script>
<style lang="scss" scoped>
.form-wrapper {
  padding: var(--et-space-20);

  &.editdata {
    padding-top: var(--et-space-10);
    border-top: 1px solid var(--et-border-color);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--et-space-15);
    padding-right: var(--et-space-20);
  }

  :deep(._fc-table-form-v2) {
    overflow: auto;
  }

  :deep(._fc-table-form-v2 .fc-form-row) {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  :deep(._fc-table-form-v2 .fc-form-col) {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  :deep(.form-create.is-preview ._fc-table-form-v2 ._fc-read-view) {
    min-height: 28px;
    padding: 0;
  }

  :deep(._fc-table-form-v2 .el-table th.el-table__cell) {
    background-color: var(--el-fill-color-light);
  }

  :deep(._fc-table-form-v2 .el-table td.el-table__cell),
  :deep(._fc-table-form-v2 .el-table th.el-table__cell) {
    padding: 6px 0;
  }

  :deep(._fc-table-form-v2 .el-table .cell) {
    line-height: 18px;
  }

  :deep(._fc-table-form-v2 .el-scrollbar__wrap) {
    overflow: auto;
  }
}
</style>
