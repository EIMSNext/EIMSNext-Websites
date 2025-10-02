<template>
    <div class="_fd-hide-config" :class="{disabled: !!disabled, active: modelValue === activeValue}" @click="onInput">
        <template v-if="modelValue === activeValue">
            <i class="fc-icon icon-eye"></i> {{ t('props.show') }}
        </template>
        <template v-else>
            <i class="fc-icon icon-eye-close"></i> {{ t('props.hide') }}
        </template>
    </div>
</template>
<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'HideConfig',
    props: {
        modelValue: [String, Boolean, Number],
        activeValue: {
            type: [String, Boolean, Number],
            default: true,
        },
        inactiveValue: {
            type: [String, Boolean, Number],
            default: false,
        },
        disabled: Boolean,
    },
    events: ['update:modelValue'],
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        }
    },
    methods: {
        onInput() {
            if (!this.disabled) {
                this.$emit('update:modelValue', this.modelValue !== this.activeValue ? this.activeValue : this.inactiveValue);
            }
        }
    }
});
</script>

<style>
._fd-hide-config {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--fc-text-color-2);
}

._fd-hide-config .fc-icon {
    margin-right: 3px;
}

._fd-hide-config.active {
    color: var(--fc-style-color-1);
}

._fd-hide-config.disabled {
    color: var(--fc-text-color-3);
    cursor: not-allowed;
}

</style>
