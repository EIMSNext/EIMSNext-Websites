<template>
    <div class="api-config-pane">
        <div class="config-content">
            <div class="config-pane">
                <div class="pane-label">服务器地址</div>
                <div class="pane-row">
                    <el-input v-model="hook.url" class="pane-row-stretch" autocomplete="new-password" />
                    <el-button type="primary" class="btn-test">服务器连接测试</el-button>
                </div>
                <div class="pane-label">Secret</div>
                <div class="pane-row">
                    <el-input v-model="hook.secret" class="pane-row-stretch" autocomplete="new-password" />
                    <el-button type="primary" class="btn-test">生成Secret</el-button>
                </div>
                <div class="pane-label">推送事件</div>
                <div class="pane-row">
                    <div class="triggers-container">
                        <div class="push-event-title"><span>数据事件</span><span
                                class="push-event-title-desc">表单数据发生变更时，推送变更后的数据</span>
                            <el-button size="small" class="btn-sample">查看样例</el-button>
                        </div>
                        <div class="push-event-triggers">
                            <el-checkbox :modelValue="dataCreated"
                                @change="(val) => triggerChanged(WebHookTrigger.Data_Created, val)">有新数据提交时</el-checkbox>
                            <el-checkbox :modelValue="dataUpdated"
                                @change="(val) => triggerChanged(WebHookTrigger.Data_Updated, val)">有数据被修改时</el-checkbox>
                            <el-checkbox :modelValue="dataRemoved"
                                @change="(val) => triggerChanged(WebHookTrigger.Data_Removed, val)">有数据被删除时</el-checkbox>

                        </div>
                        <div class="push-event-title"><span>流程事件</span><span
                                class="push-event-title-desc">流程状态/待办发生变更时，推送变更后的数据</span><el-button size="small"
                                class="btn-sample">查看样例</el-button>
                        </div>
                        <div class="push-event-triggers">
                            <el-checkbox :modelValue="wfStatusUpdated"
                                @change="(val) => triggerChanged(WebHookTrigger.WfStatus_Updated, val)">流程状态变更时</el-checkbox>
                            <el-checkbox :modelValue="wfTodoUpdated"
                                @change="(val) => triggerChanged(WebHookTrigger.WfTodo_Updated, val)">流程待办变更时</el-checkbox>
                        </div>
                    </div>
                </div>
            </div>
            <div class="btn-pane"><el-button type="primary" @click="save">保存</el-button></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { FormDef, Webhook, WebhookRequest, WebHookTrigger } from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";
import { webhookService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { cloneDeep } from "lodash-es";
const { t } = useI18n()

defineOptions({
    name: "WebhookEditor",
});

const props = defineProps<{
    modelValue: Webhook;
    formDef: FormDef;
}>();

const hook = ref<Webhook>(cloneDeep(props.modelValue) || {})

const dataCreated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.Data_Created))
const dataUpdated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.Data_Updated))
const dataRemoved = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.Data_Removed))
const wfStatusUpdated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.WfStatus_Updated))
const wfTodoUpdated = computed(() => FlagEnum.has(triggers.value, WebHookTrigger.WfTodo_Updated))

const emit = defineEmits(["update:modelValue", "saved"]);
const triggers = ref(hook.value.triggers || WebHookTrigger.NotSet)
const triggerChanged = (perm: WebHookTrigger, checked: any) => {
    if (checked) {
        triggers.value = FlagEnum.combine(triggers.value, perm)
    }
    else {
        triggers.value = FlagEnum.remove(triggers.value, perm)
    }

    hook.value.triggers = triggers.value;
    emit("update:modelValue", hook.value)
}

const save = async () => {
    if (!hook.value) return;

    // try {
    //     await appRef.value.validate();
    // } catch (error) {
    //     return;
    // }

    const newHook: WebhookRequest = {
        id: hook.value.id,
        appId: props.formDef.appId,
        formId: props.formDef.id,
        url: hook.value.url,
        secret: hook.value.secret,
        triggers: hook.value.triggers,
        disabled: false
    };

    if (hook.value.id) {
        hook.value = await webhookService.patch<Webhook>(hook.value.id, newHook);
    } else {
        hook.value = await webhookService.post<Webhook>(newHook);
    }

    emit("saved", hook.value);
}

</script>
<style lang="scss" scoped>
.api-config-pane {
    background: var(--et-bg-color-primary);
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;

    .config-content {
        background: #fff;
        border-radius: 6px;
        bottom: 0;
        left: 0;
        margin: 20px auto;
        position: absolute;
        right: 0;
        top: 0;
        width: 700px;

        .config-pane {
            bottom: 56px;
            left: 0;
            overflow: auto;
            padding: 0 30px 10px;
            position: absolute;
            right: 0;
            top: 0;

            .pane-label {
                color: var(--et-color-text-secondary);
                line-height: 20px;
                margin-top: 20px;
            }

            .pane-row {
                align-items: center;
                display: flex;
                margin-top: 8px;

                .pane-row-stretch {
                    flex: 1 1 auto;
                    min-width: 0;
                }

                .btn-test {
                    width: 150px;
                    min-width: 150px;
                    margin-left: 20px;
                }

                .triggers-container {
                    display: inline-block;
                    max-width: 100%;

                    .push-event-title {
                        margin-bottom: 8px;

                        .push-event-title-desc {
                            font-size: 12px;
                            color: var(--et-color-text-secondary);
                            margin: 0 8px;
                        }

                        .btn-sample {
                            color: var(--et-color-primary);
                            border: none;
                            margin-left: 5px;
                        }
                    }

                    .push-event-triggers {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 12px;
                    }
                }
            }

        }

        .btn-pane {
            align-items: center;
            border-top: 1px solid var(--et-color-border);
            bottom: 0;
            display: flex;
            height: 56px;
            justify-content: center;
            left: 0;
            position: absolute;
            right: 0;
        }
    }
}
</style>