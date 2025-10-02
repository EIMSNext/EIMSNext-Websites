<script>
import {createElementVNode, createVNode, defineComponent, Fragment, shallowRef} from 'vue';
import { deepCopy} from '@eimsnext/form-render-core';

export default defineComponent({
    name: 'FcJsonView',
    inheritAttrs: false,
    inject: ['designer'],
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
            let child = null;
            if (this.type === 'object') {
                child = createVNode(this.fcSubForm, {
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
                child = createVNode(this.fcGroup, {
                    key: 3,
                    ...this.$attrs,
                    modelValue: this.modelValue,
                    'onUpdate:modelValue': (val) => {
                        this.$emit('update:modelValue', val);
                    },
                    sortBtn: this.sortBtn,
                    expand: 1,
                    button: this.button,
                    disabled: this.disabled,
                    formCreateInject: this.formCreateInject,
                    rule: this.formRule,
                    options: this.formOptions,
                })
            } else {
                child = createVNode(Fragment, {
                    key: 1,
                }, [this.$slots?.default?.()]);
            }
            return createElementVNode('div', {
                key: this.uni,
                style: {'--fc-json-mask': `'${this.designer.setupState.t('com.fcJson.name')}'`},
                class: '_fd-json-container',
            }, [child])
        } else {
            return createElementVNode('div', {
                class: '_fd-slot-empty',
                innerHTML: this.designer.setupState.t('com.fcJson.empty', {tag: '<span>JSON</span>'})
            });
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

<style>
._fd-json-container {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    flex: 1;
    min-height: 20px;
    position: relative;
    --fc-json-mask: ' ';
}

._fd-json-container ._fd-dialog, ._fd-json-container ._fd-drawer, ._fd-json-container ._fd-popup {
    display: none;
}
</style>