<template>
    <div class="_fd-fetch-table">
        <el-container class="_fd-fetch-table-con" v-if="value.length > 0">
            <el-header>
                <div style="width: 40%">{{ t('props.key') }}</div>
                <div>{{ t('props.value') }}</div>
            </el-header>
            <el-main>
                <template v-for="(item, idx) in value" :key="idx">
                    <div class="_fd-fetch-table-row">
                        <div class="_fd-fetch-table-key">
                            <el-input v-model="item.key" @blur="(e)=>onBlur(item,e)">
                                <template #suffix>
                                    <VariableConfig popover
                                                    @confirm="(val) => onConfirm(item, 'key', val)"></VariableConfig>
                                </template>
                            </el-input>
                        </div>
                        <el-input v-model="item.value" @blur="(e)=>onBlur(item,e)">
                            <template #suffix>
                                <VariableConfig popover
                                                @confirm="(val) => onConfirm(item, 'value', val)"></VariableConfig>
                            </template>
                        </el-input>
                        <i class="fc-icon icon-delete-circle" @click="rm(idx)"></i>
                    </div>
                </template>
            </el-main>
        </el-container>
        <el-button link type="primary" @click="add">
            <i class="fc-icon icon-add"></i> {{ t('tableOptions.add') }}
        </el-button>
    </div>

</template>

<script>
import {defineComponent} from 'vue';
import VariableConfig from './computed/VariableConfig.vue';

export default defineComponent({
    name: 'FetchTable',
    components: {VariableConfig},
    inject: ['designer'],
    emits: ['update:modelValue'],
    props: {
        modelValue: Object,
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
    },
    data() {
        return {
            value: [],
            active: null,
            start: null,
        }
    },
    methods: {
        onConfirm(item, key, val) {
            if (item === this.active) {
                item[key] = (item[key] || '').substring(0, this.start) + val + (item[key] || '').substring(this.start);
            } else {
                item[key] += val;
                this.active = null;
                this.start = null;
            }
            this.submit();
        },
        onBlur(item, e) {
            this.active = item;
            this.start = e.target.selectionStart;
            this.submit();
        },
        submit() {
            const value = {};
            this.value.forEach(item => {
                if (item.key && item.value) {
                    value[item.key] = item.value;
                }
            });
            this.$emit('update:modelValue', value);
        },
        add() {
            this.value.push({});
        },
        rm(idx) {
            this.value.splice(idx, 1);
            this.submit();
        }
    },
    created() {
        const value = [];
        Object.keys(this.modelValue || {}).forEach(k => {
            value.push({
                key: k,
                value: this.modelValue[k]
            })
        });
        this.value = value;
    }
});
</script>

<style>
._fd-fetch-table {
    width: 100%;
}

._fd-fetch-table .el-button > span {
    font-size: 12px;
    font-weight: 400;
}

._fd-fetch-table-con {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
    border-bottom: 0 none;
}

._fd-fetch-table-con .el-header {
    display: flex;
    align-items: center;
    height: 30px;
    padding-left: 12px;
    background: var(--fc-bg-color-3);
    color: var(--fc-text-color-1);
}


._fd-fetch-table-row {
    display: flex;
    align-items: center;
    min-height: 34px;
    padding: 0 10px 4px;
    border-bottom: 1px solid var(--fc-line-color-3);;
}

._fd-fetch-table-row > .fc-icon {
    width: 24px;
    height: 24px;
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    font-size: 18px;
    color: var(--fc-text-color-2);
    cursor: pointer;
}


._fd-fetch-table-row .el-input {
    display: flex;
    flex: 1;
    margin-top: 4px;
    font-size: 13px;
}

._fd-fetch-table-key {
    margin-right: 15px;
    width: calc(40% - 20px);
}
</style>
