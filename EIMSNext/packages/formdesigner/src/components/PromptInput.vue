<template>
    <el-input :size="size" v-model="value" @blur="onInput" clearable class="_fd-list-input">
        <template #append>
            <el-dropdown size="default" trigger="click" :popper-class="popperClass">
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
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'PromptInput',
    emits: ['update:modelValue', 'change'],
    props: {
        size: String,
        modelValue: String,
        popperClass: String,
        options: Array,
    },
    data() {
        return {
            value: this.modelValue || '',
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
._fd-list-input {
    width: 100%;
}

._fd-list-input .el-input-group__append {
    padding: 0 10px;
}

._fd-list-input .fc-icon {
    cursor: pointer;
}
</style>
