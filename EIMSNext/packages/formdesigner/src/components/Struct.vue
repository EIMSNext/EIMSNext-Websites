<template>
    <div class="_fd-struct">
        <el-badge type="warning" is-dot :hidden="!configured">
            <div @click="visible = true">
                <slot>
                    <el-button class="_fd-plain-button" plain>
                        {{ title || t('struct.title') }}
                    </el-button>
                </slot>
            </div>
        </el-badge>
        <el-dialog class="_fd-struct-dialog _fd-config-dialog" :title="title || t('struct.title')" v-model="visible"
            destroy-on-close :close-on-click-modal="false" append-to-body width="800px">
            <div ref="editor" v-if="visible"></div>
            <template #footer>
                <div>
                    <el-button @click="visible = false" size="default">{{ t('props.cancel') }}</el-button>
                    <el-button type="primary" @click="onOk" size="default">{{ t('props.ok') }}</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import 'codemirror/lib/codemirror.css';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/javascript/javascript';
import { deepParseFn, toJSON } from '../utils/index';
import { deepCopy, is } from '@eimsnext/form-render-core';
import { defineComponent, markRaw } from 'vue';
import errorMessage from '../utils/message';
import beautify from 'js-beautify';

export default defineComponent({
    name: 'Struct',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Object, Array, Function],
        title: String,
        defaultValue: {
            require: false
        },
        validate: Function,
    },
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !is.empty(this.modelValue) && Object.keys(this.modelValue).length > 0;
        },
    },
    data() {
        return {
            editor: null,
            visible: false,
            oldVal: null,
        };
    },
    watch: {
        modelValue() {
            this.load();
        },
        visible(n) {
            if (n) {
                this.load();
            }
        },
    },
    methods: {
        load() {
            const val = toJSON(deepParseFn(this.modelValue ? deepCopy(this.modelValue) : this.defaultValue));
            this.oldVal = val;
            this.$nextTick(() => {
                this.editor = markRaw(CodeMirror(this.$refs.editor, {
                    lineNumbers: true,
                    mode: 'javascript',
                    lint: true,
                    line: true,
                    tabSize: 2,
                    lineWrapping: true,
                    value: val ? beautify.js(val, {
                        indent_size: '2',
                        indent_char: ' ',
                        max_preserve_newlines: '5',
                        indent_scripts: 'separate',
                    }) : '',
                }));
            });
        },
        onOk() {
            const str = (this.editor.getValue() || '').trim();
            let val;
            try {
                val = (new Function('return ' + str))();
            } catch (e) {
                console.error(e);
                errorMessage(this.t('struct.errorMsg'));
                return false;
            }
            if (this.validate && false === this.validate(val)) {
                errorMessage(this.t('struct.errorMsg'));
                return false;
            }
            this.visible = false;
            if (toJSON(val, null, 2) !== this.oldVal) {
                this.$emit('update:modelValue', val);
            }
            return true;
        },
    }
});
</script>

<style>
._fd-struct {
    width: 100%;
}

._fd-struct .el-badge {
    width: 100%;
}

._fd-struct .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-struct-dialog .CodeMirror {
    height: 500px;
}

._fd-struct-dialog .el-dialog__body {
    padding: 0px;
}
</style>
