<template>
  <et-drawer :modelValue="modelValue" :closing="beforeClose" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
    </template>
    <template #top-center>
      <el-tabs v-model="activeName" class="nav-tabs" :before-leave="tabChanging">
        <el-tab-pane :label="t('admin.formEdit.design')" name="formedit" />
        <el-tab-pane v-if="usingFlow" :label="t('admin.formEdit.workflow')" name="workflow" />
        <el-tab-pane :label="t('admin.formEdit.extension')" name="extension" />
        <el-tab-pane :label="t('admin.formEdit.publish')" name="publish" />
      </el-tabs>
    </template>
    <div v-if="loadedTabs.formedit" v-show="activeName == 'formedit'">
      <FormBuilder ref="formBuilder" :locale="locale" :formDef="formDefRef" @save="onSave" />
    </div>
    <div v-if="usingFlow && loadedTabs.workflow" v-show="activeName == 'workflow'" class="main-content-container">
      <WorkflowDesigner ref="wfDesigner" :appId="formDef.appId" :formId="formDef.id" />
    </div>
    <div v-if="loadedTabs.extension" v-show="activeName == 'extension'" class="main-content-container">
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
import { AdminPermissionSnapshot, FieldType, FormContent, FormDef, ScopeMode } from "@eimsnext/models";
import { useFormStore, useContextStore } from "@eimsnext/store";
import { ConfirmResult, EtConfirm, MessageIcon } from "@eimsnext/components";
import { useI18n } from "vue-i18n";
import { formDefService, systemService } from "@eimsnext/services";

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
const adminPermissions = ref<AdminPermissionSnapshot>();
const activeName = ref("formedit");
const loadedTabs = ref<Record<string, boolean>>({
  formedit: true,
  workflow: false,
  extension: false,
  publish: false,
});

watch(activeName, (tabName) => {
  loadedTabs.value[tabName] = true;
}, { immediate: true });

type FormRuleNode = {
  field?: string;
  type?: string;
  props?: Record<string, any>;
  children?: FormRuleNode[];
  columns?: FormRuleNode[];
  subForm?: FormRuleNode[];
  [key: string]: any;
};

const scopeFieldTypes = new Set<string>([
  FieldType.Department1,
  FieldType.Department2,
  FieldType.Employee1,
  FieldType.Employee2,
]);

const parseLayout = (layout: unknown): { root?: FormRuleNode | FormRuleNode[]; fromString: boolean } => {
  if (!layout) return { fromString: false };
  if (typeof layout === "string") {
    try {
      return { root: JSON.parse(layout), fromString: true };
    } catch {
      return { fromString: true };
    }
  }

  return { root: layout as FormRuleNode | FormRuleNode[], fromString: false };
};

const visitRuleNodes = (root: unknown, visitor: (node: FormRuleNode) => void) => {
  const visit = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== "object") return;

    const rule = node as FormRuleNode;
    visitor(rule);
    visit(rule.children);
    visit(rule.columns);
    visit(rule.subForm);
    visit(rule.rule);
  };

  visit(root);
};

const collectScopedFieldKeys = (content?: FormContent) => {
  const fieldKeys = new Set<string>();
  const { root } = parseLayout(content?.layout);
  visitRuleNodes(root, (rule) => {
    if (rule.field && scopeFieldTypes.has(String(rule.type))) fieldKeys.add(rule.field);
  });
  return fieldKeys;
};

const loadAdminPermissions = async () => {
  if (!adminPermissions.value) adminPermissions.value = await systemService.getAdminPermissions();
  return adminPermissions.value;
};

const getManagedDepartmentIds = async () => {
  const permissions = await loadAdminPermissions();
  if (!permissions.isNormalAdmin) return [];
  if (permissions.contactManageDepartmentScopeMode !== ScopeMode.Partial) return [];
  return permissions.contactManageDepartmentIds || [];
};

const applyDefaultAdminScopes = async (content: FormContent) => {
  const managedDepartmentIds = await getManagedDepartmentIds();
  if (managedDepartmentIds.length === 0) return content;

  const previousFieldKeys = collectScopedFieldKeys(formDefRef.value.content);
  const layout = parseLayout(content.layout);
  let changed = false;

  visitRuleNodes(layout.root, (rule) => {
    if (!rule.field || previousFieldKeys.has(rule.field) || !scopeFieldTypes.has(String(rule.type))) return;

    const props = rule.props || {};
    const hasManualScope = props.limitType === "custom" || (Array.isArray(props.limitScope) && props.limitScope.length > 0);
    if (hasManualScope) return;

    rule.props = {
      ...props,
      limitType: "custom",
      limitScope: [...managedDepartmentIds],
    };
    changed = true;
  });

  if (changed && layout.fromString && layout.root) {
    content.layout = JSON.stringify(layout.root);
  }

  return content;
};

const onSave = async (content: FormContent) => {
  const scopedContent = await applyDefaultAdminScopes(content);
  let req = {
    id: props.formDef.id,
    appId: props.formDef.appId,
    name: formName.value,
    content: scopedContent,
  };

  let resp = await formDefService.patch<FormDef>(req.id, req);
  formDefRef.value = resp;
  formBuilder.value?.resetDirty(scopedContent);
  formStore.update(resp);
  contextStore.setAppChanged(); //reload 菜单

  ElMessage.success(t("admin.formEdit.saveSuccess"));
};
const tabChanging = async (activeName: TabPaneName, oldActiveName: TabPaneName) => {
  return await askSave(oldActiveName.toString());
};

const askSave = async (tabName: string): Promise<boolean> => {
  if (tabName === "formedit" && formBuilder.value.isDirty()) {
    let confirm = await EtConfirm.showDialog(
      t("admin.formEdit.designDirtyContent"),
      {
        title: t("admin.formEdit.designDirtyTitle"),
        icon: MessageIcon.Question,
        showCancel: true,
        showNoSave: true,
        okText: t("admin.formEdit.saveAndContinue"),
      },
      t
    );
    if (confirm == ConfirmResult.Yes) formBuilder.value.onSave();
    else if (confirm == ConfirmResult.No) formBuilder.value.onCancel();

    return confirm != ConfirmResult.Cancel;
  } else if (tabName === "workflow" && wfDesigner.value?.isDirty()) {
    let confirm = await EtConfirm.showDialog(
      t("admin.formEdit.workflowDirtyContent"),
      {
        title: t("admin.formEdit.workflowDirtyTitle"),
        icon: MessageIcon.Question,
        showCancel: true,
        showNoSave: true,
        okText: t("admin.formEdit.saveAndContinue"),
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
  console.log("[FormEdit] close: closing FormEdit drawer");
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
