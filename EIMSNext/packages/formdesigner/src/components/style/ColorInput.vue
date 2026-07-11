<template>
    <div class="_fd-color-input" :class="{'_fd-color-input-swatch': swatch}">
        <template v-if="swatch">
            <el-color-picker show-alpha color-format="hex" :predefine="predefineColors" v-model="value"/>
            <button v-if="showReset" type="button" class="_fd-color-reset" @click.stop="resetValue">
                <i class="fc-icon icon-refresh"></i>
            </button>
        </template>
        <el-input v-else clearable v-model="value">
            <template #append>
                <el-color-picker show-alpha color-format="hex" :predefine="predefineColors" v-model="value"/>
            </template>
        </el-input>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

const normalizeValue = (value, swatch, defaultColor) => {
    if (swatch && defaultColor && !value) {
        return defaultColor;
    }
    return value || '';
};

export default defineComponent({
    name: 'ColorInput',
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: String,
        swatch: Boolean,
        defaultColor: String,
        showReset: Boolean,
        colors: {
            type: Array,
            default: null,
        },
    },
    computed: {
        predefineColors() {
            return this.colors && this.colors.length ? this.colors : this.predefine;
        },
    },
    watch: {
        modelValue() {
            this.value = normalizeValue(this.modelValue, this.swatch, this.defaultColor);
        },
        value(n) {
            const value = normalizeValue(n, this.swatch, this.defaultColor);
            if (value !== n) {
                this.value = value;
                return;
            }
            this.$emit('update:modelValue', n);
            this.$emit('change', n);
        },
    },
    data() {
        return {
            value: normalizeValue(this.modelValue, this.swatch, this.defaultColor),
            predefine: [
                '#c9e6fc',
                '#c3f2f2',
                '#c2f1d2',
                '#fef6c6',
                '#ffe5c2',
                '#fdcac2',
                '#fadcce',
                '#dec2fa',
                '#ccd2f1',
                '#2196f3',
                '#08c9c9',
                '#00c344',
                '#fad714',
                '#ff9300',
                '#f52222',
                '#eb2f96',
                '#800080',
                '#7500ea',
                '#2d46c4',
                '#000000',
                '#333333',
                '#5a5a5a',
                '#757575',
                '#9e9e9e',
                '#bdbdbd',
                '#dddddd',
                '#f5f5f5',
                '#ffffff',
            ]
        }
    },
    methods: {
        resetValue() {
            this.value = this.defaultColor || '';
        }
    },
    created() {
    }

});
</script>

<style>
._fd-color-input {
    width: 150px;
}

._fd-color-input-swatch {
    position: relative;
    width: 196px;
    height: 28px;
    padding: 3px;
    box-sizing: border-box;
    border: 1px solid var(--fc-line-color-2);
    border-radius: 2px;
    background: var(--fc-bg-color-1);
}

._fd-color-input-swatch .el-color-picker {
    display: block;
    width: 100%;
    height: 100%;
}

._fd-color-input-swatch .el-color-picker__trigger {
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0 none;
    border-radius: 0;
}

._fd-color-input-swatch .el-color-picker__color {
    border: 0 none;
    border-radius: 0;
}

._fd-color-input-swatch .el-color-picker__color-inner {
    border-radius: 0;
}

._fd-color-input-swatch .el-color-picker__icon {
    display: none;
}

._fd-color-reset {
    position: absolute;
    right: 5px;
    top: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0 none;
    border-radius: 50%;
    background: transparent;
    color: var(--fc-bg-color-1);
    cursor: pointer;
}

._fd-color-reset i {
    font-size: 14px;
    line-height: 1;
}

._fd-color-input .el-input .el-color-picker {
    margin: 0;
}

._fd-color-input .el-input .el-input-group__append {
    padding: 0;
    width: 24px;
}

._fd-color-input .el-input .el-color-picker__trigger {
    border-left: 0 none;
    border-radius: 0px 3px 3px 0px;
}
</style>
