<template>
  <FormView v-if="formDef" :def="formDef" :data="formData" :isView="isView" :isNewData="!data?.id" :actions="actions" :formFieldPermissions="formFieldPermissions"
    @draft="saveDraft" @submit="submitData">
  </FormView>
</template>
<script lang="ts" setup>
defineOptions({
  name: "AddFormData",
});

import { ref, watch } from "vue";
import { FormData, FormContent, FormDataRequest, DataAction, FormFieldPermission } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService } from "@eimsnext/services";
import { bus } from "@eimsnext/utils";
import { FormActionSettings } from "@/components/FormView/type";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    formId: string;
    isView: boolean;
    data?: FormData;
    formFieldPermissions?: FormFieldPermission[]
  }>(),
  {
    isView: false,
  }
);

const actions = ref<FormActionSettings>({ draft: { text: "common.wfProcess.saveDraft" }, submit: { text: "common.wfProcess.submit" }, reset: { text: "common.reset" } })

const appId = ref("");
const formStore = useFormStore();
const formDef = ref<FormContent>();
const formData = ref(props.data);

// 添加watch监听props.data的变化，确保formData始终与props.data保持同步
watch(
  () => props.data,
  (newData) => {
    formData.value = newData;
  },
  { deep: true }
);

if (props.formId) {
  void (async () => {
    try {
      const form = await formStore.get(props.formId);
      if (form) {
        appId.value = form.appId;
        const content = form.content ?? new FormContent();
        formDef.value = {
          ...content,
          layout: content.layout || "[]",
          options: content.options || "{}",
        };
      }
    } catch {
      ElMessage.error(t("common.loadFailed"));
    }
  })();
}

const emit = defineEmits(["update:modelValue", "cancel", "save", "submit"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};
const restoreActions = () => {
  if (actions.value.draft) actions.value.draft.disabled = false;
  if (actions.value.submit) actions.value.submit.disabled = false;
  if (actions.value.reset) actions.value.reset.disabled = false;
};

const saveDraft = async (data: any) => {
  let fdata: FormDataRequest = {
    action: DataAction.Save,
    id: props.data?.id ?? "",
    appId: appId.value,
    formId: props.formId,
    data: data,
  };

  // 根据是否有props.data?.id判断是新增还是编辑
  try {
    const res = props.data?.id ?
      await formDataService.put<FormData>(props.data.id, fdata) :
      await formDataService.post<FormData>(fdata);
    formData.value = res;
    emit("save", res);
    bus.emit("data:saved", { formId: props.formId });
  } catch {
    ElMessage.error(t("common.saveFailed"));
  }
};
const submitData = async (data: any) => {
  if (actions.value.draft)
    actions.value.draft.disabled = true

  if (actions.value.submit)
    actions.value.submit.disabled = true

  if (actions.value.reset)
    actions.value.reset.disabled = true

  let fdata: FormDataRequest = {
    action: DataAction.Submit,
    id: props.data?.id ?? "",
    appId: appId.value,
    formId: props.formId,
    data: data,
  };
  // 根据是否有props.data?.id判断是新增还是编辑
  try {
    const res = props.data?.id ?
      await formDataService.put<FormData>(props.data.id, fdata) :
      await formDataService.post<FormData>(fdata);
    formData.value = res;
    emit("submit", res);
    bus.emit("data:saved", { formId: props.formId });
  } catch {
    ElMessage.error(t("common.saveFailed"));
    restoreActions();
  }
};
</script>
