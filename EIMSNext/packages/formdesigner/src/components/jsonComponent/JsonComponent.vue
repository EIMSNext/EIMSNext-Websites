<script>
import {createVNode, defineComponent, Fragment, shallowRef} from 'vue';
import { deepCopy} from '@eimsnext/form-render-core';

export default defineComponent({
    name: 'FcJson',
    inheritAttrs: false,
    props: {
        rule: [Array, String, Object],
        type: String,
        disabled: Boolean,
        expand: Number,
        button: {
            type: Boolean,
            default: true
        },
        max: {
            type: Number,
            default: 0
        },
        min: {
            type: Number,
            default: 0
        },
        sortBtn: {
            type: Boolean,
            default: true
        },
        modelValue: [Object, Array],
        formCreateInject: Object,
    },
    data() {
        return {
            fcSubForm: shallowRef(this.formCreateInject.form.component('fcSubForm')),
            fcGroup: shallowRef(this.formCreateInject.form.component('fcGroup')),
            uni: 0,
            formRule: [],
            formOptions: {
                submitBtn: false,
                resetBtn: false,
            },
        }
    },
    watch: {
        rule() {
            this.uni++;
            this.loadRule();
        },
        type() {
            this.loadRule();
        },
    },
    render() {
        if (this.rule) {
            if (this.type === 'object') {
                return createVNode(this.fcSubForm, {
                    key: 2,
                    ...this.$attrs,
                    modelValue: this.modelValue,
                    'onUpdate:modelValue': (val) => {
                        this.$emit('update:modelValue', val);
                    },
                    disabled: this.disabled,
                    formCreateInject: this.formCreateInject,
                    rule: this.formRule,
                    options: this.formOptions,
                })
            } else if (this.type === 'array') {
                return createVNode(this.fcGroup, {
                    key: 3,
                    ...this.$attrs,
                    modelValue: this.modelValue,
                    'onUpdate:modelValue': (val) => {
                        this.$emit('update:modelValue', val);
                    },
                    sortBtn: this.sortBtn,
                    min: this.min,
                    max: this.max,
                    expand: this.expand,
                    button: this.button,
                    disabled: this.disabled,
                    formCreateInject: this.formCreateInject,
                    rule: this.formRule,
                    options: this.formOptions,
                })
            }
            return createVNode(Fragment, {
                key: this.uni,
            }, [this.$slots?.default?.()]);
        }
    },
    methods: {
        loadRule() {
            let rule = deepCopy(this.rule);
            if (typeof rule === 'string') {
                rule = this.formCreateInject.form.parseJson(rule);
            }
            if (Array.isArray(rule)) {
                this.formRule = rule;
            } else if (typeof rule === 'object') {
                this.formRule = rule.rule || [];
                this.formOptions = {
                    ...{
                        submitBtn: false,
                        resetBtn: false,
                    }, ...rule.options || {}
                };
            }
            if (rule != null) {
                if (['array', 'object'].indexOf(this.type) === -1) {
                    this.formCreateInject.rule.children = [
                        {
                            type: 'template',
                            _fc_drag_skip: true,
                            children: this.formRule,
                        }
                    ];
                }
            } else {
                this.formCreateInject.rule.children = [];
            }
        },
    },
    created() {
        this.rule && this.loadRule();
    }
});
</script>