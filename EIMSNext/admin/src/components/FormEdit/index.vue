<template>
  <CustomDrawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
    </template>
    <template #top-center>
      <el-tabs v-model="activeName" class="nav-tabs" @tab-click="handleClick">
        <el-tab-pane label="表单设计" name="edit" />
        <el-tab-pane v-if="usingFlow" label="流程设定" name="flow" />
        <el-tab-pane label="扩展功能" name="extension" />
        <el-tab-pane label="表单发布" name="publish" />
        <el-tab-pane label="数据管理" name="data" />
      </el-tabs>
    </template>
    <div v-if="activeName == 'edit'">
      <form-builder
        :locale="locale"
        :formName="formName"
        :formDef="formDef"
        :usingFlow="usingFlow"
        :isLedger="isLedger"
        @save="onSaved"
      />
    </div>
    <div v-if="usingFlow && activeName == 'flow'" style="height: 100%; width: 100%">
      <WorkflowDesigner :appId="appId" :formId="formId" />
    </div>
    <div v-if="activeName == 'extension'" style="height: 100%; width: 100%">
      <Advanced :formDef="formDef!"></Advanced>
    </div>
  </CustomDrawer>
</template>

<script setup lang="ts">
import { TabsPaneContext } from "element-plus";
import "@eimsnext/form-builder/dist/index.css";
import { FormBuilder } from "@eimsnext/form-builder";
import WorkflowDesigner from "../FlowDesigner/Workflow/index.vue";
import Advanced from "./Advanced/index.vue";
import { useSystemStore } from "@/store/system";
import { useFormStore } from "@eimsnext/store";
import { FormDef, EventSourceType } from "@eimsnext/models";
import CustomDrawer from "@/components/CustomDrawer/index.vue";

defineOptions({
  name: "FormEdit",
});

const props = defineProps<{
  formId: string;
  usingFlow: boolean;
  isLedger: boolean;
}>();

const showDrawer = ref(true);

const systemStore = useSystemStore();
const formStore = useFormStore();
const locale = computed(() => systemStore.locale);

const appId = ref("");
const formName = ref("测试表单");
const activeName = ref("edit");
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
  if (props.formId) {
    loadForm(props.formId);
  }
};
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
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
.top-nav-bar .nav-tabs .el-tabs__item:last-child {
  margin-left: 46px;
  overflow: visible;
  position: relative;
}
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
</style>
