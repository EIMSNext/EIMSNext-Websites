<template>
    <div class="api-config-pane">
        <div class="config-content">
            <div class="config-pane">
                <div class="pane-label">服务器地址</div>
                <div class="pane-row">
                    <div class="x-input x-input-css-var pane-row-stretch input-normal">
                        <div class="x-inner-wrapper"><input type="text" class="input-inner" autocomplete="new-password"
                                value=""></div>
                    </div><button type="button"
                        class="x-button x-button-css-var size-normal style-primary pane-row-button"><span>服务器连接测试</span></button>
                </div>
                <div class="pane-label">Secret</div>
                <div class="pane-row">
                    <div class="x-input x-input-css-var pane-row-stretch input-normal">
                        <div class="x-inner-wrapper"><input type="text" class="input-inner" autocomplete="new-password"
                                value=""></div>
                    </div><button type="button"
                        class="x-button x-button-css-var size-normal style-primary pane-row-button"><span>生成
                            Secret</span></button>
                </div>
                <div class="pane-label">推送事件</div>
                <div class="pane-row">
                    <div class="x-check-group push-event-check-group check-group-vertical">
                        <div class="push-event-title"><span>数据事件</span><span
                                class="push-event-title-desc">表单数据发生变更时，推送变更后的数据</span><button type="button"
                                class="x-button x-button-css-var size-normal style-text compact-normal"><span>查看样例</span></button>
                        </div>
                        <div class="x-check x-check-css-var check-checked auto-wrap">
                            <div class="x-check-wrapper" tabindex="0"><label
                                    class="check-label size-normal has-default-padding"><span class="check-icon"><span
                                            class="yes-icon"></span></span><input type="checkbox" tabindex="-1"
                                        class="check-origin" value="data_create" checked=""><span
                                        class="check-text"><span>有新数据提交时</span></span></label></div>
                        </div>
                        <div class="x-check x-check-css-var check-checked auto-wrap">
                            <div class="x-check-wrapper" tabindex="0"><label
                                    class="check-label size-normal has-default-padding"><span class="check-icon"><span
                                            class="yes-icon"></span></span><input type="checkbox" tabindex="-1"
                                        class="check-origin" value="data_update" checked=""><span
                                        class="check-text"><span>有数据被修改时</span></span></label></div>
                        </div>
                        <div class="x-check x-check-css-var check-checked auto-wrap">
                            <div class="x-check-wrapper" tabindex="0"><label
                                    class="check-label size-normal has-default-padding"><span class="check-icon"><span
                                            class="yes-icon"></span></span><input type="checkbox" tabindex="-1"
                                        class="check-origin" value="data_remove" checked=""><span
                                        class="check-text"><span>有数据被删除时</span></span></label></div>
                        </div>
                        <div class="x-check x-check-css-var check-checked auto-wrap">
                            <div class="x-check-wrapper" tabindex="0"><label
                                    class="check-label size-normal has-default-padding"><span class="check-icon"><span
                                            class="yes-icon"></span></span><input type="checkbox" tabindex="-1"
                                        class="check-origin" value="data_recover" checked=""><span
                                        class="check-text"><span>有数据被恢复时</span></span></label></div>
                        </div>
                        <div class="push-event-title"><span>流程事件</span><span
                                class="push-event-title-desc">流程状态/待办发生变更时，推送变更后的数据</span><button type="button"
                                class="x-button x-button-css-var size-normal style-text compact-normal"><span>查看样例</span></button>
                        </div>
                        <div class="x-check x-check-css-var auto-wrap">
                            <div class="x-check-wrapper" tabindex="0"><label
                                    class="check-label size-normal has-default-padding"><span
                                        class="check-icon"></span><input type="checkbox" tabindex="-1"
                                        class="check-origin" value="form_update"><span
                                        class="check-text"><span>表单结构有变化时</span></span></label></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="btn-pane"><button type="button" class="x-button x-button-css-var size-normal style-primary"
                    style="width: 120px;"><span>保存</span></button></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useSystemStore } from "@/store/system";
import { useFormStore } from "@eimsnext/store";
import { Webhook, WebHookTrigger } from "@eimsnext/models";

defineOptions({
    name: "WebhookEditor",
});

const props = defineProps<{
    modelValue: Webhook;
    usingWorkflow: boolean
}>();
</script>