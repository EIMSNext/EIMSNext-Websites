<template>
  <div class="ag-container">
    <el-tabs v-model="activeName" tabPosition="left" class="ag-tabs">
      <el-tab-pane :label="t('admin.publishEditor.nameInfo')" name="name" class="ag-panel">
        <div class="auth-content">
          <div class="ag-name-wrapper">
            <div class="ag-desc">{{ t("admin.publishEditor.nameInfoDesc") }}</div>
            <div class="ag-name">
              <el-input
                v-model="permissionGroup.name"
                :placeholder="t('admin.publishEditor.namePlaceholder')"
                autocomplete="new-password"
              />
            </div>
            <div class="ag-describe">
              <el-input
                v-model="permissionGroup.desc"
                type="textarea"
                class="ag-desc-textarea"
                :placeholder="t('admin.publishEditor.descPlaceholder')"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="t('admin.publishEditor.dataPerm')" name="dataperm" class="ag-panel">
        <div class="auth-content">
          <div class="data-perms">
            <div class="ag-desc">{{ t("admin.publishEditor.dataPermDesc") }}</div>
            <div class="data-perms-group">
              <el-checkbox
                :modelValue="formDataPermissions == FormDataPermissions.All"
                :indeterminate="formDataPermissions != FormDataPermissions.All && formDataPermissions > 0"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.All, val)"
              >
                {{ t("admin.publishEditor.selectAll") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canView"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.View, val)"
              >
                {{ t("admin.publishEditor.view") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canAddNew"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.AddNew, val)"
              >
                {{ t("admin.publishEditor.add") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canCopy"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.Copy, val)"
              >
                {{ t("admin.publishEditor.copy") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canEdit"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.Edit, val)"
              >
                {{ t("admin.publishEditor.edit") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canRemove"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.Remove, val)"
              >
                {{ t("admin.publishEditor.remove") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canImport"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.Import, val)"
              >
                {{ t("admin.publishEditor.import") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canExport"
                @change="(val) => formDataPermissionsChanged(FormDataPermissions.Export, val)"
              >
                {{ t("admin.publishEditor.export") }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="t('admin.publishEditor.dataFilter')" name="datafilter" class="ag-panel">
        <div class="auth-content">
          <div class="ag-data-filter">
            <div class="ag-desc">{{ t("admin.publishEditor.dataFilterDesc") }}</div>
            <ConditionList
              v-model="dataFilter"
              :formId="formDef.id"
              :max-level="1"
              @change="dataFilterChanged"
              @remove="dataFilterClear"
            ></ConditionList>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="t('admin.publishEditor.fieldPerm')" name="fieldperm" class="ag-panel">
        <EtFormFieldPermissions
          v-model="formFieldPermissions"
          :fields="formDef.content?.items"
          class="field-perms-panel"
          @change="formFieldPermissionsChanged"
        ></EtFormFieldPermissions>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { EventFlowDiagram, IConditionList, FormFieldPermissionItem } from "@eimsnext/components";
import { FormDef, FormDataPermissionGroup, FormDataPermissions, FormDataPermissionMode, FormFieldPermission } from "@eimsnext/models";
import { FlagEnum, uniqueId } from "@eimsnext/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "FormDataPermissionGroupEditor",
});

const props = defineProps<{
  modelValue: FormDataPermissionGroup;
  formDef: FormDef;
}>();

const activeName = ref("name");

const permissionGroup = toRef(props.modelValue);
const formDataPermissions = ref(permissionGroup.value.formDataPermissions);
const formDataPermissionsChanged = (perm: FormDataPermissions, checked: any) => {
  if (checked) {
    formDataPermissions.value = FlagEnum.combine(formDataPermissions.value, FormDataPermissions.View, perm);
  } else {
    if (perm == FormDataPermissions.View) formDataPermissions.value = FormDataPermissions.None;
    else formDataPermissions.value = FlagEnum.remove(formDataPermissions.value, perm);
  }

  permissionGroup.value.formDataPermissions = formDataPermissions.value;
  emit("update:modelValue", permissionGroup.value);
};

const canView = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.View));
const canAddNew = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.AddNew));
const canEdit = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.Edit));
const canCopy = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.Copy));
const canRemove = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.Remove));
const canImport = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.Import));
const canExport = computed(() => FlagEnum.has(formDataPermissions.value, FormDataPermissions.Export));

const dataFilter = ref<IConditionList>(
  props.modelValue.dataFilter
    ? JSON.parse(props.modelValue.dataFilter)
    : { id: uniqueId(), rel: "and", items: [] }
);
const dataFilterChanged = (condList: IConditionList) => {
  permissionGroup.value.dataFilter = JSON.stringify(condList);
  emit("update:modelValue", permissionGroup.value);
};

const dataFilterClear = () => {
  dataFilter.value.items = [];
  permissionGroup.value.dataFilter = JSON.stringify(dataFilter.value);
  emit("update:modelValue", permissionGroup.value);
};

const formFieldPermissions = ref<FormFieldPermissionItem[]>([]);
if (props.modelValue.formFieldPermissions) {
  formFieldPermissions.value = props.modelValue.formFieldPermissions as FormFieldPermissionItem[];
}

const formFieldPermissionsChanged = (value: FormFieldPermissionItem[]) => {
  props.modelValue.formFieldPermissions = value as FormFieldPermission[];
  emit("update:modelValue", permissionGroup.value);
};

const emit = defineEmits(["update:modelValue"]);
</script>
<style lang="scss" scoped>
.ag-container {
  height: 100%;

  .ag-tabs {
    height: 100%;
  }

  .ag-panel {
    height: 100%;

    .auth-content {
      height: 100%;
      padding-left: var(--et-space-8);

      .ag-desc {
        align-items: center;
        color: var(--et-text-tertiary);
        display: flex;
        height: var(--et-size-40);
      }

      .ag-name-wrapper {
        height: 100%;
        display: flex;
        flex-direction: column;

        .ag-describe {
          margin-top: var(--et-space-10);
          flex: 1;

          :deep(.el-textarea__inner) {
            height: 100%;
          }
        }
      }

      .data-perms {
        height: 100%;
        overflow: auto;

        .data-perms-group {
          display: flex;
          flex-wrap: wrap;

          .el-checkbox {
            flex: 0 0 25%;
            box-sizing: border-box;
          }
        }
      }

      .ag-data-filter {
        height: 100%;
        overflow: auto;
      }
    }
  }
}

.ag-desc-textarea {
  height: 95%;
}

.field-perms-panel {
  height: 90%;
}
</style>

