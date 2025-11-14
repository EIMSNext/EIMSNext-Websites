<template>
    <div class="_fd-ai-chat">
        <div class="_fd-ai-chat-header">
            <div class="_fc-l-label">
                <i class="fc-icon icon-ai bright"></i>
                FormCreate {{ t('ai.name') }}
            </div>
            <div class="_fc-l-info">
                {{ t('ai.info') }}
            </div>
            <div class="_fd-ai-chat-prompt">
                <span>{{ t('ai.try') }}</span>
                <span class="_fd-ai-chat-refresh" @click="refresh"> <i
                    class="fc-icon icon-refresh2"></i>{{ t('ai.change') }}</span>
            </div>
            <template v-for="(item) in pageData">
                <div class="_fd-ai-chat-question" @click="message = item">
                    <span>{{ item }}</span>
                    <i class="fc-icon icon-down"></i>
                </div>
            </template>
        </div>
        <div class="_fd-ai-chat-history">
            <template v-for="(item,idx) in history" :key="idx">
                <div class="_fd-ai-chat-history-item" ref="chat">
                    <div class="_fd-ai-chat-history-chat">
                        <div>{{ item.message }}</div>
                    </div>
                    <div class="_fd-ai-chat-history-status" :class="item.status || 'success'">
                        <div>
                            <template v-if="item.status === 'loading'">
                                <div>{{ t('ai.loading') }}</div>
                            </template>
                            <template v-else-if="item.status === 'fail'">
                                <div><i class="fc-icon icon-warning"></i>{{ t('ai.fail') }}</div>
                            </template>
                            <template v-else>
                                <div><i class="fc-icon icon-yes"></i>{{ t('ai.success') }}</div>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div class="_fd-ai-chat-input">
            <div class="_fd-ai-chat-clear">
                <el-button size="small" text round @click="clear"><i class="fc-icon icon-delete2"></i> 清空</el-button>
            </div>
            <el-input type="textarea" v-model="message" :placeholder="t('ai.placeholder')" resize="none"></el-input>
            <div class="fc-icon icon-suspend" v-if="chat && chat.status === 'loading'" @click="suspend"></div>
            <div class="fc-icon icon-send" :class="{disabled: !message || !message.trim()}" v-else @click="send"></div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import {message} from '../../utils/message';

export default defineComponent({
    name: 'AiChat',
    inject: ['designer'],
    data() {
        return {
            message: '',
            page: 0,
            limit: 3,
            pageData: [],
            question: [
                '生成一个就诊满意度问卷表单',
                '创建一个建议收集表单，包含联系人、联系邮箱、分类和建议内容',
                '追加一个用户信息表单',
                '添加一个标签组件，显示文本为 "Tag"',
                '删除商品简介字段',
                '当单选框选择 "选项1" 时，显示输入框组件',
                '设置输入框为必填，并限制长度必须大于13',
                '商品价格字段使用数字输入框组件',
                '给输入类组件补充占位提示文本（placeholder）'
            ],
            chat: null,
            history: []
        }
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        api() {
            return this.designer.props.config?.ai?.api || 'https://api.form-create.com/ai/v1/chat/form';
        },
        token() {
            return this.designer.props.config?.ai?.token;
        },
    },
    methods: {
        refresh() {
            if (this.page * this.limit < this.question.length) {
                this.page++;
            } else {
                this.page = 1;
            }
            const startIndex = (this.page - 1) * this.limit;
            const endIndex = startIndex + this.limit;

            this.pageData = this.question.slice(startIndex, endIndex);
        },
        send() {
            const message = (this.message || '').trim()
            if (!message) {
                return;
            }
            this.chat = {
                message,
                status: 'loading'
            };
            this.history.push(this.chat);
            this.$nextTick(() => {
                this.$refs.chat[this.$refs.chat.length - 1].scrollIntoView({block: 'end'});
            })
            this.message = '';
            this.fetch()
        },
        suspend() {
            this.chat.status = 'success';
            this.chat = null;
        },
        fetch() {
            fetch(this.api, {
                method: 'POST',
                headers: {
                    'Authorization': this.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ui: 'element-plus',
                    message: this.chat.message,
                    rule: this.designer.setupState.getJson()
                })
            }).then((res) => {
                res.json().then(res => {
                    if (this.chat) {
                        if (res.status === 200) {
                            this.chat.status = 'success';
                            this.designer.setupState.setRule(res.data.rule);
                        } else {
                            this.chat.status = 'fail';
                            res.message && message(res.message);
                        }
                        this.chat = null;
                    }
                })
            }).catch(() => {
                this.chat = null;
            })
        },
        getHistory() {
            const data = localStorage.getItem('fc_ai_history');
            if (data) {
                this.history = JSON.parse(data)
            }
        },
        clear() {
            this.history = [];
            localStorage.removeItem('fc_ai_history');
        },
    },
    created() {
        this.getHistory();
        this.refresh();
    },
    mounted() {
        if (this.$refs.chat) {
            this.$nextTick(() => {
                this.$refs.chat[this.$refs.chat.length - 1].scrollIntoView({block: 'end'});
            })
        }
    },
    unmounted() {
        localStorage.setItem('fc_ai_history', JSON.stringify(this.history));
    }
});
</script>

<style>
._fd-ai-chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding: 12px;
    font-size: 12px;
}

._fd-ai-chat-header {
    border-radius: 6px;
    border: 1px solid var(--fc-line-color-3);
}

._fd-ai-chat-prompt {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px 10px;

}

._fd-ai-chat-prompt .fc-icon {
    font-size: 12px;
    margin-right: 2px;
}

._fd-ai-chat-refresh {
    color: var(--fc-style-color-1);
    cursor: pointer;
}

._fd-ai-chat-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--fc-bg-color-2);
    border-radius: 6px;
    padding: 7px 10px;
    margin: 0 12px 12px;
    color: var(--fc-text-color-2);
    cursor: pointer;
}

._fd-ai-chat-question + ._fd-ai-chat-question {
    margin-top: 6px;
}

._fd-ai-chat-question .fc-icon {
    margin-left: 12px;
}

._fd-ai-chat-question .icon-down:before {
    display: inline-block;
    transform: rotate(-90deg);
}

._fd-ai-chat-history {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-top: 12px;
    overflow: auto;
}

._fd-ai-chat-history-chat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 10px;
}

._fd-ai-chat-history-chat > div {
    background: var(--fc-style-bg-color-1);
    border-radius: 6px 0px 6px 6px;
    color: var(--fc-style-color-1);
    padding: 10px;
    white-space: pre-wrap;
    max-width: 70%;
}

._fd-ai-chat-history-status {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px;
}


._fd-ai-chat-history-status > div {
    position: relative;
    background: var(--fc-bg-color-2);
    border-radius: 0px 6px 6px 6px;
    color: var(--fc-text-color-2);
    padding: 10px;
    max-width: 70%;
    overflow: hidden;
}


._fd-ai-chat-history-status > div > div {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

._fd-ai-chat-history-status.loading > div:after {
    content: '';
    background: linear-gradient(0deg, var(--fc-style-color-1) 0%, var(--fc-style-color-4) 100%);
    padding: 1px;
    position: absolute;
    top: -2px;
    left: -2px;
    bottom: -2px;
    right: -2px;
    animation: rotate-animation 3s linear infinite;
    filter: blur(5px);
}

._fd-ai-chat-history-status.loading > div {
    padding: 1px;
    border-radius: 0px 6px 6px 6px;
}

._fd-ai-chat-history-status.loading > div > div {
    background-color: var(--fc-bg-color-1);
    border-radius: 0px 6px 6px 6px;
    padding: 7px 10px;
}

._fd-ai-chat-history-status.success > div {
    background: var(--fc-style-bg-color-2);
    color: var(--fc-style-color-2);
}

._fd-ai-chat-history-status .fc-icon {
    width: 15px;
    height: 15px;
    background: var(--fc-style-color-2);
    color: #fff;
    border-radius: 15px;
    font-size: 14px;
    margin-right: 5px;
    text-align: center;
}

._fd-ai-chat-history-status.fail > div {
    background: var(--fc-style-bg-color-3);
    color: var(--fc-style-color-3);
}

._fd-ai-chat-history-status.fail .fc-icon {
    background: var(--fc-style-color-3);
}

._fd-ai-chat-input {
    width: 100%;
    border-radius: 6px;
    position: relative;
    margin-top: 12px;
}

._fd-ai-chat-clear {
    text-align: right;
    margin-bottom: 6px;
}

._fd-ai-chat-clear .el-button {
    padding: 0;
    margin-right: 2px;
}

._fd-ai-chat-clear .fc-icon {
    font-size: 13px;
}

._fd-ai-chat-input .el-textarea {
    position: relative;
    padding: 1px;
    box-sizing: border-box;
    height: 120px;
}

._fd-ai-chat-input .el-textarea:before {
    content: "";
    background: linear-gradient(135deg, var(--fc-style-color-1), var(--fc-style-color-4));
    border-radius: 6px;
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
}

._fd-ai-chat-input .el-textarea__inner {
    height: 100%;
    resize: none;
    box-shadow: none;
    border-radius: 6px;
    background: var(--fc-bg-color-1);
}

._fd-ai-chat-input > .fc-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    position: absolute;
    right: 12px;
    bottom: 12px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    background: var(--fc-style-color-1);;
    color: #fff;
    text-align: center;
    font-size: 14px;
}

._fd-ai-chat-input .icon-suspend {
    background: linear-gradient(90deg, var(--fc-style-color-1) 0%, var(--fc-style-color-4) 100%);
}

._fd-ai-chat-input .disabled {
    background: var(--fc-text-color-3);
}

@keyframes rotate-animation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>

