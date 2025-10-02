<template>
    <div class="_fc-step-form">
        <van-steps :active="active" v-bind="stepsProps">
            <template v-for="step in steps">
                <van-step v-bind="step.props"> {{step.props.title}} </van-step>
            </template>
        </van-steps>
        <component :is="Form" :option="options" :rule="cacheRule" :extendOption="true"
                   :modelValue="modelValue"
                   @update:api="addSubApi" @emit-event="$emit" @update:modelValue="formData"></component>
        <van-row>
            <van-col :span="24" style="margin-top: 15px;">
                <van-button block size="small" v-if="active > 0" @click="onPrev">{{formCreateInject.t('prevStep') || '上一步'}}</van-button>
                <van-button block size="small" v-if="active < cacheRule.length - 1" type="primary" @click="onNext">{{formCreateInject.t('nextStep') || '下一步'}}</van-button>
                <van-button block size="small" class="fc-clock" v-if="active === cacheRule.length - 1" type="primary" @click="submit"
                style="margin-top: 10px">{{formCreateInject.t('submit') || '提交'}}
                </van-button>
            </van-col>
        </van-row>
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

._fc-step-form .van-step  {
    line-height: 1.4;
    text-align: left;
}
</style>
