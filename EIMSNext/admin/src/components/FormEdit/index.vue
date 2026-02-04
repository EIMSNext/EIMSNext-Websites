<template>
  <et-drawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
    </template>
    <template #top-center>
      <el-tabs v-model="activeName" class="nav-tabs" :before-leave="tabChanging">
        <el-tab-pane label="表单设计" name="formedit" />
        <el-tab-pane v-if="usingFlow" label="流程设定" name="workflow" />
        <el-tab-pane label="高级功能" name="advance" />
        <el-tab-pane label="表单发布" name="publish" />
        <!-- <el-tab-pane label="数据管理" name="datamanage" /> -->
      </el-tabs>
    </template>
    <div v-if="activeName == 'formedit'">
      <form-builder
        v-if="formDef"
        ref="formBuilder"
        :locale="locale"
        :formName="formName"
        :formDef="formDef"
        :usingFlow="usingFlow"
        :isLedger="isLedger"
        @save="onSaved"
      />
    </div>
    <div v-if="formDef && usingFlow && activeName == 'workflow'" class="main-content-container">
      <WorkflowDesigner ref="wfDesigner" :appId="appId" :formId="formId" />
    </div>
    <div v-if="formDef && activeName == 'advance'" class="main-content-container">
      <Advanced :formDef="formDef!"></Advanced>
    </div>
    <div v-if="formDef && activeName == 'publish'" class="main-content-container">
      <Publish :formDef="formDef!"></Publish>
    </div>
  </et-drawer>
</template>

<script setup lang="ts">
import { TabPaneName, TabsPaneContext } from "element-plus";
import "@eimsnext/form-builder/dist/index.css";
import { FormBuilder } from "@eimsnext/form-builder";
import WorkflowDesigner from "../WorkflowDesigner/index.vue";
import Advanced from "./Advanced/index.vue";
import Publish from "./Publish/index.vue";
import { useSystemStore } from "@/store/system";
import { useFormStore } from "@eimsnext/store";
import { FormDef } from "@eimsnext/models";
import { EtConfirm } from "@eimsnext/components";

defineOptions({
  name: "FormEdit",
});

const props = defineProps<{
  formId: string;
  usingFlow: boolean;
  isLedger: boolean;
}>();

const showDrawer = ref(true);
const formBuilder = ref<InstanceType<typeof FormBuilder>>();
const wfDesigner = ref<InstanceType<typeof WorkflowDesigner>>();
const systemStore = useSystemStore();
const formStore = useFormStore();
const locale = computed(() => systemStore.locale);

const appId = ref("");
const formName = ref("未命名表单");
const activeName = ref("formedit");
const formDef = ref<FormDef>();

// console.log("formid", props.formId);

const loadForm = (formId: string) => {
  formStore.get(formId).then((form) => {
    // console.log("form", form);
    if (form) {
      appId.value = form.appId;
      formDef.value = form;
      formName.value = form.name;
    }
  });
};

const onSaved = () => {
  // if (props.formId) {
  //   loadForm(props.formId);
  // }
};
const tabChanging = (activeName: TabPaneName, oldActiveName: TabPaneName) => {
  console.log("tabChanging", oldActiveName, activeName);
  if (oldActiveName === "formedit" && formBuilder.value.isDirty()) {
    let confirm = EtConfirm.showDialog("");
    if (confirm == ConfirmResult.Yes) await formBuilder.value.onSave();

    return confirm != ConfirmResult.Cancel;
  } else if (oldActiveName === "workflow" && wfDesigner.value?.isDirty()) {
    let confirm = EtConfirm.showDialog("");
    if (confirm == ConfirmResult.Yes) await wfDesigner.value.save();

    return confirm != ConfirmResult.Cancel;
  }

  return true;
};

const emit = defineEmits(["close"]);

function close() {
  emit("close");
}

onBeforeMount(() => {
  //初始化
  if (props.formId) {
    loadForm(props.formId);
  }
});
</script>
<style lang="scss">
.title-editor {
  cursor: default;
  display: inline-block;
  height: 32px;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-bottom: 1px dashed #b5b8be;

  .el-input__wrapper {
    box-shadow: none;
  }
}

.top-nav-bar .nav-tabs {
  height: 60px;
}

.top-nav-bar .nav-tabs .el-tabs__header {
  margin: 0;
}

.top-nav-bar .nav-tabs .el-tabs__nav {
  height: 60px;
  align-items: center;
}

.top-nav-bar .nav-tabs .el-tabs__content {
  display: none;
}

// .top-nav-bar .nav-tabs .el-tabs__item:last-child {
//   margin-left: 46px;
//   overflow: visible;
//   position: relative;
// }

.top-nav-bar .nav-tabs .el-tabs__item:last-child:after {
  background: #e1e3e5;
  content: "";
  cursor: none;
  display: block;
  height: 20px;
  left: -23px;
  pointer-events: none;
  position: absolute;
  width: 2px;
}

.main-content-container {
  width: 100%;
  height: 100%;
}
</style>
