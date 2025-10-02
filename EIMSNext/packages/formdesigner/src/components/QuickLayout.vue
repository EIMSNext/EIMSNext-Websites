<template>
    <div class="_fd-quick-layout">
        <el-popover ref="pop" placement="bottom" :width="240" :hide-after="0" trigger="click">
            <template #reference>
                <div>
                    <el-tooltip
                        effect="dark"
                        :content="t('designer.layout')"
                        placement="top"
                        :hide-after="0"
                    >
                        <i class="fc-icon icon-layout"></i>
                    </el-tooltip>
                </div>
            </template>
            <div class="_fd-quick-layout-content">
                <template v-for="(item,idx) in layout">
                    <div @click="change(idx)">
                        <i class="fc-icon" :class="'icon-column' + (idx + 1)"></i>
                        <span>{{ item.label }}</span>
                    </div>
                </template>
            </div>
        </el-popover>
    </div>

</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'QuickLayout',
    inject: ['designer'],
    data() {
        return {}
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        layout() {
            return [{
                span: 24,
                label: this.t('designer.col1')
            }, {
                span: 12,
                label: this.t('designer.col2')
            }, {
                span: 8,
                label: this.t('designer.col3')
            }, {
                span: 6,
                label: this.t('designer.col4')
            }];
        }
    },
    methods: {
        check(rule) {
            if (rule?._menu?.subForm) {
                return false;
            }
            let ctx = rule.__fc__.parent;
            while (ctx) {
                if (ctx.rule?._menu?.menu === 'layout' ||ctx.rule?._menu?.subForm) {
                    return false;
                }
                ctx = ctx.parent;
            }
            return true;
        },
        change(idx) {
            const models = this.designer.setupState.dragForm.api.model();
            const span = this.layout[idx].span;
            let flag = false;
            Object.keys(models).forEach(key => {
                const rules = Array.isArray(models[key]) ? models[key] : [models[key]];
                rules.forEach(rule => {
                    if (this.check(rule)) {
                        if (!rule.col) {
                            rule.col = {};
                        }
                        flag = flag || rule.col.span !== span;
                        rule.col.span = span;
                    }
                });
            })
            this.$refs.pop.hide();
            if (flag) {
                this.designer.setupState.addOperationRecord();
            }
        }
    }
});
</script>

<style>
._fd-quick-layout-content {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    grid-column-gap: 10px;
}

._fd-quick-layout-content > div {
    display: flex;
    flex-direction: column;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
}

._fd-quick-layout-content > div:hover {
    color: var(--fc-style-color-1);
}

._fd-quick-layout-content i {
    font-size: 24px;
}
</style>
