<template>
    <div class="_fd-validate">
        <template v-for="(item, idx) in validate">
            <div class="_fd-validate-item">
                <div class="_fd-validate-title">
                    <div>
                        <span>{{ idx + 1 }}</span>
                        {{ modes[item.mode] }}
                    </div>
                    <i class="fc-icon icon-delete-circle" @click="remove(idx)"></i>
                </div>
                <el-row>
                    <el-col :span="getSpan(item)">
                        <el-form-item :label="t('validate.mode')">
                            <el-select v-model="item.trigger" @change="onInput">
                                <el-option v-for="item in triggers" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="getSpan(item)">
                        <el-form-item :label="modes[item.mode]">
                            <template v-if="item.mode === 'pattern'">
                                <PatternInput v-model="item[item.mode]" @change="onInput"></PatternInput>
                            </template>
                            <template v-else-if="item.mode === 'validator'">
                                <FnInput v-model="item[item.mode]" name="validator"
                                    :args="['rule', 'value', 'callback']" @change="onInput">{{
                                    t('validate.modes.validator') }}
                                </FnInput>
                            </template>
                            <template v-else>
                                <el-input-number v-model="item[item.mode]" @change="onInput"></el-input-number>
                            </template>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item :label="t('validate.message')">
                            <LanguageInput v-model="item.message" :placeholder="t('validate.requiredPlaceholder')"
                                @change="onInput">
                            </LanguageInput>
                        </el-form-item>
                    </el-col>
                </el-row>
            </div>
        </template>

        <el-dropdown trigger="click" size="default" popper-class="_fd-validate-pop" @command="handleCommand">
            <el-button class="_fd-validate-btn _fd-plain-button" plain>{{ t('validate.rule') }} +
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item :command="value" v-for="(label, value) in modes" :key="value">
                        <div>{{ label }}</div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { localeOptions } from '../utils';
import PatternInput from './computed/PatternInput.vue';
import FnInput from './FnInput.vue';
import { deepCopy } from '@eimsnext/form-render-core';
import LanguageInput from './language/LanguageInput.vue';

export default defineComponent({
    name: 'Validate',
    inject: ['designer'],
    emits: ['update:modelValue'],
    props: {
        modelValue: Array,
    },
    components: {
        LanguageInput,
        FnInput,
        PatternInput,
    },
    watch: {
        modelValue(n) {
            this.validate = this.parseValue(n || []);
        }
    },
    data() {
        return {
            validate: this.parseValue(this.modelValue || []),
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        modes() {
            const activeRule = this.designer.setupState.activeRule;
            if (activeRule && activeRule._menu.subForm === 'object') {
                return {
                    validator: this.t('validate.modes.validator'),
                }
            } else {
                return {
                    // min: this.t('validate.modes.min'),
                    // max: this.t('validate.modes.max'),
                    // len: this.t('validate.modes.len'),
                    pattern: this.t('validate.modes.pattern'),
                    validator: this.t('validate.modes.validator'),
                }
            }
        },
        triggers() {
            return localeOptions(this.t, [
                { label: 'blur', value: 'blur' },
                { label: 'change', value: 'change' },
                { label: 'submit', value: 'submit' },
            ]);
        }
    },
    methods: {
        handleCommand(mode) {
            this.validate.push({
                transform: new Function('val', 'this.type = val == null ? \'string\' : (Array.isArray(val) ? \'array\' : (typeof val)); return val;'),
                mode,
                trigger: 'blur'
            });
        },
        autoMessage(item) {
            const title = this.designer.setupState.activeRule.title;
            if (this.designer.setupState.activeRule) {
                item.message = this.t('validate.autoRequired', { title })
                this.onInput();
            }
        },
        getSpan(item) {
            return ['pattern', 'validator', 'required'].indexOf(item.mode) > -1 ? 24 : 12;
        },
        onInput: function () {
            this.$emit('update:modelValue', this.validate.map(item => {
                item = { ...item };
                if (!item.message) {
                    delete item.message;
                }
                return item;
            }));
        },
        remove(idx) {
            this.validate.splice(idx, 1);
            this.onInput();
        },
        parseValue(val) {
            return deepCopy(val.map(v => {
                if (v.validator) {
                    v.mode = 'validator';
                }
                if (!v.mode) {
                    Object.keys(v).forEach(k => {
                        if (['message', 'type', 'trigger', 'mode'].indexOf(k) < 0) {
                            v.mode = k;
                        }
                    });
                }
                return v;
            }));
        }
    }
});
</script>

<style>
._fd-validate {
    display: flex;
    flex-direction: column;
    width: 100%;
}

._fd-validate-btn {
    font-weight: 400;
    width: 100%;
}

._fd-validate-pop .el-dropdown-menu__item {
    width: 248px;
}

._fd-validate-item {
    border-bottom: 1px dashed var(--fc-line-color-3);
    margin-bottom: 10px;
}

._fd-validate-item .el-col-12:first-child {
    padding-right: 5px;
}

._fd-validate-item .el-col-12+.el-col-12 {
    padding-left: 5px;
}

._fd-validate-item .el-input-number {
    width: 100%;
}

._fd-validate-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
}

._fd-validate-title>div {
    display: flex;
    align-items: center;
}

._fd-validate-title>div>span {
    width: 16px;
    height: 16px;
    background: var(--fc-bg-color-3);
    text-align: center;
    font-size: 12px;
    line-height: 16px;
    border-radius: 15px;
    margin-right: 5px;
}

._fd-validate-title i {
    cursor: pointer;
}

._fd-validate-title i:hover {
    color: var(--fc-style-color-3);
}

._fd-validate .append-msg {
    cursor: pointer;
}

._fd-validate .el-input-group__append {
    padding: 0 10px;
}
</style>
