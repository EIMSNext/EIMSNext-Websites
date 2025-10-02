<template>
    <div class="_fc-step-form">
        <el-steps :active="active" v-bind="stepsProps">
            <template v-for="step in steps">
                <el-step v-bind="step.props"/>
            </template>
        </el-steps>
        <component :is="Form" :option="options" :rule="cacheRule" :extendOption="true"
                   :modelValue="modelValue"
                   @update:api="addSubApi" @emit-event="$emit" @update:modelValue="formData"></component>
        <el-row>
            <el-col :span="24" style="display: flex;justify-content: flex-end;margin-top: 15px;">
                <el-button v-if="active > 0" @click="onPrev">{{formCreateInject.t('prevStep') || '上一步'}}</el-button>
                <el-button v-if="active < cacheRule.length - 1" type="primary" @click="onNext">{{formCreateInject.t('nextStep') || '下一步'}}</el-button>
                <el-button class="fc-clock" v-if="active === cacheRule.length - 1" type="primary" @click="submit">
                    {{formCreateInject.t('submit') || '提交'}}
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {defineComponent, markRaw, reactive} from 'vue';

const getFields = (children) => {
    const fields = [];
    children.forEach(rule => {
        if (rule.field) {
            fields.push(rule.field);
        }
        if (rule.children) {
            fields.push(...getFields(rule.children))
        }
    });
    return fields;
}

export default defineComponent({
    name: 'StepForm',
    props: {
        stepsProps: Object,
        modelValue: Object,
        formCreateInject: Object,
        autoValidate: Boolean,
        steps: {
            type: Array,
            required: true,
            default: () => []
        },
        options: {
            type: Object,
            default: () => reactive(({
                submitBtn: false,
                resetBtn: false,
            }))
        },
    },
    emits: ['update:modelValue', 'change', 'itemMounted', 'submit', 'next'],
    data() {
        return {
            active: 0,
            cacheRule: [],
            cacheValue: {},
            subApi: {},
            Form: markRaw(this.formCreateInject.form.$form()),
        };
    },
    watch: {
        active() {
            this.init();
        },
        modelValue(n) {
            this.setValue(n);
        }
    },
    methods: {
        init() {
            this.steps.forEach((item, index) => {
                if (this.cacheRule[index]) {
                    this.cacheRule[index].display = index === this.active;
                } else {
                    this.cacheRule[index] = {
                        type: 'FcRow',
                        native: true,
                        display: index === this.active,
                        children: item.rule
                    }
                }
            });
        },
        onPrev() {
            this.active--;
        },
        validate() {
            return new Promise((resolve, reject) => {
                const fields = getFields(this.cacheRule[this.active].children);
                fields.length > 0 ? (Promise.all(fields.map(field=>{
                    return this.subApi.validateField(field);
                })).then(() => {
                    resolve()
                }).catch((e) => {
                    reject(e);
                })) : resolve();
            })
        },
        onNext() {
            if (this.autoValidate) {
                this.validate().then(() => {
                    this.active++;
                }).catch((e) => {
                });
            } else {
                this.active++;
            }
            this.$emit('next', {active: this.active, api: this.subApi});
        },
        submit() {
            const fn = () => {
                this.$emit('submit', this.subApi.formData(), this.subApi)
            };
            if (this.autoValidate) {
                this.validate().then(() => {
                    fn()
                }).catch((e) => {
                    this.$emit('validateFail', this.subApi)
                });
            } else {
                fn();
            }
        },
        addSubApi(api) {
            this.subApi = api;
            this.$emit('itemMounted', api);
        },
        formData(value) {
            this.cacheValue = JSON.stringify(value);
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
        setValue(value) {
            const str = JSON.stringify(value);
            if (this.cacheValue === str) {
                return;
            }
            this.cacheValue = str;
            this.subApi.coverValue(value || {});
        },
    },
    created() {
        this.init();
    }
});
</script>

<style>
._fc-step-form {
    width: 100%;
}

._fc-step-form > .el-steps {
    margin-bottom: 20px;
}

._fc-step-form .el-step .el-step__head {
    line-height: 1.4;
}
</style>
