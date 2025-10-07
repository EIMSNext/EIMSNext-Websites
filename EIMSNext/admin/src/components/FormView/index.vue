<template>
  <div class="form-wrapper">
    <formCreate ref="fcInst" :modelValue="dataRef" :rule="rules" :option="options" :isView="isView" />
    <div v-if="actions" class="form-actions">
      <el-button v-if="actions.submit && actions.submit.visible" type="primary" @click="handleSubmit">
        {{ t(actions.submit.text || "提交") }}</el-button>
      <el-button v-if="actions.draft && actions.draft.visible" @click="handleDraft">
        {{ t(actions.draft.text || "存为草稿") }}</el-button>
      <el-button v-if="actions.reset && actions.reset.visible" @click="handleReset">
        {{ t(actions.reset.text || "重置") }}</el-button>
      <el-button v-if="actions.approve && actions.approve.visible" type="primary" @click="handleApprove">
        {{ t(actions.approve.text || "同意") }}</el-button>
      <el-button v-if="actions.reject && actions.reject.visible" @click="handleReject">
        {{ t(actions.reject.text || "驳回") }}</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import formCreate from "@eimsnext/form-render-elplus";
import { FormContent, FormData } from "@eimsnext/models";
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
    actions?: FormActionSettings
  }>(),
  {
    isView: false
  }
);

const fcInst = ref<any>(null)
const rules = ref(formCreate.parseJson(props.def.layout!));
const options = ref(formCreate.parseJson(props.def.options!));
const dataRef = ref<any>(props.data?.data)

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
