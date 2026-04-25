<template>
    <el-tooltip
        effect="dark"
        placement="top-start"
        popper-class="_fd-warning-pop"
    >
        <template #content>
            <span v-html="tooltip"></span>
        </template>
        <span class="_fd-warning-trigger">
            <span v-if="$slots.default" class="_fd-warning-text">
                <slot></slot>
            </span>
            <i v-else class="fc-icon icon-question"></i>
        </span>
    </el-tooltip>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'Warning',
    props: {
        tooltip: String,
    },
    data() {
        return {}
    },
});
</script>

<style>
._fd-warning-pop {
    max-width: 400px;
}

._fd-warning-text {
    text-decoration: underline;
    text-decoration-style: dashed;
    cursor: help;
}

._fd-warning-trigger {
    align-items: center;
    display: inline-flex;
}
</style>
