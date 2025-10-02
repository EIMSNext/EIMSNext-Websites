<template>
    <div class="_fd-page-input">
        <template v-for="(page, index) in pageData" :key="page.main ? page.main.name : ''">
            <div class="_fd-page-item" :class="{active: page === activePage}" @click="$emit('change', index)">
                <div>
                    <div class="_fd-page-label">
                        <span>{{ getPageLabel(page) }}</span>
                        <i class="fc-icon icon-yes" v-if="page === activePage"></i>
                    </div>
                    <div class="_fd-page-id" v-if="page.main">
                        ID：{{ page.main.name }} <i @click.stop="copy(page.main.name)" class="fc-icon icon-group"></i>
                    </div>
                </div>
                <div class="_fd-page-btns" v-if="!page.default">
                    <div class="_fd-page-copy" @click.stop="$emit('copy', index)">
                        <i class="fc-icon icon-copy"></i>
                    </div>
                    <div class="_fd-page-del" @click.stop="$emit('delete', index)">
                        <i class="fc-icon icon-delete"></i>
                    </div>
                </div>
            </div>
        </template>
        <el-dropdown size="default" trigger="click">
            <el-button link type="primary">
                {{ t('designer.addPage') }}<i class="fc-icon icon-down"></i>
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="item in containerList" :key="item.name"
                                      @click="$emit('add', item.name)">
                        {{ getPageName(item) }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import {copyTextToClipboard, deepGet} from '../utils';

export default defineComponent({
    name: 'PageInput',
    inject: ['designer'],
    emits: ['add', 'delete', 'change'],
    computed: {
        activePage() {
            return this.designer.setupState.activePage;
        },
        pageData() {
            return this.designer.setupState.pageData;
        },
        t() {
            return this.designer.setupState.t;
        },
        containerList() {
            const dragRuleList = this.designer.setupState.dragRuleList;
            return Object.keys(dragRuleList).map(k => {
                if (dragRuleList[k].container) {
                    return dragRuleList[k];
                }
            }).filter(item => !!item);
        }
    },
    methods: {
        copy(name) {
            copyTextToClipboard(name);
        },
        getPageName(item) {
            return this.t('com.' + item.name + '.name') || item.label
        },
        getPageLabel(page) {
            return page.default ? this.t('designer.main') : (deepGet(page.main, page.config.labelField, '') || this.getPageName(page.main._menu));
        },
    }
});
</script>

<style>
._fd-page-item {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    padding: 12px 0;
    margin: 0 12px;
    height: 30px;
    cursor: pointer;
    font-size: 12px;
    border-bottom: 1px solid var(--fc-line-color-3);
    box-sizing: content-box;
}

._fd-page-item.active ._fd-page-label {
    color: var(--fc-style-color-1);
}

._fd-page-btns{
    display: flex;
}

._fd-page-label {
    font-weight: 600;
    color: var(--fc-text-color-1);
}

._fd-page-label .fc-icon {
    margin-left: 5px;
    font-size: 12px;
}

._fd-page-id {
    display: flex;
    align-items: center;
    color: var(--fc-text-color-3);
    font-weight: 400;
}

._fd-page-id .fc-icon {
    margin-left: 5px;
}

._fd-page-id .fc-icon:hover {
    color: var(--fc-style-color-1);
}

._fd-page-input .el-button {
    font-weight: 400;
    font-size: 12px;
    margin-left: 12px;
    margin-top: 12px;
    color: var(--fc-style-color-1);
}

._fd-page-input .el-button .fc-icon {
    margin-left: 5px;
    font-size: 12px;
}

._fd-page-del {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-left: 4px;
    border-radius: 25px;
    background-color: var(--fc-style-bg-color-3);
}

._fd-page-del .fc-icon {
    color: var(--fc-style-color-3);
    font-size: 14px;
}

._fd-page-copy {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 25px;
    background-color: var(--fc-style-bg-color-1);
}

._fd-page-copy .fc-icon {
    color: var(--fc-style-color-1);
    font-size: 14px;
}
</style>
