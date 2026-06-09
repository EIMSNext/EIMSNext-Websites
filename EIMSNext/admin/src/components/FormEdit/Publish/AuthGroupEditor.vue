<template>
  <div class="ag-container">
    <el-tabs v-model="activeName" tabPosition="left" class="ag-tabs">
      <el-tab-pane :label="t('admin.publishEditor.nameInfo')" name="name" class="ag-panel">
        <div class="auth-content">
          <div class="ag-name-wrapper">
            <div class="ag-desc">{{ t("admin.publishEditor.nameInfoDesc") }}</div>
            <div class="ag-name">
              <el-input
                v-model="authGrp.name"
                :placeholder="t('admin.publishEditor.namePlaceholder')"
                autocomplete="new-password"
              />
            </div>
            <div class="ag-describe">
              <el-input
                v-model="authGrp.desc"
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
                :modelValue="dataPerms == DataPerms.All"
                :indeterminate="dataPerms != DataPerms.All && dataPerms > 0"
                @change="(val) => dataPermsChanged(DataPerms.All, val)"
              >
                {{ t("admin.publishEditor.selectAll") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canView"
                @change="(val) => dataPermsChanged(DataPerms.View, val)"
              >
                {{ t("admin.publishEditor.view") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canAddNew"
                @change="(val) => dataPermsChanged(DataPerms.AddNew, val)"
              >
                {{ t("admin.publishEditor.add") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canCopy"
                @change="(val) => dataPermsChanged(DataPerms.Copy, val)"
              >
                {{ t("admin.publishEditor.copy") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canEdit"
                @change="(val) => dataPermsChanged(DataPerms.Edit, val)"
              >
                {{ t("admin.publishEditor.edit") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canRemove"
                @change="(val) => dataPermsChanged(DataPerms.Remove, val)"
              >
                {{ t("admin.publishEditor.remove") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canImport"
                @change="(val) => dataPermsChanged(DataPerms.Import, val)"
              >
                {{ t("admin.publishEditor.import") }}
              </el-checkbox>
              <el-checkbox
                :modelValue="canExport"
                @change="(val) => dataPermsChanged(DataPerms.Export, val)"
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
        <EtFieldPerms
          v-model="fieldPerms"
          :fields="formDef.content?.items"
          class="field-perms-panel"
          @change="fieldPermsChanged"
        ></EtFieldPerms>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { DataflowDiagram, IConditionList, IFieldPermItem } from "@eimsnext/components";
import { FormDef, AuthGroup, DataPerms, AuthGroupType, IFieldPerm } from "@eimsnext/models";
import { FlagEnum, uniqueId } from "@eimsnext/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "AuthGroupEditor",
});

const props = defineProps<{
  modelValue: AuthGroup;
  formDef: FormDef;
}>();

const activeName = ref("name");

const authGrp = toRef(props.modelValue);
const dataPerms = ref(authGrp.value.dataPerms);
const dataPermsChanged = (perm: DataPerms, checked: any) => {
  if (checked) {
    dataPerms.value = FlagEnum.combine(dataPerms.value, DataPerms.View, perm);
  } else {
    if (perm == DataPerms.View) dataPerms.value = DataPerms.None;
    else dataPerms.value = FlagEnum.remove(dataPerms.value, perm);
  }

  authGrp.value.dataPerms = dataPerms.value;
  emit("update:modelValue", authGrp.value);
};

const canView = computed(() => FlagEnum.has(dataPerms.value, DataPerms.View));
const canAddNew = computed(() => FlagEnum.has(dataPerms.value, DataPerms.AddNew));
const canEdit = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Edit));
const canCopy = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Copy));
const canRemove = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Remove));
const canImport = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Import));
const canExport = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Export));

const dataFilter = ref<IConditionList>(
  props.modelValue.dataFilter
    ? JSON.parse(props.modelValue.dataFilter)
    : { id: uniqueId(), rel: "and", items: [] }
);
const dataFilterChanged = (condList: IConditionList) => {
  authGrp.value.dataFilter = JSON.stringify(condList);
  emit("update:modelValue", authGrp.value);
};

const dataFilterClear = () => {
  dataFilter.value.items = [];
  authGrp.value.dataFilter = JSON.stringify(dataFilter.value);
  emit("update:modelValue", authGrp.value);
};

const fieldPerms = ref<IFieldPermItem[]>([]);
if (props.modelValue.fieldPerms) {
  fieldPerms.value = props.modelValue.fieldPerms as IFieldPermItem[];
}

const fieldPermsChanged = (value: IFieldPermItem[]) => {
  props.modelValue.fieldPerms = value as IFieldPerm[];
  emit("update:modelValue", authGrp.value);
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
