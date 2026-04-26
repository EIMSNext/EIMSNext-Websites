<template>
  <et-drawer :modelValue="modelValue" :closing="beforeClose" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
    </template>
    <template #top-center>
      <el-tabs v-model="activeName" class="nav-tabs" :before-leave="tabChanging">
        <el-tab-pane label="表单设计" name="formedit" />
        <el-tab-pane v-if="usingFlow" label="流程设定" name="workflow" />
        <el-tab-pane label="高级功能" name="advance" />
        <el-tab-pane label="表单发布" name="publish" />
      </el-tabs>
    </template>
    <div v-if="loadedTabs.formedit" v-show="activeName == 'formedit'">
      <FormBuilder ref="formBuilder" :locale="locale" :formDef="formDefRef" @save="onSave" />
    </div>
    <div v-if="usingFlow && loadedTabs.workflow" v-show="activeName == 'workflow'" class="main-content-container">
      <WorkflowDesigner ref="wfDesigner" :appId="formDef.appId" :formId="formDef.id" />
    </div>
    <div v-if="loadedTabs.advance" v-show="activeName == 'advance'" class="main-content-container">
      <Advanced :formDef="formDefRef!"></Advanced>
    </div>
    <div v-if="loadedTabs.publish" v-show="activeName == 'publish'" class="main-content-container">
      <Publish :formDef="formDefRef!"></Publish>
    </div>
  </et-drawer>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { TabPaneName } from "element-plus";
import "@eimsnext/form-builder/dist/index.css";
import { FormBuilder } from "@eimsnext/form-builder";
import { useSystemStore } from "@/store/system";
import { FormContent, FormDef } from "@eimsnext/models";
import { useFormStore, useContextStore } from "@eimsnext/store";
import { ConfirmResult, EtConfirm, MessageIcon } from "@eimsnext/components";
import { useI18n } from "vue-i18n";
import { formDefService } from "@eimsnext/services";

const WorkflowDesigner = defineAsyncComponent(() => import("../WorkflowDesigner/index.vue"));
const Advanced = defineAsyncComponent(() => import("./Advanced/index.vue"));
const Publish = defineAsyncComponent(() => import("./Publish/index.vue"));
const { t } = useI18n();

defineOptions({
  name: "FormEdit",
});

const props = defineProps<{
  modelValue: boolean;
  formDef: FormDef;
  usingFlow: boolean;
  isLedger: boolean;
}>();

const formStore = useFormStore();
const contextStore = useContextStore();
const formBuilder = ref<InstanceType<typeof FormBuilder>>();
const wfDesigner = ref<{ isDirty: () => boolean; save: () => void }>();
const systemStore = useSystemStore();
const locale = computed(() => systemStore.locale);

const formName = ref(props.formDef.name);
const formDefRef = ref<FormDef>(props.formDef);
const activeName = ref("formedit");
const loadedTabs = ref<Record<string, boolean>>({
  formedit: true,
  workflow: false,
  advance: false,
  publish: false,
});

watch(activeName, (tabName) => {
  loadedTabs.value[tabName] = true;
}, { immediate: true });

const onSave = async (content: FormContent) => {
  let req = {
    id: props.formDef.id,
    appId: props.formDef.appId,
    name: formName.value,
    content: content,
  };

  let resp = await formDefService.patch<FormDef>(req.id, req);
  formDefRef.value = resp;
  formStore.update(resp);
  contextStore.setAppChanged(); //reload 菜单

  ElMessage.success("保存成功");
};
const tabChanging = async (activeName: TabPaneName, oldActiveName: TabPaneName) => {
  return await askSave(oldActiveName.toString());
};

const askSave = async (tabName: string): Promise<boolean> => {
  if (tabName === "formedit" && formBuilder.value.isDirty()) {
    let confirm = await EtConfirm.showDialog(
      "你修改了表单设计但没有保存，是否需要保存表单设计并继续？",
      {
        title: "表单设计有修改，是否保存？",
        icon: MessageIcon.Question,
        showCancel: true,
        showNoSave: true,
        okText: "保存并继续",
      },
      t
    );
    if (confirm == ConfirmResult.Yes) formBuilder.value.onSave();
    else if (confirm == ConfirmResult.No) formBuilder.value.onCancel();

    return confirm != ConfirmResult.Cancel;
  } else if (tabName === "workflow" && wfDesigner.value?.isDirty()) {
    let confirm = await EtConfirm.showDialog(
      "你修改了流程设定但没有保存，是否需要保存流程设定并继续？",
      {
        title: "流程设定有修改，是否保存？",
        icon: MessageIcon.Question,
        showCancel: true,
        showNoSave: true,
        okText: "保存并继续",
      },
      t
    );
    if (confirm == ConfirmResult.Yes) wfDesigner.value.save();

    return confirm != ConfirmResult.Cancel;
  }

  return true;
};

const emit = defineEmits(["close"]);

async function beforeClose() {
  return await askSave(activeName.value);
}

function close() {
  emit("close");
}
</script>
<style lang="scss">
.title-editor {
  cursor: default;
  display: inline-block;
  height: var(--et-size-32);
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-bottom: 1px dashed var(--et-border-color-strong);

  .el-input__wrapper {
    box-shadow: none;
  }
}

.top-nav-bar .nav-tabs {
  height: var(--et-size-60);
}

.top-nav-bar .nav-tabs .el-tabs__header {
  margin: 0;
}

.top-nav-bar .nav-tabs .el-tabs__nav {
  height: var(--et-size-60);
  align-items: center;
}

.top-nav-bar .nav-tabs .el-tabs__content {
  display: none;
}

.top-nav-bar .nav-tabs .el-tabs__item:last-child:after {
  background: var(--et-border-color-light);
  content: "";
  cursor: none;
  display: block;
  height: var(--et-size-20);
  left: calc((var(--et-size-46) * -1) / 2);
  pointer-events: none;
  position: absolute;
  width: var(--et-space-2);
}

.main-content-container {
  width: 100%;
  height: 100%;
}
</style>
