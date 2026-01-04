<template>
    <et-dialog :modelValue="modelValue" :title="'创建权限组'" width="610px" @ok="save" @cancel="cancel">
        <div class="new-publish-container">
            <div class="member-select">
                <div class="item-title">对成员发布</div>
                <selected-tags v-model="members" :editable="true" @editTag="editTag"></selected-tags>
            </div>
            <div class="auth-group-select">
                <div class="item-title">成员权限</div>
                <el-select v-model="newAuthGrp.type">
                    <el-option label="管理本人数据" :value="AuthGroupType.ManageSelfData"></el-option>
                    <el-option label="查看所有数据" :value="AuthGroupType.ViewAllData"></el-option>
                    <el-option label="管理所有数据" :value="AuthGroupType.ManageAllData"></el-option>
                    <el-option label="自定义" :value="AuthGroupType.Custom"></el-option>
                </el-select>
            </div>
            <AuthGroupEditor v-if="newAuthGrp.type == AuthGroupType.Custom" v-model="newAuthGrp" :form-def="formDef"
                style="height: 280px;">
            </AuthGroupEditor>
            <MemberSelectDialog v-model="showMemberDialog" :tags="members"
                :showTabs="MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee" :multiple="true"
                destroy-on-close @ok="finishSelect">
            </MemberSelectDialog>
        </div>
    </et-dialog>
</template>
<script setup lang="ts">
import { FormDef, AuthGroup, DataPerms, AuthGroupType } from "@eimsnext/models";
import { ISelectedTag, SelectedTags, MemberSelectDialog, MemberTabs } from "@eimsnext/components";
import AuthGroupEditor from "./AuthGroupEditor.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n()

defineOptions({
    name: "NewPublishDialog",
});

const props = defineProps<{
    modelValue: boolean
    formDef: FormDef;
}>();

const newAuthGrp = ref<AuthGroup>({ id: "", name: "管理本人数据", appId: props.formDef.appId, formId: props.formDef.id, type: AuthGroupType.ManageSelfData, dataPerms: DataPerms.None, disabled: false })
const members = ref<ISelectedTag[]>([])
const showMemberDialog = ref(false)

const editTag = () => { showMemberDialog.value = true }
const finishSelect = (tags: ISelectedTag[]) => {
    members.value = tags;
    showMemberDialog.value = false;
};

const emit = defineEmits(["update:modelValue", "close"]);
const cancel = () => {
    emit("update:modelValue", false);
    emit("close", false);
};
const save = () => {
    console.log("newauth", newAuthGrp, members)
    emit("close", true);
};

</script>
<style lang="scss" scoped>
.new-publish-container {
    margin: 20px;
    height: 470px;

    .item-title {
        color: var(--et-color-text);
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        margin-bottom: 8px;
    }

    .auth-group-select {
        margin: 20px 0 8px;
    }
}
</style>