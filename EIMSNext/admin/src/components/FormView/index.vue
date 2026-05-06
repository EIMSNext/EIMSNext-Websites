<template>
  <div class="form-wrapper">
    <div class="data-container">
      <formCreate
        ref="fcInst"
        :modelValue="dataRef"
        :rule="rules"
        :option="options"
        :preview="isView"
      />
    </div>
    <div v-if="actions" class="form-actions">
      <el-button
        v-if="actions.submit && (!actions.submit.visible || actions.submit.visible)"
        type="primary"
        :disabled="actions.submit.disabled"
        @click="handleSubmit"
      >
        {{ t(actions.submit.text) }}
      </el-button>
      <el-button
        v-if="actions.draft && (!actions.draft.visible || actions.draft.visible)"
        :disabled="actions.draft.disabled"
        @click="handleDraft"
      >
        {{ t(actions.draft.text) }}
      </el-button>
      <el-button
        v-if="actions.reset && (!actions.reset.visible || actions.reset.visible)"
        :disabled="actions.reset.disabled"
        @click="handleReset"
      >
        {{ t(actions.reset.text) }}
      </el-button>
      <el-button
        v-if="actions.approve && (!actions.approve.visible || actions.approve.visible)"
        type="primary"
        :disabled="actions.approve.disabled"
        @click="handleApprove"
      >
        {{ t(actions.approve.text) }}
      </el-button>
      <el-button
        v-if="actions.reject && (!actions.reject.visible || actions.reject.visible)"
        :disabled="actions.reject.disabled"
        @click="handleReject"
      >
        {{ t(actions.reject.text) }}
      </el-button>
      <el-button
        v-if="actions.withdraw && (!actions.withdraw.visible || actions.withdraw.visible)"
        :disabled="actions.withdraw.disabled"
        @click="handleWithdraw"
      >
        {{ t(actions.withdraw.text) }}
      </el-button>
      <el-button
        v-if="actions.urge && (!actions.urge.visible || actions.urge.visible)"
        :disabled="actions.urge.disabled"
        @click="handleUrge"
      >
        {{ t(actions.urge.text) }}
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import formCreate from "@eimsnext/form-render-elplus";
import { FieldType, FormContent, FormData, IFieldPerm } from "@eimsnext/models";
import { FormActionSettings } from "./type";
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
    actions?: FormActionSettings;
    fieldPerms?: IFieldPerm[];
  }>(),
  {
    isView: false,
  }
);

const fcInst = ref<any>(null);
const rules = ref(formCreate.parseJson(props.def.layout!));
const options = ref(formCreate.parseJson(props.def.options!));
const dataRef = ref<any>(props.data?.data);

if (props.fieldPerms && props.fieldPerms.length > 0) {
  let layout = formCreate.parseJson(props.def.layout!);
  layout.forEach((x) => {
    if (x.type == FieldType.TableForm) {
      let perm = props.fieldPerms?.find((p) => p.id == x.field);
      if (perm) {
        x.hidden = !perm.visible;
        if (x.props) x.props = { ...x.props, disabled: !perm.editable };
        else x.props = { disabled: !perm.editable };
      } else {
        x.hidden = true;
      }

      let xProps: any = x.props;
      if (xProps?.columns && xProps?.columns.length > 0) {
        xProps.columns.forEach((c: any) => {
          if (c.rule && c.rule.length > 0) {
            let f = c.rule[0];
            let fPerm = props.fieldPerms?.find((p) => p.id == `${x.field}>${f.field}`);
            if (fPerm) {
              x.hidden = !fPerm.visible;
              if (f.props) f.props = { ...f.props, disabled: !fPerm.editable };
              else f.props = { disabled: !fPerm.editable };
            } else {
              x.hidden = true;
            }
          }
        });
      }
    } else {
      let perm = props.fieldPerms?.find((p) => p.id == x.field);
      if (perm) {
        x.hidden = !perm.visible;
        if (x.props) x.props = { ...x.props, disabled: !perm.editable };
        else x.props = { disabled: !perm.editable };
      } else {
        x.hidden = true;
      }
    }
  });

  rules.value = layout;
}

const emit = defineEmits(["draft", "submit", "cancel", "approve", "reject", "withdraw", "urge"]);
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
    margin-top: var(--et-space-10);
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
    padding: 0 8px;
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
