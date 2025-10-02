<template>
    <div class="_fd-step-form-item">
        <div v-show="stepForm.activeId === formCreateInject.rule._fc_id">
            <slot/>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'StepFormItemView',
    props: {
        title: String,
        description: String,
        formCreateInject: Object,
    },
    inject: ['stepForm'],
    data() {
        return {};
    },
    created() {
        const idx = this.stepForm.formCreateInject.children.indexOf(this.formCreateInject.rule);
        this.stepForm.stepItemRef.splice(idx, 0, this);
    },
    unmounted() {
        this.stepForm.stepItemRef.splice(this.stepForm.stepItemRef.indexOf(this), 1);
    },
    methods: {},
});
</script>

<style>
._fd-step-form-item > ._fd-drag-tool {
    min-height: 200px;
}
</style>
