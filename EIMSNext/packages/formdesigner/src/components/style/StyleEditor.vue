<template>
    <div class="_fd-style-editor">
        <div ref="editor"></div>
    </div>
</template>

<script>
import 'codemirror/lib/codemirror.css';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/css/css';
import {defineComponent, markRaw} from 'vue';
import beautify from 'js-beautify';

export default defineComponent({
    name: 'StyleEditor',
    props: {
        modelValue: String,
    },
    data() {
        return {
            editor: null,
            oldVal: null,
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.load();
        });
    },
    methods: {
        load() {
            const val = this.modelValue;
            this.oldVal = val;
            this.$nextTick(() => {
                this.editor = markRaw(CodeMirror(this.$refs.editor, {
                    lineNumbers: true,
                    mode: 'css',
                    lint: true,
                    line: true,
                    tabSize: 2,
                    lineWrapping: true,
                    value: val ? beautify.css(val, {
                        indent_size: 2,
                        indent_char: ' ',
                        indent_scripts: 'separate',
                    }) : '',
                }));
            });
        },
        save() {
            const str = this.editor.getValue();
            if (str !== this.oldVal) {
                this.$emit('update:modelValue', str);
            }
            return true;
        },
    }
});
</script>

<style>
._fd-style-editor {
    flex: 1;
    width: 100%;
}

._fd-style-editor .CodeMirror, ._fd-style-editor > div {
    height: 100%;
}
</style>
