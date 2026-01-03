<template>
    <div class="ag-container">
        <el-tabs v-model="activeName" tabPosition="left" style="height:100%">
            <el-tab-pane label="名称信息" name="name" class="ag-panel">
                <div class="auth-content">
                    <div class="ag-name-wrapper">
                        <div class="ag-desc">可设置权限组名称和描述信息</div>
                        <div class="ag-name">
                            <el-input v-model="authGrp.name" placeholder="填写权限组名称" autocomplete="new-password" />
                        </div>
                        <div class="ag-describe">
                            <el-input v-model="authGrp.desc" type="textarea" style="height: 95%;"
                                placeholder="填写描述信息" />
                        </div>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="操作权限" name="dataperm" class="ag-panel">
                <div class="auth-content">
                    <div class="data-perms">
                        <div class="ag-desc">可对流程和数据进行哪些操作</div>
                        <div class="data-perms-group">
                            <el-checkbox :modelValue="dataPerms == DataPerms.All"
                                :indeterminate="dataPerms != DataPerms.All && dataPerms > 0"
                                @change="(val) => dataPermsChanged(DataPerms.All, val)">全选</el-checkbox>
                            <el-checkbox :modelValue="canView"
                                @change="(val) => dataPermsChanged(DataPerms.View, val)">查看</el-checkbox>
                            <el-checkbox :modelValue="canAddNew"
                                @change="(val) => dataPermsChanged(DataPerms.AddNew, val)">添加</el-checkbox>
                            <el-checkbox :modelValue="canCopy"
                                @change="(val) => dataPermsChanged(DataPerms.Copy, val)">复制</el-checkbox>
                            <el-checkbox :modelValue="canEdit"
                                @change="(val) => dataPermsChanged(DataPerms.Edit, val)">编辑</el-checkbox>
                            <el-checkbox :modelValue="canRemove"
                                @change="(val) => dataPermsChanged(DataPerms.Remove, val)">删除</el-checkbox>
                            <el-checkbox :modelValue="canImport"
                                @change="(val) => dataPermsChanged(DataPerms.Import, val)">导入</el-checkbox>
                            <el-checkbox :modelValue="canExport"
                                @change="(val) => dataPermsChanged(DataPerms.Export, val)">导出</el-checkbox>
                        </div>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="数据权限" name="datafilter" class="ag-panel">
                <div class="auth-content">
                    <div class="ag-data-filter">
                        <div class="ag-desc">可以管理哪些数据</div>
                        <ConditionList v-model="dataFilter" :formId="formDef.id" :max-level="1"
                            @change="dataFilterChanged"></ConditionList>
                    </div>
                </div>
            </el-tab-pane>
            <!-- <el-tab-pane label="字段权限" name="fieldperm" class="ag-panel">
                <EtFieldPerms v-model="fieldPerms" :fields="formDef.content?.items"></EtFieldPerms>
            </el-tab-pane> -->
        </el-tabs>
    </div>
</template>
<script setup lang="ts">
import { IConditionList, IFieldPermItem } from "@eimsnext/components";
import { FormDef, AuthGroup, DataPerms, AuthGroupType } from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n()

defineOptions({
    name: "AuthGroupEditor",
});

const props = defineProps<{
    modelValue: AuthGroup;
    formDef: FormDef;
}>();

const activeName = ref("name")

const authGrp = toRef(props.modelValue)
const dataPerms = ref(authGrp.value.dataPerms)
const dataPermsChanged = (perm: DataPerms, checked: any) => {
    if (checked) {
        dataPerms.value = FlagEnum.combine(dataPerms.value, DataPerms.View, perm)
    }
    else {
        if (perm == DataPerms.View)
            dataPerms.value = DataPerms.None
        else
            dataPerms.value = FlagEnum.remove(dataPerms.value, perm)
    }

    authGrp.value.dataPerms = dataPerms.value;
    emit("update:modelValue", authGrp.value)
}

const canView = computed(() => FlagEnum.has(dataPerms.value, DataPerms.View))
const canAddNew = computed(() => FlagEnum.has(dataPerms.value, DataPerms.AddNew))
const canEdit = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Edit))
const canCopy = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Copy))
const canRemove = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Remove))
const canImport = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Import))
const canExport = computed(() => FlagEnum.has(dataPerms.value, DataPerms.Export))

const dataFilter = ref<IConditionList>(props.modelValue.dataFilter ? JSON.parse(props.modelValue.dataFilter) : { id: "", rel: "and" })
const dataFilterChanged = (condList: IConditionList) => {

    authGrp.value.dataFilter = JSON.stringify(condList);
    emit("update:modelValue", authGrp.value)
}

const fieldPerms = ref<IFieldPermItem[]>([])

const emit = defineEmits(["update:modelValue"]);

</script>
<style lang="scss" scoped>
.ag-container {
    height: 100%;

    .ag-panel {
        height: 100%;

        .auth-content {
            height: 100%;
            padding-left: 8px;

            .ag-desc {
                align-items: center;
                color: var(--et-color-text-tertiary);
                display: flex;
                height: 40px;
            }

            .ag-name-wrapper {
                height: 100%;
                display: flex;
                flex-direction: column;

                .ag-describe {
                    margin-top: 10px;
                    flex: 1;

                    :deep .el-textarea__inner {
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
</style>