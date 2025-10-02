<template>
    <div class="_fd-pattern-input">
        <el-input :size="size" v-model="value" @blur="onInput" clearable>
            <template #append>
                <el-dropdown size="default" trigger="click" popper-class="_fd-pattern-popper">
                    <i class="fc-icon icon-setting"></i>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="item in options" :key="item.value" @click="setValue(item.value)">
                                {{ item.label }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </template>
        </el-input>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'PatternInput',
    emits: ['update:modelValue', 'change'],
    props: {
        size: String,
        modelValue: String,
    },
    data() {
        return {
            value: this.modelValue || '',
            options: [
                {
                    label: '邮箱',
                    value: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$'
                },
                {
                    label: '域名',
                    value: '^((http:\\/\\/)|(https:\\/\\/))?([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}(\\/)$'
                },
                {
                    label: '手机号',
                    value: '^(?:(?:\\+|00)86)?1[3-9]\\d{9}$'
                },
                {
                    label: '座机电话',
                    value: '^(?:(?:\\d{3}-)?\\d{8}|^(?:\\d{4}-)?\\d{7,8})(?:-\\d+)?$'
                },
                {
                    label: '身份证号',
                    value: '^[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\\d|30|31)\\d{3}[\\dXx]$'
                },
                {
                    label: '银行卡号',
                    value: '^[1-9]\\d{9,29}$'
                },
                {
                    label: '车牌号',
                    value: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$'
                },
                {
                    label: '中文',
                    value: '^(?:[\\u3400-\\u4DB5\\u4E00-\\u9FEA\\uFA0E\\uFA0F\\uFA11\\uFA13\\uFA14\\uFA1F\\uFA21\\uFA23\\uFA24\\uFA27-\\uFA29]|[\\uD840-\\uD868\\uD86A-\\uD86C\\uD86F-\\uD872\\uD874-\\uD879][\\uDC00-\\uDFFF]|\\uD869[\\uDC00-\\uDED6\\uDF00-\\uDFFF]|\\uD86D[\\uDC00-\\uDF34\\uDF40-\\uDFFF]|\\uD86E[\\uDC00-\\uDC1D\\uDC20-\\uDFFF]|\\uD873[\\uDC00-\\uDEA1\\uDEB0-\\uDFFF]|\\uD87A[\\uDC00-\\uDFE0])+$'
                },
                {
                    label: '数字',
                    value: '^\\d+$'
                },
                {
                    label: '整数',
                    value: '^(?:0|(?:-?[1-9]\\d*))$'
                },
                {
                    label: '正整数',
                    value: '^\\+?[1-9]\\d*$'
                },
                {
                    label: '负整数',
                    value: '^-[1-9]\\d*$'
                },
                {
                    label: '浮点数',
                    value: '^(-?[1-9]\\d*\\.\\d+|-?0\\.\\d*[1-9])$'
                },
                {
                    label: '正浮点数',
                    value: '^([1-9]\\d*\\.\\d+|-?0\\.\\d*[1-9])$'
                },
                {
                    label: '负浮点数',
                    value: '^-([1-9]\\d*\\.\\d+|-?0\\.\\d*[1-9])$'
                },
                {
                    label: '英文字母',
                    value: '^[a-zA-Z]+$'
                },
                {
                    label: '数字和字母',
                    value: '^[A-Za-z0-9]+$'
                },
            ]
        }
    },
    methods: {
        setValue(val) {
            this.value = val;
            this.onInput();
        },
        onInput() {
            this.$emit('update:modelValue', this.value);
            this.$emit('change', this.value);
        },
    },


});
</script>

<style>
._fd-pattern-input {
    width: 100%;
}

._fd-pattern-input .el-input-group__append {
    padding: 0 10px;
}

._fd-pattern-input .fc-icon {
    cursor: pointer;
}

._fd-pattern-popper .el-dropdown__list {
    height: 350px;
    overflow: auto;
}
</style>
