<template>
    <div class="_fd-selection-process-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible = true">
                <slot>
                    {{ btn || '设置' }}
                </slot>
            </el-button>
        </el-badge>
        <el-dialog class="_fd-selection-process-dialog _fd-config-dialog" :title="title || '数据选择过程设置'" v-model="visible" destroy-on-close :close-on-click-modal="false" append-to-body width="800px">
            <el-main>
                <div class="_fd-selection-process-content">
                    <!-- 将来这里会显示具体的配置内容 -->
                    <p>数据选择过程配置内容将在这里显示</p>
                </div>
            </el-main>
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
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'SelectionProcessConfig',
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: [String, Object, Array],
        title: String,
        btn: String,
    },
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !!this.modelValue;
        },
    },
    data() {
        return {
            visible: false,
            value: this.modelValue
        };
    },
    watch: {
        modelValue(n) {
            this.value = n;
        }
    },
    methods: {
        onOk() {
            this.$emit('update:modelValue', this.value);
            this.$emit('change', this.value);
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-selection-process-config {
    width: 100%;
}

._fd-selection-process-config .el-badge {
    width: 100%;
}

._fd-selection-process-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-selection-process-content {
    padding: 20px;
}
</style>