<template>
    <div class="_fd-step-form">
        <el-steps :active="active" v-bind="stepsProps">
            <template v-for="(ref, index) in formCreateInject.children" :key="ref._fc_id + index">
                <el-step @click.stop="change(index)" :title="ref.props.title" :description="ref.props.description"/>
            </template>
        </el-steps>
        <slot/>
        <el-row>
            <el-col :span="24" style="display: flex;justify-content: flex-end;padding: 15px;">
                <el-button v-if="active>0" @click.stop="onPrev">{{formCreateInject.t('prevStep') || '上一步'}}</el-button>
                <el-button v-if="active < stepItemRef.length-1" type="primary" @click.stop="onNext">{{formCreateInject.t('nextStep') || '下一步'}}</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'StepFormView',
    props: {
        stepsProps: Object,
        formCreateInject: Object,
    },
    provide() {
        return {
            stepForm: this
        }
    },
    inject: ['designer'],
    data() {
        return {
            active: undefined,
            activeId: undefined,
            stepItemRef: [],
            activeRef: undefined,
        };
    },
    watch: {
        'stepItemRef.length'() {
            if (!this.active || this.formCreateInject.children.indexOf(this.activeRef) === -1) {
                this.active = this.formCreateInject.children.length > 0 ? 0 : -1;
            }
        },
        active(n) {
            this.activeRef = this.formCreateInject.children[n];
            this.activeId = this.activeRef ? this.activeRef._fc_id : null;
        }
    },
    methods: {
        onPrev() {
            this.active--;
            this.triggerActive();
        },
        onNext() {
            this.active++;
            this.triggerActive();
        },
        change(index) {
            this.active = index;
            this.triggerActive();
        },
        triggerActive() {
            this.$nextTick(() => {
                this.designer.setupState.triggerActive(this.activeRef);
            })
        }
    },
    created() {
        this.$watch(() => [...this.formCreateInject.children], () => {
            if (this.activeRef) {
                this.active = this.formCreateInject.children.indexOf(this.activeRef);
            }
        })
    }
});
</script>

<style>
._fd-step-form {
    width: 100%;
}

._fd-step-form .el-step {
    cursor: pointer;
}

._fd-step-form > .el-steps {
    margin-bottom: 20px;
}

._fd-step-form .el-step .el-step__head {
    line-height: 1.4;
}
</style>
