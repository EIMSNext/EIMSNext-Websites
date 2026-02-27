<template>
    <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
        :showNoSave="false" okText="确定" @ok="execDelete">
        <div>数据删除后将不可恢复</div>
    </EtConfirmDialog>
    <el-drawer v-model="showDrawer" direction="btt" size="95%" @close="close">
        <template #header>
            <div class="main-title"> <span>数据推送</span></div>
        </template>
        <div class="main-content">
            <WebhookEditor v-if="selectedItem" v-model="selectedItem" :formDef="formDef" />
        </div>
    </el-drawer>
    <AdvanceLayout title="数据推送" desc="数据推送可将表单数据推送至你指定的服务器">
        <div class="flow-container">
            <div class="panel-header">
                <div class="header-left"> <el-button type="primary" icon="plus" @click="addNew()">新建数据推送</el-button>
                </div>
                <div class="header-right"></div>
            </div>
            <div>
                <el-space direction="vertical" class="flow-space">
                    <template v-for="hook in webhooks">
                        <et-card class="flow-card" :title="'推送到自定义服务器'">
                            <template #action>
                                <div class="flow-header">
                                    <el-button @click="edit(hook)">编辑</el-button>
                                    <el-button @click="remove(hook)">删除</el-button>
                                    <el-switch :model-value="!hook.disabled" @change="toggleDisable(hook)"></el-switch>
                                </div>
                            </template>
                            <div class="flow-content">
                                <div class="item-line">服务器地址: {{ hook.url }}</div>
                                <div class="item-line">推送事件: {{ hook.triggers }}</div>
                            </div>
                        </et-card>
                    </template>
                </el-space>
            </div>
        </div>
    </AdvanceLayout>
</template>
<script setup lang="ts">
import WebhookEditor from "./WebhookEditor.vue";
import { FormDef, WebHookTrigger, Webhook } from "@eimsnext/models";
import { webhookService, } from "@eimsnext/services";
import buildQuery from "odata-query";
import AdvanceLayout from "./AdvanceLayout.vue";
import { MessageIcon } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";
import { Dictionary } from "@eimsnext/utils";

defineOptions({
    name: "WebhookList",
});

const props = defineProps<{
    formDef: FormDef;
}>();

const showDrawer = ref(false);
const showDeleteConfirmDialog = ref(false)
const webhooks = ref<Webhook[]>([]);
const selectedItem = ref<Webhook>();
const formStore = useFormStore()
// const formNamesCache = new Dictionary<string>()

// console.log("formid", props.formId);

const loadWebhooks = (formId: string) => {
    let query = buildQuery({ filter: { formId: formId } });
    webhookService.query<Webhook>(query).then((res) => {
        webhooks.value = res;
    });

    // formStore.get(formId).then(form => { if (form) formNamesCache.add(formId, form.name) })
};

const addNew = () => {
    selectedItem.value = {
        id: "",
        appId: props.formDef.appId,
        formId: props.formDef.id,
        url: "",
        secret: "",
        triggers: WebHookTrigger.Data_Created | WebHookTrigger.Data_Updated | WebHookTrigger.Data_Removed,
        disabled: false
    };

    showDrawer.value = true;
};

const edit = (flow: Webhook) => {
    // console.log("edit df", flow);
    selectedItem.value = flow;

    showDrawer.value = true;
};

const remove = (flow: Webhook) => {
    selectedItem.value = flow
    showDeleteConfirmDialog.value = true
};
const execDelete = () => {
    webhookService.delete<Webhook>(selectedItem.value!.id).then((res) => {
        loadWebhooks(props.formDef.id)
        showDeleteConfirmDialog.value = false
    });
}
const toggleDisable = (hook: Webhook) => {
    webhookService.patch<Webhook>(hook.id, { id: hook.id, disabled: !hook.disabled }).then((res) => {
        hook.disabled = !hook.disabled
    });
}

// const emit = defineEmits(["close"]);

function close() {
    showDrawer.value = false;

    loadWebhooks(props.formDef.id);
    // emit("close");
}

onBeforeMount(() => {
    //初始化
    if (props.formDef) {
        loadWebhooks(props.formDef.id);
    }
});
</script>
<style lang="scss" scoped>
.flow-container {
    display: flex;
    flex-direction: column;

    .panel-header {
        align-items: center;
        display: flex;
        justify-content: space-between;
        padding-bottom: 16px;
    }

    .flow-space {
        width: 100%;
        align-items: normal !important;
    }

    .flow-card {
        width: 100%;

        .flow-header {
            display: flex;
            justify-content: space-between;

            .flow-name {
                font-size: 15px;
                font-weight: 600;
                max-width: 50%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .el-button {
                margin: 0px;
                border: none;
            }
        }

        .flow-content {
            display: flex;
            font-size: 13px;
            padding: 10px 20px;
            flex-direction: column;

            .item-line {
                word-wrap: break-word;
                align-items: center;
                color: var(--et-color-text-secondary);
                display: flex;
                font-size: 14px;
                line-height: 22px;
                word-break: break-word;
            }
        }
    }
}

.main-title {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
}

.main-content {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 60px;
}
</style>
