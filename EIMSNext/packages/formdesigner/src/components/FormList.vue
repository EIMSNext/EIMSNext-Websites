<template>
    <el-tree
        ref="treeRef"
        class="_fc-form-tree"
        :data="list"
        :indent="5"
    >
        <template #default="{ node, data }">
            <div class="_fc-form-node">
                <div class="_fc-form-node-label">
                    <i class="fc-icon icon-form" v-if="node.isLeaf"></i>
                    <i class="fc-icon icon-folder" v-else></i>
                    <div>
                        <div>{{ data.label }}</div>
                        <span class="_fc-form-node-info" v-if="data.info">{{ data.info }}</span>
                    </div>
                </div>
                <i class="fc-icon icon-edit" v-if="node.isLeaf && !data.disabled" @click.stop="nodeClick(data)"></i>
            </div>
        </template>
    </el-tree>
</template>

<script>
import {defineComponent} from 'vue';
import {ElLoading} from 'element-plus';

export default defineComponent({
    name: 'FormList',
    inject: ['designer'],
    props: {
        list: Array
    },
    data() {
        return {
            loading: false,
            timerId: undefined,
            load: undefined,
        };
    },
    methods: {
        loadConfig(config, data) {
            this.designer.setupState.openInputData(false);
            this.designer.setupState.pageData = [];
            this.designer.setupState.setOptions(config.options);
            this.designer.setupState.setRule(config.rule);
            this.designer.emit('switchForm', data);
        },
        starLoad() {
            if (!this.loading) {
                this.load = ElLoading.service({
                    target: document.getElementsByClassName('_fc-m-drag')[0],
                    lock: true,
                });
                this.loading = true;
                this.timerId = setTimeout(() => {
                    this.endLoad();
                }, 5000);
            }
        },
        endLoad() {
            this.loading = false;
            this.load && this.load.close();
            this.timerId && clearTimeout(this.timerId);
            this.load = undefined;
            this.timerId = undefined;
        },
        nodeClick(data) {
            if (this.loading) {
                return;
            }
            let config = {
                rule: data.rule || [],
                options: data.options || {}
            }
            if (data.load) {
                const value = data.load(data);
                if (value && value.then) {
                    this.starLoad();
                    value.then(res => {
                        if (res.rule) {
                            config.rule = res.rule;
                        }
                        if (res.options) {
                            config.options = res.options;
                        }
                        this.loadConfig(config, data);
                        this.endLoad();
                    }).catch(e => {
                        this.endLoad();
                    });
                    return;
                } else if (value) {
                    if (value.rule) {
                        config.rule = value.rule;
                    }
                    if (value.options) {
                        config.options = value.options;
                    }
                }
            }
            this.loadConfig(config, data);
        }
    }
});
</script>

<style>
._fc-l ._fc-form-tree .el-tree-node__content {
    display: flex;
    flex: 1;
    color: var(--fc-text-color-1);
    height: auto;
    padding: 5px 0;
}

._fc-form-tree .el-tree-node__content:hover {
    background-color: var(--fc-style-bg-color-1);
    color: var(--fc-style-color-1);
}

._fc-form-tree .fc-icon {
    margin-right: 5px;
    font-size: 18px;
    color: var(--fc-style-color-1);
}

._fc-form-tree .icon-folder {
    color: #FFBA00;
}

._fc-form-node {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    padding-right: 12px;
}

._fc-form-node-label {
    display: flex;
    align-items: flex-start;
    white-space: normal;
    user-select: none;
}

._fc-form-node-info {
    font-size: 12px;
    color: var(--fc-text-color-2);
}
</style>
