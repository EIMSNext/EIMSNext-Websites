<template>
  <div class="view-publish">
    <EtConfirmDialog
      v-model="showDeleteConfirm"
      :title="t('common.message.deleteConfirm_Title')"
      :icon="MessageIcon.Warning"
      :showNoSave="false"
      @ok="execDelete"
    >
      <div>{{ t("common.message.deleteConfirm_Content2") }}</div>
    </EtConfirmDialog>
    <ViewEditorDialog
      v-if="showEditor"
      v-model="showEditor"
      :form-def="formDef"
      :view="editingView"
      :sort-index="nextSortIndex"
      @ok="saveView"
      @cancel="showEditor = false"
    />
    <ViewScopeDialog
      v-if="showScope"
      v-model="showScope"
      :view="selectedView!"
      :permission-groups="permissionGroups"
      @ok="saveScope"
      @cancel="showScope = false"
    />
    <AdvanceLayout
      :title="t('admin.formListView.styleTitle')"
      :desc="t('admin.formListView.styleDesc')"
    >
      <div class="view-panel">
        <div class="panel-header">
          <el-button type="primary" icon="plus" @click="createView">
            {{ t("admin.formListView.createView") }}
          </el-button>
        </div>
        <div v-if="views.length === 0" class="empty-view">
          {{ t("admin.formListView.emptyViews") }}
        </div>
        <div v-else class="view-grid">
          <div v-for="view in views" :key="view.id" class="view-card">
            <div class="view-card-header">
              <div class="view-name">
                <span class="view-mark"></span>
                {{ view.name }}
              </div>
              <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, view)">
                <el-button link>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon><Edit /></el-icon>
                      {{ t("common.edit") }}
                    </el-dropdown-item>
                    <el-dropdown-item command="scope">
                      <el-icon><Lock /></el-icon>
                      {{ t("admin.formListView.setScope") }}
                    </el-dropdown-item>
                    <el-dropdown-item command="copy">
                      <el-icon><CopyDocument /></el-icon>
                      {{ t("common.copy") }}
                    </el-dropdown-item>
                    <el-dropdown-item :command="view.disabled ? 'enable' : 'disable'">
                      <el-icon><Lock /></el-icon>
                      {{ view.disabled ? t("common.enable") : t("common.disabled") }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" class="danger-item">
                      <el-icon><Delete /></el-icon>
                      {{ t("common.delete") }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="view-thumb" :class="thumbClass(view)">
              <div class="thumb-table" v-if="view.pcType === FormListViewType.Table"></div>
              <template v-else-if="view.pcType === FormListViewType.Kanban">
                <div class="thumb-column" v-for="i in 3" :key="i">
                  <span></span>
                  <span></span>
                </div>
              </template>
              <template v-else>
                <div class="thumb-gallery-item" v-for="i in 4" :key="i"></div>
              </template>
            </div>
            <div class="view-card-footer">
              <el-icon><Lock /></el-icon>
              {{ scopeText(view) }}
              <el-tag size="small" :type="view.disabled ? 'info' : 'success'" effect="light">
                {{ view.disabled ? t("common.disabled") : t("common.enable") }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </AdvanceLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import buildQuery from "odata-query";
import { CopyDocument, Delete, Edit, Lock, MoreFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  FormDataPermissionGroup,
  FormDef,
  FormListView,
  FormListViewRequest,
  FormListViewType,
} from "@eimsnext/models";
import { formDataPermissionGroupService, formListViewService } from "@eimsnext/services";
import { MessageIcon } from "@eimsnext/components";
import AdvanceLayout from "../Advanced/AdvanceLayout.vue";
import ViewEditorDialog from "./ViewEditorDialog.vue";
import ViewScopeDialog from "./ViewScopeDialog.vue";

const props = defineProps<{
  formDef: FormDef;
}>();

const { t } = useI18n();
const views = ref<FormListView[]>([]);
const permissionGroups = ref<FormDataPermissionGroup[]>([]);
const showEditor = ref(false);
const showScope = ref(false);
const showDeleteConfirm = ref(false);
const editingView = ref<FormListView>();
const selectedView = ref<FormListView>();

const nextSortIndex = computed(() => {
  const max =
    views.value.length > 0 ? Math.max(...views.value.map((view) => view.sortIndex || 0)) : 0;
  return max + 100;
});

const loadViews = async () => {
  views.value = await formListViewService.query<FormListView>(
    `$filter=formid eq '${props.formDef.id}'&$orderby=sortIndex asc,createTime asc`
  );
};

const loadFormDataPermissionGroups = async () => {
  const query = buildQuery({ filter: { formId: props.formDef.id } });
  permissionGroups.value = await formDataPermissionGroupService.query<FormDataPermissionGroup>(query);
};

const createView = () => {
  editingView.value = undefined;
  showEditor.value = true;
};

const saveView = async (request: FormListViewRequest) => {
  request.appId = props.formDef.appId;
  request.formId = props.formDef.id;
  if (request.id) await formListViewService.put<FormListViewRequest>(request.id, request);
  else await formListViewService.post<FormListViewRequest>(request);
  showEditor.value = false;
  ElMessage.success(t("common.saveSuccess"));
  await loadViews();
};

const saveScope = async (permissionGroupIds: string[]) => {
  if (!selectedView.value) return;
  await formListViewService.patch<FormListViewRequest>(selectedView.value.id, {
    id: selectedView.value.id,
    permissionGroupIds,
  });
  showScope.value = false;
  await loadViews();
};

const handleCommand = async (command: string, view: FormListView) => {
  selectedView.value = view;
  if (command === "edit") {
    editingView.value = view;
    showEditor.value = true;
  } else if (command === "scope") {
    showScope.value = true;
  } else if (command === "copy") {
    const request: FormListViewRequest = {
      id: "",
      appId: view.appId,
      formId: view.formId,
      name: t("admin.formListView.copiedName", { name: view.name }),
      pcType: view.pcType,
      mobileType: view.mobileType,
      sortIndex: nextSortIndex.value,
      permissionGroupIds: [...(view.permissionGroupIds || [])],
      settings: view.settings,
      defaultFilter: view.defaultFilter,
      defaultSort: view.defaultSort,
      disabled: false,
    };
    await formListViewService.post<FormListViewRequest>(request);
    await loadViews();
  } else if (command === "enable" || command === "disable") {
    await formListViewService.patch<FormListViewRequest>(view.id, {
      id: view.id,
      disabled: command === "disable",
    });
    await loadViews();
  } else if (command === "delete") {
    showDeleteConfirm.value = true;
  }
};

const execDelete = async () => {
  if (!selectedView.value) return;
  await formListViewService.delete(selectedView.value.id);
  showDeleteConfirm.value = false;
  await loadViews();
};

const scopeText = (view: FormListView) => {
  if (!view.permissionGroupIds || view.permissionGroupIds.length === 0)
    return t("admin.formListView.allFormDataPermissionGroups");
  const names = permissionGroups.value
    .filter((group) => view.permissionGroupIds?.includes(group.id))
    .map((group) => group.name);
  return names.join(t("common.listSeparator")) || t("admin.formListView.allFormDataPermissionGroups");
};

const thumbClass = (view: FormListView) => ({
  "is-table": view.pcType === FormListViewType.Table,
  "is-kanban": view.pcType === FormListViewType.Kanban,
  "is-gallery": view.pcType === FormListViewType.Gallery,
});

onBeforeMount(async () => {
  await Promise.all([loadViews(), loadFormDataPermissionGroups()]);
});
</script>

<style lang="scss" scoped>
.view-publish {
  height: 100%;
}

.panel-header {
  margin-bottom: var(--et-space-16);
}

.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: var(--et-space-14);
}

.view-card {
  overflow: hidden;
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-radius-6);
  background: var(--et-bg-container);
}

.view-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 var(--et-space-12);
}

.view-name {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--et-space-8);
  color: var(--et-text-primary);
  font-weight: 600;
}

.view-mark {
  width: 10px;
  height: 14px;
  border-left: 4px solid var(--et-color-primary);
  border-right: 2px solid var(--et-color-primary);
}

.view-thumb {
  display: flex;
  gap: var(--et-space-8);
  height: 118px;
  margin: 0 var(--et-space-12);
  padding: var(--et-space-10);
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-page);
}

.thumb-table {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(var(--et-border-color-light) 1px, transparent 1px) 0 0 / 100% 24px,
    linear-gradient(90deg, var(--et-border-color-light) 1px, transparent 1px) 0 0 / 50px 100%,
    var(--et-bg-container);
}

.thumb-column {
  flex: 1;
  background: var(--et-bg-muted);
  padding: var(--et-space-8);

  span {
    display: block;
    height: 28px;
    margin-bottom: var(--et-space-8);
    border-radius: var(--et-radius-4);
    background: var(--et-bg-container);
  }
}

.thumb-gallery-item {
  flex: 1 0 40%;
  border-radius: var(--et-radius-4);
  background: var(--et-bg-container);
}

.is-gallery {
  flex-wrap: wrap;
}

.view-card-footer {
  display: flex;
  align-items: center;
  gap: var(--et-space-6);
  height: 34px;
  padding: 0 var(--et-space-12);
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);

  .el-tag {
    margin-left: auto;
  }
}

.danger-item {
  color: var(--et-color-danger);
}

.empty-view {
  color: var(--et-text-tertiary);
  padding: var(--et-space-30);
  text-align: center;
}
</style>
