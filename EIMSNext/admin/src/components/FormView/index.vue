<template>
  <div class="form-wrapper">
    <formCreate ref="fcInst" :modelValue="dataRef" :rule="rules" :option="options" :preview="isView" />
    <div v-if="actions" class="form-actions">
      <el-button v-if="actions.submit && (!actions.submit.visible || actions.submit.visible)" type="primary"
        :disabled="actions.submit.disabled" @click="handleSubmit">
        {{ t(actions.submit.text) }}</el-button>
      <el-button v-if="actions.draft && (!actions.draft.visible || actions.draft.visible)"
        :disabled="actions.draft.disabled" @click="handleDraft">
        {{ t(actions.draft.text) }}</el-button>
      <el-button v-if="actions.reset && (!actions.reset.visible || actions.reset.visible)"
        :disabled="actions.reset.disabled" @click="handleReset">
        {{ t(actions.reset.text) }}</el-button>
      <el-button v-if="actions.approve && (!actions.approve.visible || actions.approve.visible)" type="primary"
        :disabled="actions.approve.disabled" @click="handleApprove">
        {{ t(actions.approve.text) }}</el-button>
      <el-button v-if="actions.reject && (!actions.reject.visible || actions.reject.visible)"
        :disabled="actions.reject.disabled" @click="handleReject">
        {{ t(actions.reject.text) }}</el-button>
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
    actions?: FormActionSettings,
    fieldPerms?: IFieldPerm[]
  }>(),
  {
    isView: false
  }
);

const fcInst = ref<any>(null)
const rules = ref(formCreate.parseJson(props.def.layout!));
const options = ref(formCreate.parseJson(props.def.options!));
const dataRef = ref<any>(props.data?.data)

// console.log("layout", rules.value)
if (props.fieldPerms && props.fieldPerms.length > 0) {
  let layout = formCreate.parseJson(props.def.layout!);
  layout.forEach(x => {
    if (x.type == FieldType.TableForm) {
      let perm = props.fieldPerms?.find(p => p.id == x.field)
      if (perm) {
        x.hidden = !perm.visible
        if (x.props)
          x.props = { ...x.props, disabled: !perm.editable }
        else
          x.props = { disabled: !perm.editable }
      }
      else {
        x.hidden = true
      }

      let xProps: any = x.props
      if (xProps?.columns && xProps?.columns.length > 0) {
        xProps.columns.forEach((c: any) => {
          if (c.rule && c.rule.length > 0) {
            let f = c.rule[0]
            let fPerm = props.fieldPerms?.find(p => p.id == `${x.field}>${f.field}`)
            if (fPerm) {
              x.hidden = !fPerm.visible
              if (f.props)
                f.props = { ...f.props, disabled: !fPerm.editable }
              else
                f.props = { disabled: !fPerm.editable }
            }
            else {
              x.hidden = true
            }
          }
        });
      }
    }
    else {
      let perm = props.fieldPerms?.find(p => p.id == x.field)
      if (perm) {
        x.hidden = !perm.visible
        if (x.props)
          x.props = { ...x.props, disabled: !perm.editable }
        else
          x.props = { disabled: !perm.editable }
      }
      else {
        x.hidden = true
      }
    }
  })

  rules.value = layout;
}

// console.log("form con", rules, options);

const emit = defineEmits(["draft", "submit", "cancel", "approve", "reject"]);
const cancel = () => {
  emit("cancel");
};
const handleDraft = () => {
  let data: any = fcInst.value.fapi.formData()
  emit("draft", data)
}
const handleSubmit = () => {
  fcInst.value.fapi.validate()
    .then(() => {
      let data: any = fcInst.value.fapi.formData()
      emit("submit", data)
    })
    .catch()
}
const handleApprove = () => {
  fcInst.value.fapi.validate()
    .then(() => {
      let data: any = fcInst.value.fapi.formData()
      emit("approve", data)
    })
    .catch()
}
const handleReject = () => {
  fcInst.value.fapi.validate()
    .then(() => {
      let data: any = fcInst.value.fapi.formData()
      emit("reject", data)
    })
    .catch()
}
const handleReset = () => {
  fcInst.value.fapi.resetFields()
}
</script>
<style lang="scss" scoped>
.form-wrapper {
  padding: 20px;

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
